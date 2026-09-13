"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FlaskConical, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export function TestsHistoryView() {
  const profile = useEduFlowStore((state) => state.profile);
  const attempts = useEduFlowStore((state) => state.testAttempts);
  const subjects = useEduFlowStore((state) => state.subjects);
  const [subjectId, setSubjectId] = useState("all");
  const [topicId, setTopicId] = useState("all");
  const [scoreRange, setScoreRange] = useState("all");
  const [date, setDate] = useState("");

  const topicOptions = useMemo(() => subjects.filter((subject) => subjectId === "all" || subject.id === subjectId).flatMap((subject) => subject.topics), [subjectId, subjects]);
  const filtered = useMemo(() => attempts.filter((attempt) => {
    if (subjectId !== "all" && attempt.subjectId !== subjectId) return false;
    if (topicId !== "all" && attempt.topicId !== topicId) return false;
    if (date && attempt.date.slice(0, 10) !== date) return false;
    if (scoreRange === "low" && attempt.score >= 5) return false;
    if (scoreRange === "mid" && (attempt.score < 5 || attempt.score > 7)) return false;
    if (scoreRange === "high" && attempt.score < 8) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date)), [attempts, date, scoreRange, subjectId, topicId]);

  return <main className="min-h-screen"><AppHeader name={profile?.name} context="Tests" /><div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-7 lg:px-10">
    <div className="border-b border-white/[0.08] pb-7"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Assessment history</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Tests</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Every result here comes from a submitted 10-question topic test.</p></div>

    <section className="mt-6 border-y border-white/[0.08] py-4"><div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#807478]"><SlidersHorizontal className="size-3.5" /> Filters</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <select value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setTopicId("all"); }} className="focus-ring min-h-11 border border-white/[0.1] bg-[#0d090a] px-3 text-xs"><option value="all">All subjects</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
      <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="focus-ring min-h-11 border border-white/[0.1] bg-[#0d090a] px-3 text-xs"><option value="all">All topics</option>{topicOptions.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select>
      <select value={scoreRange} onChange={(e) => setScoreRange(e.target.value)} className="focus-ring min-h-11 border border-white/[0.1] bg-[#0d090a] px-3 text-xs"><option value="all">All scores</option><option value="low">0–4</option><option value="mid">5–7</option><option value="high">8–10</option></select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="focus-ring min-h-11 border border-white/[0.1] bg-[#0d090a] px-3 text-xs" aria-label="Filter by test date" />
    </div></section>

    {filtered.length ? <div className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">{filtered.map((attempt) => <Link key={attempt.id} href={`/tests/${attempt.id}`} className="focus-ring grid min-h-20 items-center gap-3 py-4 transition hover:bg-white/[0.025] md:grid-cols-[1fr_1fr_auto_auto] sm:px-3"><div><p className="text-sm font-medium">{attempt.topicName}</p><p className="mt-1 text-[11px] text-[#807478]">{attempt.subjectName}</p></div><p className="text-xs text-[#807478]">{new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(attempt.date))}</p><p className="text-xs uppercase tracking-[.12em] text-[#807478]">{attempt.difficulty}</p><p className="text-lg font-semibold">{attempt.score}<span className="text-xs text-[#807478]">/10</span></p></Link>)}</div> : <div className="py-20 text-center"><FlaskConical className="mx-auto size-5 text-[#78152A]" /><h2 className="mt-4 text-lg font-semibold">{attempts.length ? "No tests match these filters." : "No tests yet."}</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#807478]">{attempts.length ? "Adjust the subject, topic, date, or score filters." : "Open a supported starter topic and choose Take Test to record your first result."}</p>{!attempts.length ? <Link href="/subjects" className="focus-ring mt-5 inline-flex min-h-11 items-center bg-[#A81736] px-4 text-xs font-semibold">Choose a topic</Link> : null}</div>}
  </div></main>;
}
