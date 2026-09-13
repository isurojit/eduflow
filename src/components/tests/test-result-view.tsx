"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CircleX, GraduationCap, HelpCircle, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { resultMessage } from "@/lib/tests/evaluate";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { TestAttempt } from "@/types/domain";

export function TestResultView({ attempt }: { attempt: TestAttempt }) {
  const reduceMotion = useReducedMotion();
  const profile = useEduFlowStore((state) => state.profile);
  return (
    <main className="min-h-screen">
      <AppHeader name={profile?.name} context="Test result" />
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-10">
        <Link href="/tests" className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#807478] hover:text-white"><ArrowLeft className="size-3.5" /> Test history</Link>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 border-b border-white/[0.08] pb-8">
          <p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">{attempt.subjectName} · {attempt.topicName}</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[.45fr_1fr] lg:items-end">
            <div><p className="font-[family-name:var(--font-display)] text-6xl font-semibold tracking-[-.06em]">{attempt.score}<span className="text-2xl text-[#807478]"> / 10</span></p><p className="mt-3 text-sm text-[#B8AAAE]">{attempt.percentage}%</p></div>
            <div><h1 className="text-2xl font-semibold tracking-[-.035em]">{resultMessage(attempt.score)}</h1><p className="mt-3 max-w-2xl text-xs leading-5 text-[#807478]">Scored from your submitted answers. No partial marks are used in normal topic tests.</p></div>
          </div>
        </motion.section>

        <section className="grid gap-px border-x border-b border-white/[0.08] bg-white/[0.07] sm:grid-cols-3">
          <Metric icon={CheckCircle2} label="Correct" value={attempt.correctAnswers} />
          <Metric icon={CircleX} label="Wrong" value={attempt.wrongAnswers} />
          <Metric icon={HelpCircle} label="Unanswered" value={attempt.unanswered} />
        </section>

        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Mistake analysis</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Where you lost marks</h2></div><p className="text-xs text-[#807478]">{attempt.mistakes.length ? `${attempt.mistakes.length} questions to review` : "Nothing to correct this time"}</p></div>
          {attempt.mistakes.length ? <div className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {attempt.mistakes.map((mistake, index) => <article key={`${mistake.questionId}-${index}`} className="py-6">
              <p className="text-[9px] uppercase tracking-[.16em] text-[#807478]">Question {index + 1}</p><h3 className="mt-2 max-w-3xl text-sm font-medium leading-6">{mistake.question}</h3>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><div className="border-l-2 border-[#78152A] pl-3"><p className="text-[#807478]">Your answer</p><p className="mt-1 text-[#D9AEB7]">{mistake.studentAnswer ?? "Unanswered"}</p></div><div className="border-l-2 border-white/[0.14] pl-3"><p className="text-[#807478]">Correct answer</p><p className="mt-1 text-[#F7F2F3]">{mistake.correctAnswer}</p></div></div>
              <p className="mt-5 max-w-3xl text-xs leading-5 text-[#9f9195]">{mistake.explanation}</p>{mistake.revisionHint ? <p className="mt-2 text-xs text-[#B8AAAE]"><span className="text-[#807478]">Revision hint:</span> {mistake.revisionHint}</p> : null}
            </article>)}
          </div> : <div className="mt-7 border-y border-white/[0.08] py-7"><p className="text-sm font-medium">Perfect attempt.</p><p className="mt-2 text-xs text-[#807478]">You answered all ten questions correctly.</p></div>}

          <div className="mt-7 flex flex-wrap gap-2">
            <Link href={`/revision/${attempt.subjectId}/${attempt.topicId}`} className="focus-ring inline-flex min-h-11 items-center border border-white/[0.1] px-4 text-xs">Revise Topic</Link>
            <Link href={`/assistant?subjectId=${attempt.subjectId}&topicId=${attempt.topicId}&attemptId=${attempt.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 text-xs"><GraduationCap className="size-4" /> Explain with Assistant</Link>
            <Link href={`/subjects/${attempt.subjectId}/topics/${attempt.topicId}/test`} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white hover:bg-[#C52845]"><RotateCcw className="size-4" /> Retake Test</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: number }) {
  return <div className="bg-[#0d090a] p-5"><Icon className="size-4 text-[#78152A]" /><p className="mt-4 text-[9px] uppercase tracking-[.15em] text-[#807478]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>;
}
