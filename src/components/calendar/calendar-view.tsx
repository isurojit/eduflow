"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Flame, FlaskConical, TimerReset } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import { calendarDaySnapshot, monthCalendar } from "@/lib/calendar/engine";
import { localDateKey } from "@/lib/date/local-date";
import { formatStudyTime } from "@/lib/analytics/dashboard";

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function monthLabel(date: Date) { return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date); }
function readableDate(key: string) { return new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${key}T12:00:00`)); }

export function CalendarView() {
  const store = useEduFlowStore();
  const today = localDateKey();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(today);
  const days = useMemo(() => monthCalendar(store, cursor.getFullYear(), cursor.getMonth()), [store, cursor]);
  const detail = calendarDaySnapshot(store, selected);
  const move = (delta: number) => setCursor((value) => new Date(value.getFullYear(), value.getMonth() + delta, 1));
  return <main className="min-h-screen"><AppHeader name={store.profile?.name} context="Calendar"/><div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10 xl:px-12">
    <header className="border-b border-white/[0.08] pb-8"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Your actual study history</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Study calendar</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Focus sessions, completed topics, tests, goal days and missed days are derived from your saved activity. Click any date for the details.</p></header>
    <div className="grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-5"><button onClick={()=>move(-1)} className="focus-ring grid min-h-11 min-w-11 place-items-center border border-white/[0.08]" aria-label="Previous month"><ChevronLeft className="size-4"/></button><div className="text-center"><p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">Month</p><h2 className="mt-1 text-xl font-semibold">{monthLabel(cursor)}</h2></div><button onClick={()=>move(1)} className="focus-ring grid min-h-11 min-w-11 place-items-center border border-white/[0.08]" aria-label="Next month"><ChevronRight className="size-4"/></button></div>
        <div className="mt-4 grid grid-cols-7">{weekday.map(day=><div key={day} className="px-1 py-2 text-center text-[9px] uppercase tracking-[.12em] text-[#62585b] sm:text-[10px]">{day}</div>)}</div>
        <div className="grid grid-cols-7 border-l border-t border-white/[0.07]">{days.map(day=>{const s=day.snapshot;const active=day.date===selected;return <button key={day.date} onClick={()=>setSelected(day.date)} className={`focus-ring relative min-h-[4.35rem] border-b border-r border-white/[0.07] p-1.5 text-left transition sm:min-h-28 sm:p-3 ${active?"bg-[#180C10]":"hover:bg-white/[0.025]"} ${day.inMonth?"":"opacity-35"}`} aria-label={`${day.date}${s.studied?", studied":""}`}><span className={`text-xs ${day.date===today?"font-semibold text-[#E6C7CE]":"text-[#9f9195]"}`}>{day.dayNumber}</span><div className="mt-3 flex flex-wrap gap-1.5">{s.focusSeconds>0?<span title="Studied" className="size-1.5 rounded-full bg-[#A81736]"/>:null}{s.topicCompletions.length?<span title="Topic completed" className="size-1.5 rounded-full bg-[#B8AAAE]"/>:null}{s.tests.length?<span title="Test completed" className="size-1.5 rounded-full bg-[#78152A]"/>:null}{s.goalAchieved?<CircleCheck className="size-3 text-[#D8CDD0]"/>:null}{s.missedStudyDay?<span className="text-[9px] text-[#5f5558]">missed</span>:null}</div>{s.focusSeconds>0?<p className="mt-2 hidden text-[9px] text-[#62585b] sm:block">{Math.round(s.focusSeconds/60)} min</p>:null}</button>})}</div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[#807478]"><span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#A81736]"/>Studied</span><span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#B8AAAE]"/>Topic</span><span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#78152A]"/>Test</span><span className="inline-flex items-center gap-2"><CircleCheck className="size-3"/>Daily goals met</span></div>
      </section>
      <aside className="border-t border-white/[0.08] pt-6 xl:sticky xl:top-24 xl:self-start xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">Selected day</p><h2 className="mt-2 text-xl font-semibold">{readableDate(selected)}</h2>
        <div className="mt-6 grid grid-cols-3 border-y border-white/[0.07]"><div className="py-4"><TimerReset className="size-3.5 text-[#A81736]"/><p className="mt-2 text-sm font-medium">{formatStudyTime(detail.focusSeconds)}</p><p className="text-[9px] uppercase tracking-[.1em] text-[#62585b]">Study</p></div><div className="border-l border-white/[0.07] px-3 py-4"><BookOpenCheck className="size-3.5"/><p className="mt-2 text-sm font-medium">{detail.topicCompletions.length}</p><p className="text-[9px] uppercase tracking-[.1em] text-[#62585b]">Topics</p></div><div className="border-l border-white/[0.07] pl-3 py-4"><FlaskConical className="size-3.5"/><p className="mt-2 text-sm font-medium">{detail.tests.length}</p><p className="text-[9px] uppercase tracking-[.1em] text-[#62585b]">Tests</p></div></div>
        <div className="mt-6 space-y-6">{detail.topicCompletions.length?<div><p className="text-[10px] uppercase tracking-[.13em] text-[#62585b]">Topics completed</p><div className="mt-3 space-y-2">{detail.topicCompletions.map(item=><Link key={item.topicId} href={`/subjects/${item.subjectId}/topics/${item.topicId}`} className="focus-ring block border-l border-[#78152A] pl-3 text-xs leading-5 text-[#B8AAAE] hover:text-white">{item.topicName}<span className="block text-[10px] text-[#62585b]">{item.subjectName}</span></Link>)}</div></div>:null}
          {detail.tests.length?<div><p className="text-[10px] uppercase tracking-[.13em] text-[#62585b]">Tests</p><div className="mt-3 space-y-2">{detail.tests.map(test=><Link key={test.id} href={`/tests/${test.id}`} className="focus-ring flex items-center justify-between border-b border-white/[0.06] py-2 text-xs"><span>{test.topicName}</span><span className="text-[#9f9195]">{test.score}/10</span></Link>)}</div></div>:null}
          {detail.hasDailyGoals?<div className="flex items-start gap-3 border-t border-white/[0.07] pt-4">{detail.goalAchieved?<CircleCheck className="mt-0.5 size-4 text-[#B8AAAE]"/>:<CalendarDays className="mt-0.5 size-4 text-[#62585b]"/>}<div><p className="text-xs font-medium">{detail.goalAchieved?"Daily goals achieved":"Daily goals not fully met"}</p><p className="mt-1 text-[10px] leading-4 text-[#62585b]">Based on the daily goals that existed on this date.</p></div></div>:null}
          {!detail.studied?<div className="border-t border-white/[0.07] pt-5"><p className="text-sm font-medium">{selected<today?"No meaningful study activity recorded.":"Nothing recorded for this day yet."}</p><p className="mt-2 text-xs leading-5 text-[#807478]">A focus session, completed topic, or submitted test will appear here automatically.</p></div>:<div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.13em] text-[#9f9195]"><Flame className="size-3.5"/>Streak day</div>}
        </div>
      </aside>
    </div>
  </div></main>;
}
