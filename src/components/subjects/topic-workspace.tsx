"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpenCheck, Check, Clock3, FlaskConical, GraduationCap, History, Layers3, Play, Star, StickyNote } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { hasQuestionSupport } from "@/data/questions/blueprints";
import { formatStudyTime } from "@/lib/analytics/dashboard";
import { hasRevisionSupport } from "@/lib/revision/content";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Subject, Topic } from "@/types/domain";

export function TopicWorkspace({ subject, topic }: { subject: Subject; topic: Topic }) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const [completionPrompt, setCompletionPrompt] = useState(false);
  const store = useEduFlowStore();
  const liveSubject = store.subjects.find((item) => item.id === subject.id) ?? subject;
  const liveTopic = liveSubject.topics.find((item) => item.id === topic.id) ?? topic;
  const attempts = store.testAttempts.filter((attempt) => attempt.topicId === liveTopic.id).sort((a, b) => b.date.localeCompare(a.date));
  const sessions = store.studySessions.filter((session) => session.topicId === liveTopic.id);
  const seconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
  const testSupported = hasQuestionSupport(liveSubject.name, liveTopic.name);
  const revisionSupported = hasRevisionSupport(liveSubject.name, liveTopic.name);
  const focusInProgress = Boolean(store.activeFocus && store.activeFocus.status !== "completed");
  const thisTopicFocused = Boolean(focusInProgress && store.activeFocus?.subjectId === subject.id && store.activeFocus?.topicId === liveTopic.id);

  const toggleCompletion = () => {
    const wasComplete = liveTopic.completed;
    const result = store.toggleTopicCompletion(subject.id, liveTopic.id);
    if (result.ok && !wasComplete) setCompletionPrompt(true);
  };

  const startFocus = () => {
    const result = store.prepareFocusSession({ subjectId: subject.id, topicId: liveTopic.id, minutes: store.planner.preparedFocusMinutes ?? 25, plannerTaskId: store.planner.activeTaskId });
    if (result.ok) router.push("/focus");
  };

  return (
    <main className="min-h-screen">
      <AppHeader name={store.profile?.name} context={subject.name} />
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 lg:px-10">
        <Link href={`/subjects/${subject.id}`} className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#807478] transition hover:text-white"><ArrowLeft className="size-3.5" /> {subject.name}</Link>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 border-b border-white/[0.08] pb-9">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[.16em] text-[#807478]"><span>{subject.name}</span><span>/</span><span>{liveTopic.isStarterContent ? "Starter topic" : "Your topic"}</span><span>/</span><span>{liveTopic.difficulty ?? "medium"}</span></div>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{liveTopic.name}</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#9f9195]">{liveTopic.description || (liveTopic.isStarterContent ? "This is starter syllabus content for organizing your study. EduFlow does not present it as an official academic syllabus." : "You added this topic to your syllabus. Its progress can be tracked, but EduFlow will not invent academic test content for it.")}</p></div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/notes?subjectId=${subject.id}&topicId=${liveTopic.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 text-xs text-[#B8AAAE] hover:bg-white/[0.04]"><StickyNote className="size-4"/>Add note</Link><Link href={`/assistant?subjectId=${subject.id}&topicId=${liveTopic.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 text-xs text-[#B8AAAE] hover:bg-white/[0.04]"><GraduationCap className="size-4"/>Ask Assistant</Link>
              <button onClick={() => store.toggleTopicBookmark(subject.id, liveTopic.id)} className="focus-ring inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 text-xs text-[#B8AAAE] hover:bg-white/[0.04]"><Star className={`size-4 ${liveTopic.bookmarked ? "fill-[#78152A] text-[#A81736]" : ""}`} />{liveTopic.bookmarked ? "Important" : "Mark important"}</button>
              <button onClick={toggleCompletion} className={`focus-ring inline-flex min-h-11 items-center gap-2 px-4 text-xs font-semibold ${liveTopic.completed ? "border border-[#78152A] text-[#E6C7CE]" : "bg-[#A81736] text-white hover:bg-[#C52845]"}`}><Check className="size-4" />{liveTopic.completed ? "Mark incomplete" : "Mark topic complete"}</button>
            </div>
          </div>
        </motion.section>

        {store.planner.activeSubjectId === subject.id && store.planner.activeTopicId === liveTopic.id ? (
          <section className="border-x border-b border-[#78152A]/60 bg-[#180C10] px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[9px] uppercase tracking-[.16em] text-[#A81736]">Planner task active</p><p className="mt-1 text-sm text-[#D8CDD0]">A {store.planner.preparedFocusMinutes ?? 25}-minute focus block is prepared for this topic.</p></div>
              <Link href="/planner" className="focus-ring inline-flex min-h-10 items-center border border-white/[0.1] px-3 text-xs text-[#B8AAAE]">Back to planner</Link>
            </div>
          </section>
        ) : null}

        <section className="grid gap-px border-x border-b border-white/[0.08] bg-white/[0.07] sm:grid-cols-3">
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.15em] text-[#807478]">Status</p><p className="mt-3 text-lg font-semibold">{liveTopic.completed ? "Completed" : "In progress"}</p><p className="mt-1 text-[11px] text-[#807478]">{liveTopic.completedAt ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(liveTopic.completedAt)) : "No completion recorded"}</p></div>
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.15em] text-[#807478]">Study time</p><p className="mt-3 text-lg font-semibold">{seconds ? formatStudyTime(seconds) : "—"}</p><p className="mt-1 text-[11px] text-[#807478]">Completed sessions only</p></div>
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.15em] text-[#807478]">Tests</p><p className="mt-3 text-lg font-semibold">{attempts.length}</p><p className="mt-1 text-[11px] text-[#807478]">{attempts[0] ? `Latest ${attempts[0].score}/${attempts[0].totalMarks}` : "No attempts yet"}</p></div>
        </section>

        <section className="grid gap-10 py-10 lg:grid-cols-[1fr_.55fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Topic workspace</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Study, then check what you remember.</h2>
            <div className="mt-6 border-t border-white/[0.08] py-6">
              <div className="flex items-start gap-3"><Play className="mt-0.5 size-4 text-[#A81736]" /><div><p className="text-sm font-medium">Focus on this topic</p><p className="mt-2 max-w-2xl text-xs leading-5 text-[#807478]">Start a reliable 25-minute focus block. Study time is saved only when you complete the session.</p></div></div>
              {focusInProgress ? <Link href="/focus" className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 border border-[#78152A] px-4 text-xs font-semibold text-[#E6C7CE]"><Play className="size-3.5" /> {thisTopicFocused ? "Return to Focus Mode" : "Another Focus Session Is Active"}</Link> : <button onClick={startFocus} className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white hover:bg-[#C52845]"><Play className="size-3.5" /> Start Focus Session</button>}
            </div>
            <div className="border-t border-white/[0.08] py-6">
              {revisionSupported ? <><div className="flex items-start gap-3"><BookOpenCheck className="mt-0.5 size-4 text-[#78152A]" /><div><p className="text-sm font-medium">Revise the core concepts</p><p className="mt-2 max-w-2xl text-xs leading-5 text-[#807478]">Review concise definitions, key points, formulas where relevant, common mistakes, and quick recall questions.</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Link href={`/revision/${subject.id}/${liveTopic.id}`} className="focus-ring inline-flex min-h-11 items-center border border-white/[0.1] px-4 text-xs">Revise Topic</Link><Link href={`/flashcards/${subject.id}/${liveTopic.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 text-xs"><Layers3 className="size-3.5" /> Flashcards</Link></div></> : <><p className="text-sm font-medium">Revision content unavailable for this custom topic.</p><p className="mt-2 max-w-2xl text-xs leading-5 text-[#807478]">EduFlow keeps unsupported custom topics honest rather than inventing study material.</p></>}
            </div>
            <div className="border-t border-white/[0.08] py-6">
              {testSupported ? <><div className="flex items-start gap-3"><FlaskConical className="mt-0.5 size-4 text-[#78152A]" /><div><p className="text-sm font-medium">10-question topic test</p><p className="mt-2 max-w-2xl text-xs leading-5 text-[#807478]">Exactly 10 questions, 1 mark each. Results are calculated from your submitted answers and saved to Test History.</p></div></div><Link href={`/subjects/${subject.id}/topics/${liveTopic.id}/test`} className="focus-ring mt-5 inline-flex min-h-11 items-center bg-[#A81736] px-4 text-xs font-semibold text-white hover:bg-[#C52845]">Take Test</Link></> : <><p className="text-sm font-medium">Question content unavailable for this custom topic.</p><p className="mt-2 max-w-2xl text-xs leading-5 text-[#807478]">EduFlow will not silently generate unknown academic questions. Question-bank import and AI-provider integration can be added later.</p></>}
            </div>
          </div>
          <aside className="border-t border-white/[0.08] pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div className="flex items-center gap-2"><History className="size-4 text-[#78152A]" /><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Learning history</p></div>
            {attempts.length || sessions.length || liveTopic.completedAt ? (
              <div className="mt-5 space-y-4 text-xs text-[#9f9195]">
                {liveTopic.completedAt ? <p>Topic marked complete on {new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date(liveTopic.completedAt))}.</p> : null}
                {sessions.length ? <p>{sessions.length} completed focus {sessions.length === 1 ? "session" : "sessions"} · {formatStudyTime(seconds)}.</p> : null}
                {attempts[0] ? <p>Latest test score: <Link className="text-[#E6C7CE] underline decoration-white/20 underline-offset-4" href={`/tests/${attempts[0].id}`}>{attempts[0].score}/{attempts[0].totalMarks}</Link>.</p> : null}
              </div>
            ) : (
              <div className="mt-5"><Clock3 className="size-4 text-[#78152A]" /><p className="mt-3 text-xs leading-5 text-[#807478]">No activity has been recorded for this topic yet.</p></div>
            )}
          </aside>
        </section>
      </div>

      {completionPrompt ? <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="topic-complete-title"><div className="w-full max-w-md rounded-t-[22px] border border-white/[0.1] bg-[#11090B] p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-none"><div className="flex size-9 items-center justify-center rounded-full bg-[#4A0D1A]"><Check className="size-4 text-[#E6C7CE]" /></div><h2 id="topic-complete-title" className="mt-4 text-xl font-semibold">Topic completed</h2><p className="mt-2 text-sm leading-6 text-[#9f9195]">You’re done with this topic. Want to check what you remember?</p><div className="mt-6 flex flex-wrap justify-end gap-2"><button onClick={() => setCompletionPrompt(false)} className="focus-ring min-h-11 border border-white/[0.1] px-4 text-xs">Later</button>{testSupported ? <Link onClick={() => setCompletionPrompt(false)} href={`/subjects/${subject.id}/topics/${liveTopic.id}/test`} className="focus-ring inline-flex min-h-11 items-center bg-[#A81736] px-4 text-xs font-semibold">Yes, Take Test</Link> : null}</div>{!testSupported ? <p className="mt-4 text-[11px] leading-5 text-[#807478]">A test is not available because this topic has no verified local question bank.</p> : null}</div></div> : null}
    </main>
  );
}
