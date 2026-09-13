"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { buildQuestions } from "@/data/questions/blueprints";
import { buildAttempt } from "@/lib/tests/evaluate";
import { testDraftRepository } from "@/lib/tests/test-draft.repository";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Subject, Topic } from "@/types/domain";

export function TestRunner({ subject, topic }: { subject: Subject; topic: Topic }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const profile = useEduFlowStore((state) => state.profile);
  const saveTestAttempt = useEduFlowStore((state) => state.saveTestAttempt);
  const questions = useMemo(() => buildQuestions(subject.id, topic.id, subject.name, topic.name), [subject.id, subject.name, topic.id, topic.name]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Array<number | null>>(() => Array(10).fill(null));
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draft = testDraftRepository.load(subject.id, topic.id);
    if (draft && draft.selections.length === 10) {
      setSelections(draft.selections);
      setCurrentIndex(Math.max(0, Math.min(9, draft.currentIndex)));
      setStartedAt(draft.startedAt);
    }
    setReady(true);
  }, [subject.id, topic.id]);

  useEffect(() => {
    if (!ready || questions.length !== 10) return;
    testDraftRepository.save(subject.id, topic.id, { selections, currentIndex, startedAt });
  }, [currentIndex, questions.length, ready, selections, startedAt, subject.id, topic.id]);

  if (questions.length !== 10) {
    return (
      <main className="min-h-screen">
        <AppHeader name={profile?.name} context="Tests" />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-7">
          <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Question bank</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Question content unavailable for this custom topic.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#9f9195]">EduFlow will not invent academic questions for unsupported topics. A teacher/student question-bank importer and AI-provider route can be connected in a later phase.</p>
          <button onClick={() => router.push(`/subjects/${subject.id}/topics/${topic.id}`)} className="focus-ring mt-8 inline-flex min-h-11 items-center border border-white/[0.1] px-4 text-xs">Back to topic</button>
        </div>
      </main>
    );
  }

  const question = questions[currentIndex];
  const unanswered = selections.filter((value) => value === null).length;
  const submit = () => {
    if (!profile) return router.push("/onboarding");
    const durationSeconds = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    const attempt = buildAttempt({
      studentId: profile.id,
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: topic.id,
      topicName: topic.name,
      difficulty: topic.difficulty ?? "medium",
      questions,
      selections,
      durationSeconds,
    });
    const result = saveTestAttempt(attempt);
    if (!result.ok) return;
    testDraftRepository.clear(subject.id, topic.id);
    router.replace(`/tests/${attempt.id}`);
  };

  return (
    <main className="min-h-screen">
      <AppHeader name={profile?.name} context={`${subject.name} · Test`} />
      <div className="mx-auto max-w-[1040px] px-4 py-8 sm:px-7 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">{subject.name} · {topic.difficulty ?? "medium"}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{topic.name}</h1>
          </div>
          <div className="text-right"><p className="text-xs font-medium">Question {currentIndex + 1} of 10</p><p className="mt-1 text-[11px] text-[#807478]">{10 - unanswered} answered · 10 marks</p></div>
        </div>

        <div className="mt-5 h-1 overflow-hidden bg-white/[0.06]"><motion.div className="h-full bg-[#A81736]" animate={{ width: `${((currentIndex + 1) / 10) * 100}%` }} /></div>

        <AnimatePresence mode="wait">
          <motion.section key={question.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} className="py-10 sm:py-14">
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">1 mark</p>
            <h2 className="mt-4 max-w-3xl text-xl font-medium leading-8 tracking-[-.02em] sm:text-2xl">{question.question}</h2>
            <div className="mt-8 grid gap-3">
              {question.options.map((option, index) => {
                const selected = selections[currentIndex] === index;
                return <button key={option} onClick={() => setSelections((current) => current.map((value, i) => i === currentIndex ? index : value))} className={`focus-ring flex min-h-14 items-start gap-3 border px-4 py-4 text-left text-sm leading-5 transition ${selected ? "border-[#A81736] bg-[#4A0D1A]/40 text-white" : "border-white/[0.09] bg-[#0d090a] text-[#B8AAAE] hover:border-white/[0.18]"}`}><span className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${selected ? "border-[#C52845] bg-[#A81736] text-white" : "border-white/[0.16]"}`}>{String.fromCharCode(65 + index)}</span><span>{option}</span></button>;
              })}
            </div>
          </motion.section>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-white/[0.08] pt-5">
          <button disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} className="focus-ring inline-flex min-h-11 items-center gap-2 px-2 text-xs text-[#B8AAAE] disabled:opacity-30"><ArrowLeft className="size-4" /> Previous</button>
          {currentIndex < 9 ? <button onClick={() => setCurrentIndex((index) => Math.min(9, index + 1))} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-5 text-xs font-semibold text-white hover:bg-[#C52845]">Next <ArrowRight className="size-4" /></button> : <button onClick={() => unanswered ? setConfirmSubmit(true) : submit()} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-5 text-xs font-semibold text-white hover:bg-[#C52845]"><CheckCircle2 className="size-4" /> Submit Test</button>}
        </div>
      </div>

      {confirmSubmit ? <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-t-[22px] border border-white/[0.1] bg-[#11090B] p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:w-[min(100%,28rem)] sm:rounded-none">
          <CircleAlert className="size-5 text-[#C52845]" /><h2 className="mt-4 text-xl font-semibold">Submit with unanswered questions?</h2><p className="mt-2 text-sm leading-6 text-[#9f9195]">You still have {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}. Unanswered questions receive 0 marks.</p>
          <div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmSubmit(false)} className="focus-ring min-h-11 border border-white/[0.1] px-4 text-xs">Keep answering</button><button onClick={submit} className="focus-ring min-h-11 bg-[#A81736] px-4 text-xs font-semibold">Submit anyway</button></div>
        </div>
      </div> : null}
    </main>
  );
}
