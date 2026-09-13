"use client";

import Link from "next/link";
import { Layers3, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { buildFlashcards } from "@/lib/flashcards/cards";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export function FlashcardsIndex() {
  const profile = useEduFlowStore((s) => s.profile); const subjects = useEduFlowStore((s) => s.subjects); const progress = useEduFlowStore((s) => s.flashcardProgress);
  const items = subjects.flatMap((subject) => subject.topics.map((topic) => ({ subject, topic, cards: buildFlashcards(subject.id, topic.id, subject.name, topic.name) })).filter((x) => x.cards.length));
  return <main className="min-h-screen"><AppHeader name={profile?.name} context="Flashcards" /><div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7 lg:px-10"><section className="border-b border-white/[0.08] pb-7"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Active recall</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Flashcards</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Flip through core concepts, mark what you know, and keep difficult cards in a review queue.</p></section>{items.length ? <div className="mt-7 divide-y divide-white/[0.08] border-y border-white/[0.08]">{items.map(({ subject, topic, cards }) => { const p=progress[topic.id]; return <Link key={topic.id} href={`/flashcards/${subject.id}/${topic.id}`} className="focus-ring grid min-h-20 items-center gap-3 py-4 transition hover:bg-white/[0.025] sm:grid-cols-[1fr_auto_auto] sm:px-3"><div><p className="text-sm font-medium">{topic.name}</p><p className="mt-1 text-[11px] text-[#807478]">{subject.name} · {cards.length} cards</p></div><p className="text-xs text-[#807478]">{p ? `${p.knownCardIds.length} known · ${p.reviewCardIds.length} review` : "Not started"}</p><ChevronRight className="size-4 text-[#807478]" /></Link>})}</div> : <div className="py-20 text-center"><Layers3 className="mx-auto size-5 text-[#78152A]" /><h2 className="mt-4 text-lg font-semibold">No flashcards available yet.</h2></div>}</div></main>;
}
