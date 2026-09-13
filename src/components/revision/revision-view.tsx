"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, BookOpenCheck, CheckCircle2, Sigma, TriangleAlert } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { buildRevisionContent } from "@/lib/revision/content";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Subject, Topic } from "@/types/domain";

export function RevisionView({ subject, topic }: { subject: Subject; topic: Topic }) {
  const profile = useEduFlowStore((s) => s.profile);
  const reduceMotion = useReducedMotion();
  const content = buildRevisionContent(subject.name, topic.name);
  if (!content) return <main className="min-h-screen"><AppHeader name={profile?.name} context="Revision" /><div className="mx-auto max-w-[900px] px-4 py-12 sm:px-7"><Link href={`/subjects/${subject.id}/topics/${topic.id}`} className="text-xs text-[#807478]">← Back to topic</Link><h1 className="mt-8 text-3xl font-semibold">Revision content unavailable.</h1><p className="mt-3 text-sm text-[#9f9195]">EduFlow does not invent revision material for unsupported custom topics.</p></div></main>;
  return <main className="min-h-screen"><AppHeader name={profile?.name} context="Revision" /><div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-10">
    <Link href={`/subjects/${subject.id}/topics/${topic.id}`} className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#807478] hover:text-white"><ArrowLeft className="size-3.5" /> {topic.name}</Link>
    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 border-b border-white/[0.08] pb-8"><p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">{subject.name} · concise revision</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">{topic.name}</h1><p className="mt-4 max-w-3xl text-sm leading-6 text-[#9f9195]">{content.summary}</p><div className="mt-5 flex flex-wrap gap-2"><Link href={`/flashcards/${subject.id}/${topic.id}`} className="focus-ring inline-flex min-h-11 items-center border border-white/[0.1] px-4 text-xs">Open Flashcards</Link><Link href={`/subjects/${subject.id}/topics/${topic.id}/test`} className="focus-ring inline-flex min-h-11 items-center bg-[#A81736] px-4 text-xs font-semibold">Take 10-question test</Link></div></motion.section>

    <section className="grid gap-8 py-9 lg:grid-cols-[1fr_.8fr]">
      <div><Heading icon={BookOpenCheck} title="Key definitions" /> <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">{content.keyDefinitions.map((item) => <article key={item.term} className="py-5"><h3 className="text-sm font-semibold">{item.term}</h3><p className="mt-2 text-xs leading-5 text-[#9f9195]">{item.definition}</p></article>)}</div></div>
      <div className="space-y-8"><section><Heading icon={CheckCircle2} title="Key points" /><ul className="mt-4 space-y-3">{content.keyPoints.map((point) => <li key={point} className="border-l border-[#78152A] pl-3 text-xs leading-5 text-[#B8AAAE]">{point}</li>)}</ul></section>{content.formulas.length ? <section><Heading icon={Sigma} title="Formulas" /><div className="mt-4 space-y-2">{content.formulas.map((formula) => <div key={formula} className="border border-white/[0.08] bg-[#0d090a] px-4 py-3 font-mono text-xs text-[#E6C7CE]">{formula}</div>)}</div></section> : null}<section><Heading icon={TriangleAlert} title="Common mistakes" /><ul className="mt-4 space-y-3">{content.commonMistakes.map((item) => <li key={item} className="text-xs leading-5 text-[#9f9195]">• {item}</li>)}</ul></section></div>
    </section>
    <section className="border-t border-white/[0.08] py-8"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Quick questions</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Can you explain these without looking back?</h2><ol className="mt-5 space-y-3">{content.quickQuestions.map((question, index) => <li key={question} className="text-sm text-[#B8AAAE]"><span className="mr-3 text-[#78152A]">{String(index + 1).padStart(2, "0")}</span>{question}</li>)}</ol></section>
  </div></main>;
}

function Heading({ icon: Icon, title }: { icon: typeof BookOpenCheck; title: string }) { return <div className="flex items-center gap-2"><Icon className="size-4 text-[#A81736]" /><h2 className="text-[10px] uppercase tracking-[.18em] text-[#807478]">{title}</h2></div>; }
