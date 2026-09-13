const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const MOCK = path.join(__dirname, 'phase15-mocks');

require.extensions['.ts'] = function(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
    reportDiagnostics: true,
  });
  const errors = (output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    throw new Error(`TypeScript transpile error in ${filename}: ${errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '\n')).join('; ')}`);
  }
  module._compile(output.outputText, filename);
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'zustand') return path.join(MOCK, 'zustand.cjs');
  if (request === 'date-fns') return path.join(MOCK, 'date-fns.cjs');
  if (request === '@/lib/storage/storage') return path.join(MOCK, 'storage.cjs');
  if (request.startsWith('@/')) {
    const base = path.join(SRC, request.slice(2));
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

const { starterSyllabus } = require('@/data/syllabus/starter');
const { buildQuestions, hasQuestionSupport } = require('@/data/questions/blueprints');
const { evaluateAnswers, buildAttempt } = require('@/lib/tests/evaluate');
const performance = require('@/lib/analytics/performance');
const dashboard = require('@/lib/analytics/dashboard');
const { buildSmartPlan } = require('@/lib/planner/engine');
const { goalProgress } = require('@/lib/goals/progress');
const { streakSnapshot } = require('@/lib/streak/engine');
const { reconcileAchievements } = require('@/lib/achievements/engine');
const { focusElapsedSeconds, focusRemainingSeconds } = require('@/lib/focus/timer');
const { buildRevisionContent } = require('@/lib/revision/content');
const { buildFlashcards } = require('@/lib/flashcards/cards');
const { searchEduFlow } = require('@/lib/search/search');
const { reconcileNotifications } = require('@/lib/notifications/engine');
const { calendarDaySnapshot, monthCalendar } = require('@/lib/calendar/engine');
const { LocalStudyProvider } = require('@/lib/ai/local-study-provider');
const { buildInitialState } = require('@/lib/storage/profile.repository');
const { useEduFlowStore } = require('@/store/use-eduflow-store');
const mockStorage = require(path.join(MOCK, 'storage.cjs'));

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function iso(dateKey, hour = 12) { return `${dateKey}T${String(hour).padStart(2,'0')}:00:00.000Z`; }
function dateKeyOffset(base, delta) {
  const d = new Date(`${base}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + delta); return d.toISOString().slice(0,10);
}
function getTopic(state, subjectName, topicName) {
  const subject = state.subjects.find(s => s.name === subjectName);
  assert(subject, `Missing subject ${subjectName}`);
  const topic = subject.topics.find(t => t.name === topicName);
  assert(topic, `Missing topic ${topicName}`);
  return { subject, topic };
}
function makeAttempt({ state, subjectName='Physics', topicName='Motion', score=5, date='2026-09-08', id }) {
  const { subject, topic } = getTopic(state, subjectName, topicName);
  const questions = buildQuestions(subject.id, topic.id, subject.name, topic.name);
  const selections = questions.map((q, i) => i < score ? q.correctOption : (q.correctOption + 1) % 4);
  const attempt = buildAttempt({ studentId: state.profile.id, subjectId: subject.id, subjectName: subject.name, topicId: topic.id, topicName: topic.name, difficulty:'medium', questions, selections, durationSeconds: 180 });
  attempt.id = id || attempt.id;
  attempt.date = iso(date);
  return attempt;
}
function freshOnboarded() {
  const empty = mockStorage.createEmptyState();
  return buildInitialState(empty, {
    name: 'Aisha Rao', educationLevel:'school', classGrade:'Class 10', board:'CBSE', subjects:['Physics','Mathematics','Computer Science']
  });
}
function resetStore() {
  mockStorage.storage.clear();
  useEduFlowStore.setState({ ...mockStorage.createEmptyState(), hydrated: true });
}

// 1-6 Foundation/onboarding/content
test('Fresh state has no profile (landing gate condition)', () => {
  assert.equal(mockStorage.createEmptyState().profile, null);
});
test('School onboarding builds a completed profile and selected subjects', () => {
  const state = freshOnboarded();
  assert.equal(state.profile.name, 'Aisha Rao');
  assert.equal(state.profile.educationLevel, 'school');
  assert.equal(state.profile.classGrade, 'Class 10');
  assert.deepEqual(state.subjects.map(s=>s.name), ['Physics','Mathematics','Computer Science']);
  assert(state.profile.subjectIds.every(id => state.subjects.some(s=>s.id===id)));
});
test('College onboarding stores college-specific fields', () => {
  const state = buildInitialState(mockStorage.createEmptyState(), { name:'Rahul Sen', educationLevel:'college', collegeName:'Example College', course:'B.Tech', year:'2', semester:'4', branch:'Computer Science', subjects:['Computer Science'] });
  assert.equal(state.profile.collegeName, 'Example College'); assert.equal(state.profile.branch, 'Computer Science');
});
test('Persisted profile hydrates back into the actual store (refresh survival)', () => {
  const saved = freshOnboarded(); mockStorage.storage.__seed(saved);
  useEduFlowStore.setState({ ...mockStorage.createEmptyState(), hydrated: false });
  useEduFlowStore.getState().hydrate(); const state=useEduFlowStore.getState();
  assert.equal(state.hydrated,true); assert.equal(state.profile.name,'Aisha Rao'); assert.equal(state.subjects.length,3);
});
test('All 40 starter topics have exactly 10 supported questions with four valid options', () => {
  let count = 0;
  for (const [subjectName, topics] of Object.entries(starterSyllabus)) for (const topicName of topics) {
    count++;
    assert(hasQuestionSupport(subjectName, topicName), `${subjectName}/${topicName} unsupported`);
    const q = buildQuestions('s','t',subjectName,topicName);
    assert.equal(q.length,10, `${subjectName}/${topicName} count`);
    q.forEach(item => { assert.equal(item.options.length,4); assert(item.correctOption>=0 && item.correctOption<4); assert(item.explanation); });
  }
  assert.equal(count,40);
});
test('Custom subject does not receive fabricated starter topics/questions', () => {
  const state = buildInitialState(mockStorage.createEmptyState(), { name:'Aisha', educationLevel:'school', classGrade:'Class 10', board:'Other', subjects:['Astronomy Lab'] });
  assert.equal(state.subjects[0].isCustom,true); assert.equal(state.subjects[0].topics.length,0); assert.equal(buildQuestions('s','t','Astronomy Lab','Unknown'),0);
});

// 7-12 Store persistence, test engine, analysis
test('Actual store mutation completes a topic, updates activity and persists it', () => {
  resetStore(); useEduFlowStore.getState().completeOnboarding({ name:'Aisha Rao', educationLevel:'school', classGrade:'Class 10', board:'CBSE', subjects:['Physics'] });
  let state = useEduFlowStore.getState(); const {subject,topic}=getTopic(state,'Physics','Motion');
  assert(useEduFlowStore.getState().toggleTopicCompletion(subject.id,topic.id).ok);
  state = useEduFlowStore.getState(); const updated=getTopic(state,'Physics','Motion').topic;
  assert.equal(updated.completed,true); assert(updated.completedAt); assert(Object.values(state.dailyActivity).some(a=>a.topicCompletions===1));
  assert.equal(mockStorage.storage.__peek().subjects[0].topics.find(t=>t.id===topic.id).completed,true);
});
test('Test evaluator returns exact score, wrong/unanswered counts and mistake explanations', () => {
  const state=freshOnboarded(); const {subject,topic}=getTopic(state,'Physics','Motion'); const q=buildQuestions(subject.id,topic.id,subject.name,topic.name);
  const selections=q.map((item,i)=> i<6 ? item.correctOption : i<8 ? (item.correctOption+1)%4 : null);
  const result=evaluateAnswers(q,selections); assert.equal(result.score,6); assert.equal(result.correctAnswers,6); assert.equal(result.wrongAnswers,2); assert.equal(result.unanswered,2); assert.equal(result.mistakes.length,4); assert(result.mistakes.every(m=>m.explanation && m.correctAnswer));
});
test('Store rejects non-10-question attempts and persists valid attempts', () => {
  resetStore(); useEduFlowStore.getState().completeOnboarding({ name:'Aisha Rao', educationLevel:'school', classGrade:'Class 10', board:'CBSE', subjects:['Physics'] });
  const state=useEduFlowStore.getState(); const attempt=makeAttempt({state,score:8});
  assert(useEduFlowStore.getState().saveTestAttempt(attempt).ok); assert.equal(useEduFlowStore.getState().testAttempts.length,1); assert.equal(mockStorage.storage.__peek().testAttempts.length,1);
  const bad={...attempt,id:crypto.randomUUID(),answers:attempt.answers.slice(0,9)}; assert.equal(useEduFlowStore.getState().saveTestAttempt(bad).ok,false);
});
test('Performance analytics derive average/high/low and subject health from saved results', () => {
  const state=freshOnboarded(); const attempts=[makeAttempt({state,score:4,id:'a'}),makeAttempt({state,score:8,id:'b'})];
  assert.equal(performance.calculateAverageScore(attempts),6); assert.equal(performance.calculateHighestScore(attempts),8); assert.equal(performance.calculateLowestScore(attempts),4);
  const p=performance.calculateSubjectPerformance(state.subjects,attempts).find(x=>x.subjectName==='Physics'); assert.equal(p.health,'Needs Practice');
});
test('Performance trend changes when a new saved result is added', () => {
  const state=freshOnboarded(); const first=makeAttempt({state,score:4,date:'2026-09-07',id:'trend-a'}); const second=makeAttempt({state,score:8,date:'2026-09-08',id:'trend-b'});
  const before=performance.calculateScoreTrend([first]); const after=performance.calculateScoreTrend([first,second]);
  assert.equal(before.length,1); assert.equal(after.length,2); assert.equal(after[1].score,8);
});
test('Repeated low topic attempts are detected as weak and alter recommendation', () => {
  const state=freshOnboarded(); state.testAttempts=[makeAttempt({state,score:3,date:'2026-09-07',id:'a'}),makeAttempt({state,score:4,date:'2026-09-08',id:'b'})];
  const weak=performance.calculateWeakTopics(state.testAttempts)[0]; assert.equal(weak.health,'Weak'); assert.equal(weak.topicName,'Motion');
  const rec=dashboard.buildRecommendation(state); assert(rec.title.includes('Motion')); assert(rec.detail.includes('/10'));
});
test('Weekly comparison and improvement use real period data and handle missing previous data', () => {
  const now=new Date('2026-09-08T12:00:00'); const state=freshOnboarded(); state.testAttempts=[makeAttempt({state,score:4,date:'2026-09-01',id:'p'}),makeAttempt({state,score:8,date:'2026-09-08',id:'c'})];
  const w=performance.calculateWeeklyPerformance(state.testAttempts,now); assert.equal(w.previous.average,4); assert.equal(w.current.average,8); assert.equal(performance.calculateImprovement(8,4),100); assert.equal(performance.calculateImprovement(8,null),null);
});

// 13-19 planner/focus/activity/streak
test('Planner prioritizes a weak topic and respects the available-minute budget', () => {
  const state=freshOnboarded(); state.testAttempts=[makeAttempt({state,score:3,date:'2026-09-07',id:'a'}),makeAttempt({state,score:4,date:'2026-09-08',id:'b'})];
  const plan=buildSmartPlan(state,60,new Date('2026-09-08T12:00:00')); assert(plan.tasks.length>0); assert(plan.allocatedMinutes<=60); assert.equal(plan.tasks[0].topicName,'Motion');
});
test('Upcoming exam raises related-subject priority', () => {
  const state=freshOnboarded(); const physics=state.subjects.find(s=>s.name==='Physics'); state.exams=[{id:'e',name:'Physics Exam',date:'2026-09-14',subjectIds:[physics.id],createdAt:iso('2026-09-01')}];
  const plan=buildSmartPlan(state,60,new Date('2026-09-08T12:00:00')); assert.equal(plan.tasks[0].subjectName,'Physics'); assert(plan.tasks[0].signals.some(s=>s.includes('Exam in 6 days')));
});
test('Planner activation persists exact task/topic handoff', () => {
  resetStore(); useEduFlowStore.getState().completeOnboarding({name:'Aisha Rao',educationLevel:'school',classGrade:'Class 10',board:'CBSE',subjects:['Physics']}); const state=useEduFlowStore.getState(); const {subject,topic}=getTopic(state,'Physics','Motion');
  const r=useEduFlowStore.getState().activatePlannerTask({id:'task-1',subjectId:subject.id,topicId:topic.id,minutes:25}); assert(r.ok); const p=useEduFlowStore.getState().planner; assert.equal(p.activeTaskId,'task-1'); assert.equal(p.activeTopicId,topic.id); assert.equal(p.preparedFocusMinutes,25);
});
test('Timestamp timer survives throttling by deriving elapsed time from runStartedAt', () => {
  const session={id:'x',mode:'focus',status:'running',plannedSeconds:1500,elapsedSeconds:120,runStartedAt:'2026-09-08T10:00:00.000Z',createdAt:'2026-09-08T09:00:00.000Z',updatedAt:'2026-09-08T10:00:00.000Z'};
  const now=new Date('2026-09-08T10:05:00.000Z').getTime(); assert.equal(focusElapsedSeconds(session,now),420); assert.equal(focusRemainingSeconds(session,now),1080);
});
test('Completed focus creates actual study session/activity and planner completion', () => {
  resetStore(); useEduFlowStore.getState().completeOnboarding({name:'Aisha Rao',educationLevel:'school',classGrade:'Class 10',board:'CBSE',subjects:['Physics']}); let state=useEduFlowStore.getState(); const {subject,topic}=getTopic(state,'Physics','Motion');
  useEduFlowStore.getState().activatePlannerTask({id:'task-focus',subjectId:subject.id,topicId:topic.id,minutes:25}); useEduFlowStore.getState().prepareFocusSession({subjectId:subject.id,topicId:topic.id,minutes:25,plannerTaskId:'task-focus'}); useEduFlowStore.getState().startActiveFocus();
  state=useEduFlowStore.getState(); const active={...state.activeFocus,status:'paused',elapsedSeconds:600,runStartedAt:undefined,endsAt:undefined}; useEduFlowStore.setState({activeFocus:active});
  assert(useEduFlowStore.getState().completeActiveFocus().ok); state=useEduFlowStore.getState(); assert.equal(state.studySessions.length,1); assert.equal(state.studySessions[0].durationSeconds,600); assert(Object.values(state.dailyActivity).some(a=>a.focusSeconds===600)); assert(state.planner.completedTaskIds.includes('task-focus'));
});
test('Meaningful activity drives current/best streak; opening alone does not', () => {
  const activity={}; const base='2026-09-08'; for(let i=-6;i<=0;i++){const key=dateKeyOffset(base,i); activity[key]={date:key,topicCompletions:0,testsCompleted:0,focusSeconds:60};}
  const snap=streakSnapshot(activity,new Date('2026-09-08T12:00:00')); assert.equal(snap.current,7); assert.equal(snap.best,7); assert.equal(dashboard.isMeaningfulActivity({date:base,topicCompletions:0,testsCompleted:0,focusSeconds:0}),false);
});

// 20-25 notes/bookmarks/goals/achievements/calendar
test('Notes create/update/delete through actual store and persist', () => {
  resetStore(); useEduFlowStore.getState().completeOnboarding({name:'Aisha Rao',educationLevel:'school',classGrade:'Class 10',board:'CBSE',subjects:['Physics']}); let state=useEduFlowStore.getState(); const {subject,topic}=getTopic(state,'Physics','Motion');
  assert(useEduFlowStore.getState().createNote({title:'Motion cues',body:'Velocity uses displacement.',subjectId:subject.id,topicId:topic.id}).ok); state=useEduFlowStore.getState(); const note=state.notes[0]; assert(mockStorage.storage.__peek().notes.some(n=>n.id===note.id)); assert(useEduFlowStore.getState().updateNote(note.id,{title:'Motion notes',body:'Velocity uses displacement.',subjectId:subject.id,topicId:topic.id}).ok); assert.equal(useEduFlowStore.getState().notes[0].title,'Motion notes'); assert(useEduFlowStore.getState().deleteNote(note.id).ok); assert.equal(useEduFlowStore.getState().notes.length,0);
});
test('Bookmark persists without changing completion progress', () => {
  resetStore(); useEduFlowStore.getState().completeOnboarding({name:'Aisha Rao',educationLevel:'school',classGrade:'Class 10',board:'CBSE',subjects:['Physics']}); const state=useEduFlowStore.getState(); const {subject,topic}=getTopic(state,'Physics','Motion'); assert(useEduFlowStore.getState().toggleTopicBookmark(subject.id,topic.id).ok); const updated=getTopic(useEduFlowStore.getState(),'Physics','Motion').topic; assert.equal(updated.bookmarked,true); assert.equal(updated.completed,false); assert.equal(mockStorage.storage.__peek().subjects[0].topics[0].bookmarked,true);
});
test('Automatically measurable goals derive progress from real activity/tests', () => {
  const state=freshOnboarded(); const today='2026-09-08'; state.dailyActivity[today]={date:today,topicCompletions:2,testsCompleted:1,focusSeconds:4500}; state.testAttempts=[makeAttempt({state,score:8,date:today,id:'g'})];
  assert.equal(goalProgress({id:'1',type:'study_minutes',period:'daily',target:120,createdAt:iso(today)},state,new Date(`${today}T12:00:00`)).current,75);
  assert.equal(goalProgress({id:'2',type:'topics',period:'daily',target:3,createdAt:iso(today)},state,new Date(`${today}T12:00:00`)).current,2);
  assert.equal(goalProgress({id:'3',type:'score',period:'daily',target:9,createdAt:iso(today)},state,new Date(`${today}T12:00:00`)).current,8);
});
test('Required achievements unlock once from actual history with timestamps', () => {
  const state=freshOnboarded(); const physics=state.subjects.find(s=>s.name==='Physics'); const all=state.subjects.flatMap(s=>s.topics); // need 10 topics: add from selected subjects already 15
  all.slice(0,10).forEach((t,i)=>{t.completed=true;t.completedAt=iso(dateKeyOffset('2026-09-08',-15+i));});
  state.testAttempts=[makeAttempt({state,score:10,date:'2026-09-08',id:'perfect'})]; for(let i=-6;i<=0;i++){const key=dateKeyOffset('2026-09-08',i);state.dailyActivity[key]={date:key,topicCompletions:0,testsCompleted:0,focusSeconds:60};}
  const first=reconcileAchievements(state); assert(first.achievements['first-test']); assert(first.achievements['ninety-percent']); assert(first.achievements['perfect-ten']); assert(first.achievements['ten-topics']); assert(first.achievements['seven-day-streak']);
  const second=reconcileAchievements(first); assert.strictEqual(second,first,'reconcile should return same object when nothing new unlocks');
});
test('Calendar derives studied/test/topic/goal state and avoids pre-profile missed days', () => {
  const state=freshOnboarded(); state.profile.createdAt=iso('2026-09-05'); const {topic}=getTopic(state,'Physics','Motion'); topic.completed=true; topic.completedAt=iso('2026-09-08'); state.dailyActivity['2026-09-08']={date:'2026-09-08',topicCompletions:1,testsCompleted:1,focusSeconds:1500}; state.testAttempts=[makeAttempt({state,score:8,date:'2026-09-08',id:'cal'})];
  const day=calendarDaySnapshot(state,'2026-09-08','2026-09-08'); assert(day.studied); assert.equal(day.topicCompletions.length,1); assert.equal(day.tests.length,1); assert.equal(day.focusSeconds,1500); const before=calendarDaySnapshot(state,'2026-09-04','2026-09-08'); assert.equal(before.missedStudyDay,false); const grid=monthCalendar(state,2026,8); assert.equal(grid.length%7,0); assert(grid.length>=35 && grid.length<=42);
});

// 26-30 exam/revision/search/notifications/mobile/static controls
test('Exam countdown finds nearest future exam dynamically', () => {
  const state=freshOnboarded(); const physics=state.subjects.find(s=>s.name==='Physics'); state.exams=[{id:'e',name:'Term Exam',date:'2026-09-20',subjectIds:[physics.id],createdAt:iso('2026-09-01')}]; const nearest=dashboard.nearestExam(state.exams,new Date('2026-09-08T12:00:00')); assert.equal(nearest.exam.name,'Term Exam'); assert.equal(dashboard.daysUntil(nearest.date,new Date('2026-09-08T12:00:00')),12);
});
test('Revision and flashcards are available for every supported starter topic', () => {
  for(const [subjectName,topics] of Object.entries(starterSyllabus)) for(const topicName of topics){const rev=buildRevisionContent(subjectName,topicName); assert(rev && rev.summary && rev.keyDefinitions.length>=4); const cards=buildFlashcards('s','t',subjectName,topicName); assert(cards.length>=4);}
  assert.equal(buildRevisionContent('Custom','Mystery'),null); assert.equal(buildFlashcards('s','t','Custom','Mystery').length,0);
});
test('Global search finds actual subject/topic/bookmark/note/revision content', () => {
  const state=freshOnboarded(); const {subject,topic}=getTopic(state,'Physics','Motion'); topic.bookmarked=true; state.notes=[{id:'n',title:'Velocity clue',body:'Velocity uses displacement',subjectId:subject.id,topicId:topic.id,createdAt:iso('2026-09-08'),updatedAt:iso('2026-09-08')}];
  assert(searchEduFlow(state,'Velocity').some(r=>r.kind==='note')); assert(searchEduFlow(state,'Motion').some(r=>r.kind==='topic')); assert(searchEduFlow(state,'important Motion').some(r=>r.kind==='bookmark')); assert(searchEduFlow(state,'acceleration').some(r=>r.kind==='revision'));
});
test('Notification engine deduplicates and emits exam milestone/goal/study reminders from real data', () => {
  const state=freshOnboarded(); const physics=state.subjects.find(s=>s.name==='Physics'); state.exams=[{id:'e',name:'Physics Exam',date:'2026-09-15',subjectIds:[physics.id],createdAt:iso('2026-09-01')}]; state.goals=[{id:'g',type:'study_minutes',period:'daily',target:100,createdAt:iso('2026-09-01')}]; state.dailyActivity['2026-09-08']={date:'2026-09-08',topicCompletions:0,testsCompleted:0,focusSeconds:4500};
  const now=new Date('2026-09-08T19:00:00'); const once=reconcileNotifications(state,now); assert(once.notifications.some(n=>n.kind==='exam')); assert(once.notifications.some(n=>n.kind==='goal')); const twice=reconcileNotifications(once,now); assert.equal(twice.notifications.length,once.notifications.length);
});
test('Local Study Assistant grounds supported content and test mistakes without inventing unsupported content', async () => {
  const state=freshOnboarded(); const {subject,topic}=getTopic(state,'Physics','Motion'); state.testAttempts=[makeAttempt({state,score:6,date:'2026-09-08',id:'ai'})]; const provider=new LocalStudyProvider();
  const summary=await provider.chat({message:'summarize this topic',context:{state,subjectId:subject.id,topicId:topic.id}}); assert.equal(summary.sourceLabel,'EduFlow local content'); assert(summary.text.includes('Motion'));
  const mistakes=await provider.chat({message:'explain my mistakes',context:{state,subjectId:subject.id,topicId:topic.id,attemptId:'ai'}}); assert.equal(mistakes.sourceLabel,'Student performance'); assert(mistakes.relatedMistakes.length===4);
  const customState=buildInitialState(mockStorage.createEmptyState(),{name:'Aisha',educationLevel:'school',classGrade:'Class 10',board:'Other',subjects:['Custom Lab']}); customState.subjects[0].topics=[{id:'ct',subjectId:customState.subjects[0].id,name:'Mystery',completed:false,bookmarked:false,isStarterContent:false}]; const unsupported=await provider.chat({message:'explain this topic',context:{state:customState,subjectId:customState.subjects[0].id,topicId:'ct'}}); assert.equal(unsupported.sourceLabel,'Unavailable');
});

test('Static acceptance audit: routes, responsive breakpoints, and no obvious dead controls', () => {
  const requiredRoutes=['dashboard','subjects','planner','tests','performance','revision','flashcards','calendar','goals','achievements','notes','streak','assistant','focus'];
  for(const route of requiredRoutes) assert(fs.existsSync(path.join(SRC,'app',route,'page.tsx')),`missing /${route}`);
  const allFiles=[]; (function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name); if(entry.isDirectory()) walk(p); else if(/\.(ts|tsx|css)$/.test(entry.name)) allFiles.push(p);}})(SRC);
  const text=allFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
  assert(!/onClick=\{\(\)\s*=>\s*\{\s*\}\}/.test(text),'empty click handler found'); assert(!/href=["']#["']/.test(text),'dead # link found'); assert(!/\bTODO\b|\bFIXME\b/.test(text),'TODO/FIXME found');
  const css=fs.readFileSync(path.join(SRC,'app','globals.css'),'utf8'); assert(css.includes('@media') || text.includes('sm:')); assert(text.includes('sm:') && text.includes('lg:'),'responsive utilities missing');
  const mobile=fs.readFileSync(path.join(SRC,'components','layout','mobile-nav.tsx'),'utf8'); for(const label of ['Home','Subjects','Planner','Focus','More']) assert(mobile.includes(label));
});

async function main(){
  let passed=0, failed=0;
  const results=[];
  for(const {name,fn} of tests){
    try { await fn(); passed++; results.push({name,status:'PASS'}); console.log(`PASS  ${name}`); }
    catch(err){ failed++; results.push({name,status:'FAIL',error:err && err.stack ? err.stack : String(err)}); console.error(`FAIL  ${name}\n${err.stack||err}`); }
  }
  const report={generatedAt:new Date().toISOString(),passed,failed,total:tests.length,results};
  fs.writeFileSync(path.join(ROOT,'docs','PHASE-15-AUTOMATED-QA.json'),JSON.stringify(report,null,2));
  console.log(`\n${passed}/${tests.length} checks passed; ${failed} failed.`);
  if(failed) process.exitCode=1;
}
main();
