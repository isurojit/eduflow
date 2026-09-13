"use client";

import Link from "next/link";
import { BookMarked, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { hasRevisionSupport } from "@/lib/revision/content";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export function RevisionIndex() {
  const profile = useEduFlowStore((s) => s.profile);
  const subjects = useEduFlowStore((s) => s.subjects);
  const supported = subjects.flatMap((subject) => subject.topics.filter((topic) => hasRevisionSupport(subject.name, topic.name)).map((topic) => ({ subject, topic })));
  const items = [...supported].sort((a, b) => Number(b.topic.completed) - Number(a.topic.completed));

  return <main className="min-h-screen"><AppHeader name={profile?.name} context="Revision" /><div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 lg:px-10">
    <section className="border-b border-white/[0.08] pb-7"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Review what matters</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Revision</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Concise notes built from the same verified starter concepts used by EduFlow tests. Completed topics are shown first.</p></section>
    {items.length ? <div className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">{items.map(({ subject, topic }) => <Link key={topic.id} href={`/revision/${subject.id}/${topic.id}`} className="focus-ring grid min-h-20 items-center gap-3 py-4 transition hover:bg-white/[0.025] sm:grid-cols-[1fr_auto] sm:px-3"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{topic.name}</p>{topic.completed ? <span className="border border-[#78152A] px-2 py-0.5 text-[9px] uppercase tracking-[.14em] text-[#E1BBC4]">Completed</span> : null}</div><p className="mt-1 text-[11px] text-[#807478]">{subject.name}</p></div><ChevronRight className="size-4 text-[#807478]" /></Link>)}</div> : <div className="py-20 text-center"><BookMarked className="mx-auto size-5 text-[#78152A]" /><h2 className="mt-4 text-lg font-semibold">No supported revision topics yet.</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#807478]">Starter revision content appears for supported syllabus topics. Custom academic content is not invented automatically.</p><Link href="/subjects" className="focus-ring mt-5 inline-flex min-h-11 items-center bg-[#A81736] px-4 text-xs font-semibold">Open Subjects</Link></div>}
  </div></main>;
}
