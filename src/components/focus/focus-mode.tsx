"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Coffee, Pause, Play, RotateCcw, X } from "lucide-react";
import { focusRemainingSeconds, formatTimer } from "@/lib/focus/timer";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export function FocusMode() {
  const store = useEduFlowStore();
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  const completionGuard = useRef<string | null>(null);
  const session = store.activeFocus;

  useEffect(() => {
    if (!session || session.status !== "running") return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [session?.id, session?.status]);

  const remaining = session ? focusRemainingSeconds(session, now) : 0;

  useEffect(() => {
    if (!session || session.status !== "running" || remaining > 0 || completionGuard.current === session.id) return;
    completionGuard.current = session.id;
    store.completeActiveFocus();
  }, [remaining, session, store]);

  const context = useMemo(() => {
    if (!session?.subjectId || !session.topicId) return null;
    const subject = store.subjects.find((item) => item.id === session.subjectId);
    const topic = subject?.topics.find((item) => item.id === session.topicId);
    return subject && topic ? { subject, topic } : null;
  }, [session?.subjectId, session?.topicId, store.subjects]);

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#090708] px-5 text-[#F7F2F3]">
        <div className="max-w-md text-center">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Focus mode</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em]">No focus block is prepared.</h1>
          <p className="mt-3 text-sm leading-6 text-[#9f9195]">Open a topic or choose Study Now from the planner to prepare a focused study block.</p>
          <Link href="/subjects" className="focus-ring mt-6 inline-flex min-h-11 items-center bg-[#A81736] px-4 text-xs font-semibold text-white">Choose a topic</Link>
        </div>
      </main>
    );
  }

  const progress = session.plannedSeconds ? Math.min(100, Math.max(0, ((session.plannedSeconds - remaining) / session.plannedSeconds) * 100)) : 0;
  const completed = session.status === "completed";
  const isBreak = session.mode === "break";

  return (
    <main data-focus-mode className="min-h-screen overflow-hidden bg-[#090708] text-[#F7F2F3]">
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
          {context ? <Link href={`/subjects/${context.subject.id}/topics/${context.topic.id}`} className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#9f9195]"><ArrowLeft className="size-4" /> Back to topic</Link> : <Link href="/dashboard" className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#9f9195]"><ArrowLeft className="size-4" /> Dashboard</Link>}
          <Link href="/dashboard" className="focus-ring grid size-10 place-items-center border border-white/[0.08] text-[#807478] hover:text-white" aria-label="Leave focus mode"><X className="size-4" /></Link>
        </header>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid flex-1 place-items-center py-10">
          <div className="w-full max-w-3xl text-center">
            <div className="mx-auto flex w-fit items-center gap-2 border border-white/[0.08] px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-[#9f9195]">{isBreak ? <Coffee className="size-3.5" /> : null}{isBreak ? "5-minute break" : "Focus session"}</div>
            {context ? <><p className="mt-7 text-xs uppercase tracking-[.18em] text-[#78152A]">{context.subject.name}</p><h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-.045em] sm:text-4xl">{context.topic.name}</h1></> : null}

            <div className="relative mx-auto mt-10 grid aspect-square w-[min(82vw,390px)] sm:w-[min(72vw,390px)] place-items-center rounded-full border border-white/[0.08]">
              <div className="absolute inset-3 rounded-full border border-white/[0.04]" />
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1" />
                <motion.circle cx="50" cy="50" r="48" fill="none" stroke="#A81736" strokeWidth="1.35" strokeLinecap="round" pathLength="100" strokeDasharray="100" animate={{ strokeDashoffset: 100 - progress }} transition={{ duration: reduceMotion ? 0 : .35 }} />
              </svg>
              <div>
                <p className="font-[family-name:var(--font-display)] text-6xl font-semibold tracking-[-.07em] sm:text-7xl">{formatTimer(remaining)}</p>
                <p className="mt-3 text-[10px] uppercase tracking-[.2em] text-[#807478]">{completed ? (isBreak ? "Break complete" : "Session complete") : session.status}</p>
              </div>
            </div>

            {!completed ? (
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {session.status === "running" ? <button onClick={() => store.pauseActiveFocus()} className="focus-ring inline-flex min-h-12 items-center gap-2 bg-[#A81736] px-5 text-xs font-semibold"><Pause className="size-4" /> Pause</button> : <button onClick={() => store.startActiveFocus()} className="focus-ring inline-flex min-h-12 items-center gap-2 bg-[#A81736] px-5 text-xs font-semibold"><Play className="size-4" /> {session.status === "paused" ? "Resume" : "Start"}</button>}
                <button onClick={() => store.resetActiveFocus()} className="focus-ring inline-flex min-h-12 items-center gap-2 border border-white/[0.1] px-5 text-xs text-[#B8AAAE]"><RotateCcw className="size-4" /> Reset</button>
                <button onClick={() => store.completeActiveFocus()} disabled={session.elapsedSeconds === 0 && session.status !== "running"} className="focus-ring inline-flex min-h-12 items-center gap-2 border border-white/[0.1] px-5 text-xs text-[#B8AAAE] disabled:cursor-not-allowed disabled:opacity-40"><Check className="size-4" /> Complete session</button>
              </div>
            ) : (
              <div className="mt-10">
                <h2 className="text-xl font-semibold">{isBreak ? "Break complete" : "Focus session complete"}</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#9f9195]">{isBreak ? "Ready to return? Start another 25-minute block when you are." : "This completed focus time has been saved to your study history and today’s activity."}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {!isBreak ? <button onClick={() => { const result = store.prepareBreak(); if (result.ok) store.startActiveFocus(); }} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold"><Coffee className="size-4" /> Start 5-minute break</button> : <button onClick={() => store.prepareNextFocus()} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold"><Play className="size-4" /> Prepare next focus</button>}
                  <Link href="/dashboard" className="focus-ring inline-flex min-h-11 items-center border border-white/[0.1] px-4 text-xs text-[#B8AAAE]">Return to dashboard</Link>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
