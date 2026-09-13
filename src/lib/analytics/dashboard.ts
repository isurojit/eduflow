import type { DailyActivity, EduFlowState, Exam, Subject, TestAttempt } from "@/types/domain";
import { calculateAverageScore, calculateSubjectHealth, calculateWeakTopics } from "@/lib/analytics/performance";
import { buildSmartPlan } from "@/lib/planner/engine";
export { goalProgress } from "@/lib/goals/progress";

const DAY_MS = 86_400_000;

export function localDateKey(input: Date | string = new Date()) {
  const date = typeof input === "string" ? new Date(input) : input;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isMeaningfulActivity(activity?: DailyActivity) {
  return Boolean(activity && (activity.focusSeconds > 0 || activity.topicCompletions > 0 || activity.testsCompleted > 0));
}

export function formatStudyTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}


export function calculateCurrentStreak(activity: Record<string, DailyActivity>, now = new Date()) {
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayKey = localDateKey(cursor);

  // If today is not active, allow the streak to continue from yesterday.
  if (!isMeaningfulActivity(activity[todayKey])) cursor.setDate(cursor.getDate() - 1);

  while (isMeaningfulActivity(activity[localDateKey(cursor)])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateBestStreak(activity: Record<string, DailyActivity>) {
  const days = Object.values(activity)
    .filter(isMeaningfulActivity)
    .map((entry) => entry.date)
    .sort();
  if (!days.length) return 0;

  let best = 1;
  let current = 1;
  for (let i = 1; i < days.length; i += 1) {
    const previous = new Date(`${days[i - 1]}T00:00:00`);
    const next = new Date(`${days[i]}T00:00:00`);
    const diff = Math.round((next.getTime() - previous.getTime()) / DAY_MS);
    current = diff === 1 ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return best;
}

export function subjectHealth(subject: Subject, attempts: TestAttempt[]) {
  const matching = attempts.filter((attempt) => attempt.subjectId === subject.id);
  const average = calculateAverageScore(matching);
  return { label: calculateSubjectHealth(average), average, attempts: matching.length };
}

export function nearestExam(exams: Exam[], now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return exams
    .map((exam) => ({ exam, date: new Date(`${exam.date}T00:00:00`) }))
    .filter(({ date }) => Number.isFinite(date.getTime()) && date.getTime() >= start)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;
}

export function daysUntil(date: Date, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.max(0, Math.ceil((date.getTime() - start) / DAY_MS));
}

export function buildTodayPlan(state: EduFlowState, now = new Date()) {
  const minutes = state.planner.date === localDateKey(now) ? state.planner.availableMinutes : 120;
  return buildSmartPlan(state, minutes, now).tasks.slice(0, 4);
}

export function buildRecommendation(state: EduFlowState) {
  if (!state.testAttempts.length) {
    const next = state.subjects.flatMap((subject) => subject.topics.map((topic) => ({ subject, topic }))).find(({ topic }) => !topic.completed);
    return next
      ? { eyebrow: "Build your baseline", title: `Start with ${next.topic.name}`, detail: `Complete a topic in ${next.subject.name}, then take its test. EduFlow will use real results to identify weak areas.` }
      : { eyebrow: "Your baseline", title: "No test data yet", detail: "Complete a topic test so EduFlow can begin building performance recommendations." };
  }

  const weakest = calculateWeakTopics(state.testAttempts)[0];
  if (weakest) {
    if (weakest.health === "Weak") {
      return { eyebrow: "Recommended for you", title: `Revisit ${weakest.topicName}`, detail: `${weakest.topicName} is averaging ${weakest.average.toFixed(1)}/10 across ${weakest.attempts} attempts, including another low recent score. Revise it before retesting.` };
    }
    if (weakest.average < 5) {
      return { eyebrow: "Early signal", title: `Review ${weakest.topicName}`, detail: `Your first evidence on ${weakest.topicName} is ${weakest.recentScore}/10. One attempt is not enough to label it weak, but a short review before the next test would be useful.` };
    }
  }

  const incomplete = state.subjects.flatMap((subject) => subject.topics.map((topic) => ({ subject, topic }))).find(({ topic }) => !topic.completed);
  return incomplete
    ? { eyebrow: "Keep the momentum", title: `Continue ${incomplete.subject.name}`, detail: `${incomplete.topic.name} is still incomplete. Finishing it will give your planner more useful progress data.` }
    : { eyebrow: "Looking good", title: "Your current topics are complete", detail: "Use revision and retests to keep your understanding fresh." };
}

export function buildDashboardSnapshot(state: EduFlowState, now = new Date()) {
  const todayKey = localDateKey(now);
  const today = state.dailyActivity[todayKey] ?? { date: todayKey, topicCompletions: 0, testsCompleted: 0, focusSeconds: 0 };
  const totalTopics = state.subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const completedTopics = state.subjects.reduce((sum, subject) => sum + subject.topics.filter((topic) => topic.completed).length, 0);
  const todayProgressUnits = today.topicCompletions + today.testsCompleted + (today.focusSeconds > 0 ? 1 : 0);
  const todayProgress = Math.min(100, Math.round((todayProgressUnits / 4) * 100));
  const averageScore = calculateAverageScore(state.testAttempts);
  const totalStudySeconds = state.studySessions.reduce((sum, session) => sum + session.durationSeconds, 0);
  const exam = nearestExam(state.exams, now);

  return {
    today,
    todayProgress,
    totalTopics,
    completedTopics,
    averageScore,
    totalStudySeconds,
    currentStreak: calculateCurrentStreak(state.dailyActivity, now),
    bestStreak: calculateBestStreak(state.dailyActivity),
    totalTests: state.testAttempts.length,
    plan: buildTodayPlan(state),
    recommendation: buildRecommendation(state),
    upcomingExam: exam ? { ...exam, daysLeft: daysUntil(exam.date, now) } : null,
  };
}
