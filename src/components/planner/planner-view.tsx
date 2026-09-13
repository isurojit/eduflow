"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AlarmClock, ArrowRight, Bookmark, CalendarPlus, Clock3, Flame, Goal, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { buildSmartPlan } from "@/lib/planner/engine";
import { localDateKey } from "@/lib/date/local-date";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { EduFlowState } from "@/types/domain";

export function PlannerView({ state }: { state: EduFlowState }) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const store = useEduFlowStore();
  const [minutesInput, setMinutesInput] = useState(String(state.planner.availableMinutes || 120));
  const [message, setMessage] = useState<string | null>(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examSubjects, setExamSubjects] = useState<string[]>([]);

  const liveState: EduFlowState = {
    version: store.version,
    profile: store.profile,
    subjects: store.subjects,
    goals: store.goals,
    dailyActivity: store.dailyActivity,
    testAttempts: store.testAttempts,
    studySessions: store.studySessions,
    exams: store.exams,
    planner: store.planner,
    activeFocus: store.activeFocus,
    flashcardProgress: store.flashcardProgress,
    achievements: store.achievements,
    notes: store.notes,
    notifications: store.notifications,
    notificationPreferences: store.notificationPreferences,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
  const plan = buildSmartPlan(liveState, liveState.planner.availableMinutes);

  const saveMinutes = (event: FormEvent) => {
    event.preventDefault();
    const result = store.setAvailableStudyMinutes(Number(minutesInput));
    setMessage(result.ok ? "Today’s study time has been updated." : result.message ?? "Could not update study time.");
  };

  const studyNow = (task: (typeof plan.tasks)[number]) => {
    const activated = store.activatePlannerTask(task);
    if (!activated.ok) {
      setMessage(activated.message ?? "Could not start this task.");
      return;
    }
    const prepared = store.prepareFocusSession({ subjectId: task.subjectId, topicId: task.topicId, minutes: 25, plannerTaskId: task.id });
    if (!prepared.ok) {
      setMessage(prepared.message ?? "Could not prepare the focus session.");
      return;
    }
    router.push("/focus");
  };

  const submitExam = (event: FormEvent) => {
    event.preventDefault();
    const result = store.addExam({ name: examName, date: examDate, subjectIds: examSubjects });
    if (!result.ok) {
      setMessage(result.message ?? "Could not add exam.");
      return;
    }
    setExamName("");
    setExamDate("");
    setExamSubjects([]);
    setShowExamForm(false);
    setMessage("Exam added. The plan has been reprioritized.");
  };

  const toggleExamSubject = (id: string) => {
    setExamSubjects((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  return (
    <main className="min-h-screen bg-[#090708]">
      <AppHeader name={state.profile?.name} context="Smart planner" />
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-10 xl:px-12">
        <motion.header initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-7 border-b border-white/[0.08] pb-9 lg:grid-cols-[1fr_.58fr] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Phase 7 · Smart Study Planner</p>
            <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Use today’s time where it matters most.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#9f9195]">EduFlow ranks real topics using your test history, incomplete syllabus, upcoming exams, goals, bookmarks, and how recently you studied each topic.</p>
          </div>
          <form onSubmit={saveMinutes} className="border-l border-white/[0.08] pl-5 sm:pl-7">
            <label htmlFor="available-minutes" className="text-[10px] uppercase tracking-[.18em] text-[#807478]">Available study time today</label>
            <div className="mt-3 flex gap-2">
              <input id="available-minutes" type="number" min={10} max={720} value={minutesInput} onChange={(event) => setMinutesInput(event.target.value)} className="focus-ring min-h-11 w-28 border border-white/[0.1] bg-[#11090B] px-3 text-sm outline-none" aria-describedby="minutes-help" />
              <button type="submit" className="focus-ring min-h-11 bg-[#A81736] px-4 text-xs font-semibold text-white transition hover:bg-[#C52845]">Update plan</button>
            </div>
            <p id="minutes-help" className="mt-2 text-[11px] text-[#807478]">10–720 minutes · persisted for today</p>
          </form>
        </motion.header>

        {message ? <div className="mt-5 border border-white/[0.08] bg-[#11090B] px-4 py-3 text-xs text-[#C9BCC0]" role="status">{message}</div> : null}

        <section className="grid gap-px border-x border-b border-white/[0.08] bg-white/[0.07] sm:grid-cols-3">
          <div className="bg-[#0d090a] p-5"><Clock3 className="size-4 text-[#A81736]" /><p className="mt-4 text-[9px] uppercase tracking-[.15em] text-[#807478]">Available</p><p className="mt-2 text-2xl font-semibold">{plan.availableMinutes} min</p></div>
          <div className="bg-[#0d090a] p-5"><Goal className="size-4 text-[#78152A]" /><p className="mt-4 text-[9px] uppercase tracking-[.15em] text-[#807478]">Allocated</p><p className="mt-2 text-2xl font-semibold">{plan.allocatedMinutes} min</p></div>
          <div className="bg-[#0d090a] p-5"><Flame className="size-4 text-[#78152A]" /><p className="mt-4 text-[9px] uppercase tracking-[.15em] text-[#807478]">Priority tasks</p><p className="mt-2 text-2xl font-semibold">{plan.tasks.length}</p></div>
        </section>

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_.38fr]">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Today’s plan</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Ranked from real study signals</h2></div>
              <p className="max-w-md text-right text-[11px] leading-5 text-[#807478]">{plan.explanation}</p>
            </div>

            {plan.tasks.length ? (
              <div>
                {plan.tasks.map((task, index) => {
                  const active = liveState.planner.activeTaskId === task.id;
                  return (
                    <motion.article key={task.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * 0.045 }} className="grid gap-5 border-b border-white/[0.07] py-6 md:grid-cols-[64px_1fr_auto] md:items-center">
                      <div className="text-3xl font-semibold tracking-[-.06em] text-[#3f3437]">{String(index + 1).padStart(2, "0")}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[#F7F2F3]">{task.topicName}</p>{active ? <span className="border border-[#78152A] px-2 py-0.5 text-[9px] uppercase tracking-[.14em] text-[#E1BBC4]">Active</span> : null}{task.kind === "revision" ? <span className="border border-white/[0.08] px-2 py-0.5 text-[9px] uppercase tracking-[.14em] text-[#9f9195]">Revision</span> : null}</div>
                        <p className="mt-1 text-xs text-[#807478]">{task.subjectName}</p>
                        <p className="mt-3 text-xs leading-5 text-[#B8AAAE]">{task.reason}</p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#6f6366]">{task.signals.slice(0, 4).map((signal) => <span key={signal}>{signal}</span>)}</div>
                      </div>
                      <div className="flex items-center gap-3 md:justify-end">
                        <div className="min-w-16 text-right"><p className="text-lg font-semibold">{task.minutes}</p><p className="text-[9px] uppercase tracking-[.14em] text-[#807478]">minutes</p></div>
                        <button onClick={() => studyNow(task)} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white transition hover:bg-[#C52845]">Study Now <ArrowRight className="size-3.5" /></button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <div className="py-10"><AlarmClock className="size-5 text-[#78152A]" /><p className="mt-4 text-sm font-medium">Nothing needs scheduling yet.</p><p className="mt-2 max-w-xl text-xs leading-5 text-[#807478]">Set at least 10 available minutes and keep incomplete topics in your syllabus. Weak completed topics will also return automatically as revision tasks.</p></div>
            )}
          </section>

          <aside className="space-y-8">
            <section className="bg-[#11090B] p-6">
              <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Exam pressure</p><h2 className="mt-2 text-lg font-semibold">Upcoming exams</h2></div><button onClick={() => setShowExamForm((value) => !value)} className="focus-ring inline-flex min-h-10 items-center gap-2 border border-white/[0.1] px-3 text-[11px] text-[#B8AAAE]"><CalendarPlus className="size-3.5" /> Add</button></div>
              {liveState.exams.length ? <div className="mt-5">{[...liveState.exams].sort((a, b) => a.date.localeCompare(b.date)).map((exam) => <div key={exam.id} className="flex items-start justify-between gap-3 border-t border-white/[0.07] py-4 first:border-t-0"><div><p className="text-sm font-medium">{exam.name}</p><p className="mt-1 text-[11px] text-[#807478]">{exam.date} · {exam.subjectIds.length} {exam.subjectIds.length === 1 ? "subject" : "subjects"}</p></div><button onClick={() => store.removeExam(exam.id)} className="focus-ring grid size-10 place-items-center text-[#807478] hover:text-[#E1BBC4]" aria-label={`Remove ${exam.name}`}><Trash2 className="size-3.5" /></button></div>)}</div> : <p className="mt-5 text-xs leading-5 text-[#807478]">No exam dates yet. Add one here and relevant subjects will receive more planner priority as the date approaches.</p>}
            </section>

            <section className="border-l border-white/[0.08] pl-5">
              <Bookmark className="size-4 text-[#78152A]" /><p className="mt-4 text-[10px] uppercase tracking-[.2em] text-[#807478]">How priority works</p><p className="mt-3 text-xs leading-5 text-[#9f9195]">Weakness carries the strongest weight. Exam urgency comes next. Incomplete work and at-risk goals add pressure, while bookmarks and stale topics help break close ties.</p>
            </section>
          </aside>
        </div>
      </div>

      {showExamForm ? <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="exam-form-title"><form onSubmit={submitExam} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[22px] border border-white/[0.1] bg-[#11090B] p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-none"><h2 id="exam-form-title" className="text-xl font-semibold">Add an exam</h2><p className="mt-2 text-xs leading-5 text-[#807478]">Its date will immediately influence planner priorities for the selected subjects.</p><label className="mt-5 block text-[10px] uppercase tracking-[.15em] text-[#807478]">Exam name<input required value={examName} onChange={(event) => setExamName(event.target.value)} className="focus-ring mt-2 min-h-11 w-full border border-white/[0.1] bg-[#0d090a] px-3 text-sm normal-case tracking-normal text-[#F7F2F3] outline-none" /></label><label className="mt-4 block text-[10px] uppercase tracking-[.15em] text-[#807478]">Exam date<input required min={localDateKey()} type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} className="focus-ring mt-2 min-h-11 w-full border border-white/[0.1] bg-[#0d090a] px-3 text-sm normal-case tracking-normal text-[#F7F2F3] outline-none" /></label><fieldset className="mt-5"><legend className="text-[10px] uppercase tracking-[.15em] text-[#807478]">Related subjects</legend><div className="mt-3 flex flex-wrap gap-2">{liveState.subjects.map((subject) => <button key={subject.id} type="button" onClick={() => toggleExamSubject(subject.id)} className={`focus-ring min-h-10 border px-3 text-xs ${examSubjects.includes(subject.id) ? "border-[#78152A] bg-[#4A0D1A] text-[#F0D9DE]" : "border-white/[0.1] text-[#9f9195]"}`}>{subject.name}</button>)}</div></fieldset><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowExamForm(false)} className="focus-ring min-h-11 border border-white/[0.1] px-4 text-xs">Cancel</button><button type="submit" className="focus-ring min-h-11 bg-[#A81736] px-4 text-xs font-semibold">Add exam</button></div></form></div> : null}
    </main>
  );
}
