"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, Clock3, FlaskConical, Gauge, TrendingDown, TrendingUp } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { calculatePerformanceSnapshot } from "@/lib/analytics/performance";
import { formatStudyTime } from "@/lib/analytics/dashboard";
import type { EduFlowState } from "@/types/domain";

const ScoreTrendChart = dynamic(() => import("@/components/performance/performance-charts").then((module) => module.ScoreTrendChart), { ssr: false });
const SubjectPerformanceChart = dynamic(() => import("@/components/performance/performance-charts").then((module) => module.SubjectPerformanceChart), { ssr: false });

function metric(value: number | null, suffix = "") {
  return value === null ? "—" : `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix}`;
}

function healthText(label: string) {
  if (label === "Strong") return "Strong";
  if (label === "Weak") return "Weak";
  if (label === "Watch") return "Early signal";
  return label;
}

export function PerformanceView({ state }: { state: EduFlowState }) {
  const snapshot = calculatePerformanceSnapshot(state);
  const current = snapshot.weekly.current;
  const previous = snapshot.weekly.previous;

  return (
    <main className="min-h-screen">
      <AppHeader name={state.profile?.name} context="Performance" />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10 xl:px-12">
        <header className="grid gap-6 border-b border-white/[0.08] pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Evidence, not estimates</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Performance</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Scores and classifications are calculated only from tests you have actually submitted.</p>
          </div>
          <Link href="/tests" className="focus-ring inline-flex min-h-11 items-center gap-2 border border-white/[0.1] px-4 text-xs font-semibold text-[#D8CDD0] transition hover:bg-white/[0.04]">View test history <ArrowRight className="size-3.5" /></Link>
        </header>

        <section className="grid border-b border-white/[0.08] sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total tests", String(snapshot.totalTests), FlaskConical],
            ["Average score", metric(snapshot.averageScore, "/10"), Gauge],
            ["Highest score", metric(snapshot.highestScore, "/10"), TrendingUp],
            ["Lowest score", metric(snapshot.lowestScore, "/10"), TrendingDown],
            ["Total study time", formatStudyTime(snapshot.totalStudySeconds), Clock3],
          ].map(([label, value, Icon], index) => (
            <div key={String(label)} className={`py-6 sm:px-5 ${index > 0 ? "sm:border-l sm:border-white/[0.07]" : ""}`}>
              <Icon className="size-4 text-[#78152A]" aria-hidden="true" />
              <p className="mt-4 text-[10px] uppercase tracking-[.16em] text-[#807478]">{String(label)}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-.03em]">{String(value)}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-8 border-b border-white/[0.08] py-8 xl:grid-cols-[1.15fr_.85fr]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Score trend</p><h2 className="mt-2 text-xl font-semibold">Recent attempts</h2></div>
              {snapshot.scoreTrend.length ? <p className="text-[11px] text-[#807478]">Last {snapshot.scoreTrend.length} tests</p> : null}
            </div>
            {snapshot.scoreTrend.length ? <div className="mt-4 border-t border-white/[0.07] pt-3"><ScoreTrendChart data={snapshot.scoreTrend} /></div> : <div className="mt-5 border-l border-white/[0.08] py-8 pl-5"><ChartNoAxesCombined className="size-5 text-[#78152A]" /><p className="mt-4 text-sm font-medium">Your score trend will appear after your first test.</p><p className="mt-2 max-w-lg text-xs leading-5 text-[#807478]">EduFlow does not draw example performance data.</p><Link href="/subjects" className="focus-ring mt-5 inline-flex min-h-10 items-center text-xs font-semibold text-[#C52845]">Choose a topic <ArrowRight className="ml-2 size-3.5" /></Link></div>}
          </section>

          <section className="border-t border-white/[0.08] pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Week over week</p>
            <h2 className="mt-2 text-xl font-semibold">Performance comparison</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="border border-white/[0.08] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#807478]">Previous week</p><p className="mt-3 text-2xl font-semibold">{metric(previous.average, "/10")}</p><p className="mt-1 text-[11px] text-[#807478]">{previous.attempts} {previous.attempts === 1 ? "test" : "tests"}</p></div>
              <div className="border border-white/[0.08] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#807478]">Current week</p><p className="mt-3 text-2xl font-semibold">{metric(current.average, "/10")}</p><p className="mt-1 text-[11px] text-[#807478]">{current.attempts} {current.attempts === 1 ? "test" : "tests"}</p></div>
            </div>
            {snapshot.improvement !== null ? <div className="mt-5 border-l-2 border-[#78152A] pl-4"><p className="text-sm font-semibold">{snapshot.improvement >= 0 ? "+" : ""}{snapshot.improvement.toFixed(1)}%</p><p className="mt-1 text-xs leading-5 text-[#807478]">Change in average score compared with the previous week.</p></div> : <p className="mt-5 text-xs leading-5 text-[#807478]">Complete more tests to unlock week-over-week comparison.</p>}
          </section>
        </div>

        <div className="grid gap-8 border-b border-white/[0.08] py-8 xl:grid-cols-[.9fr_1.1fr]">
          <section>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Subject performance</p>
            <h2 className="mt-2 text-xl font-semibold">Average by subject</h2>
            {snapshot.subjectPerformance.some((item) => item.average !== null) ? <div className="mt-4 border-t border-white/[0.07] pt-3"><SubjectPerformanceChart data={snapshot.subjectPerformance} /></div> : <div className="mt-5 py-8"><BookOpenCheck className="size-5 text-[#78152A]" /><p className="mt-4 text-sm font-medium">No subject averages yet.</p><p className="mt-2 text-xs leading-5 text-[#807478]">Take a topic test to create the first subject-level performance signal.</p></div>}
          </section>

          <section className="xl:border-l xl:border-white/[0.08] xl:pl-8">
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Subject health</p>
            <h2 className="mt-2 text-xl font-semibold">What needs attention</h2>
            <div className="mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {snapshot.subjectPerformance.map((item) => <div key={item.subjectId} className="grid grid-cols-[1fr_auto] gap-4 py-4"><div><Link href={`/subjects/${item.subjectId}`} className="focus-ring text-sm font-medium hover:text-[#C52845]">{item.subjectName}</Link><p className="mt-1 text-[11px] text-[#807478]">{item.attempts ? `${item.attempts} ${item.attempts === 1 ? "attempt" : "attempts"} · latest ${item.recentScore}/10` : "No tests submitted"}</p></div><div className="text-right"><p className="text-xs font-semibold">{item.average === null ? "—" : `${item.average.toFixed(1)}/10`}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#807478]">{item.health}</p></div></div>)}
            </div>
          </section>
        </div>

        <section className="py-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Topic performance</p><h2 className="mt-2 text-xl font-semibold">Ranked by current evidence</h2></div><p className="max-w-lg text-right text-[11px] leading-5 text-[#807478]">One low attempt is shown as an early signal; repeated low scores are treated more seriously.</p></div>
          {snapshot.topicPerformance.length ? <div className="mt-5 divide-y divide-white/[0.07] border-y border-white/[0.07]">{snapshot.topicPerformance.map((topic, index) => <Link key={topic.topicId} href={`/subjects/${topic.subjectId}/topics/${topic.topicId}`} className="focus-ring grid gap-3 py-4 transition hover:bg-white/[0.02] lg:grid-cols-[42px_1fr_auto_auto_auto] lg:items-center lg:px-3"><p className="text-xs text-[#5f5558]">{String(index + 1).padStart(2, "0")}</p><div><p className="text-sm font-medium">{topic.topicName}</p><p className="mt-1 text-[11px] text-[#807478]">{topic.subjectName} · {topic.attempts} {topic.attempts === 1 ? "attempt" : "attempts"}</p></div><p className="text-xs text-[#B8AAAE]">Avg {topic.average.toFixed(1)}/10</p><p className="text-xs text-[#B8AAAE]">Latest {topic.recentScore}/10</p><div className="text-right"><p className="text-[10px] uppercase tracking-[.12em] text-[#807478]">{healthText(topic.health)}</p><p className="mt-1 text-[11px] text-[#807478]">{topic.trend === null ? "No trend yet" : `${topic.trend >= 0 ? "+" : ""}${topic.trend} vs last`}</p></div></Link>)}</div> : <div className="mt-5 border-l border-white/[0.08] py-8 pl-5"><p className="text-sm font-medium">Topic rankings need test history.</p><p className="mt-2 text-xs leading-5 text-[#807478]">Once you submit tests, topics will be ordered by their actual average and recent performance.</p></div>}
        </section>
      </div>
    </main>
  );
}
