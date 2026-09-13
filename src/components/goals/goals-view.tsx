"use client";
import { FormEvent, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { goalProgress } from "@/lib/goals/progress";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Goal } from "@/types/domain";

function goalLabel(goal: Goal) {
  const type = goal.type === "study_minutes" ? "Study time" : goal.type === "topics" ? "Topics completed" : goal.type === "tests" ? "Tests completed" : "Score target";
  return `${goal.period === "daily" ? "Daily" : "Weekly"} · ${type}`;
}
function goalValue(goal: Goal, current: number) {
  const value = goal.type === "study_minutes" ? Math.floor(current) : current;
  return goal.type === "study_minutes" ? `${value} / ${goal.target} min` : `${value} / ${goal.target}`;
}

export function GoalsView() {
  const store = useEduFlowStore();
  const [type, setType] = useState<Goal["type"]>("study_minutes");
  const [period, setPeriod] = useState<Goal["period"]>("daily");
  const [target, setTarget] = useState("120");
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = store.addGoal({ type, period, target: Number(target) });
    setMessage(result.ok ? "Goal added." : result.message ?? "Could not add goal.");
  };
  return <main className="min-h-screen"><AppHeader name={store.profile?.name} context="Goals"/><div className="mx-auto max-w-[1300px] px-4 py-8 sm:px-7 lg:px-10 xl:px-12">
    <header className="border-b border-white/[0.08] pb-8"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Measured automatically</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Goals</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Progress comes from completed focus sessions, topics and submitted tests. There is no manual progress entry.</p></header>
    <div className="grid gap-8 py-8 xl:grid-cols-[1fr_.72fr]">
      <section><p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">Your goals</p><div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
        {store.goals.length ? store.goals.map(goal=>{ const progress=goalProgress(goal,store); const done=progress.percentage>=100; return <article key={goal.id} className="py-5"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{goalLabel(goal)}</p>{done?<span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[.12em] text-[#B8AAAE]"><Check className="size-3"/>Complete</span>:null}</div><p className="mt-2 text-xs text-[#807478]">{goalValue(goal,progress.current)}</p></div><button onClick={()=>store.removeGoal(goal.id)} className="focus-ring inline-flex min-h-10 min-w-10 items-center justify-center border border-white/[0.08] text-[#807478] hover:text-white" aria-label={`Delete ${goalLabel(goal)}`}><Trash2 className="size-4"/></button></div><div className="mt-4 h-1 bg-white/[0.06]"><div className="h-full bg-[#78152A] transition-[width]" style={{width:`${progress.percentage}%`}}/></div></article>}) : <div className="py-8"><p className="text-sm font-medium">No goals yet.</p><p className="mt-2 text-xs text-[#807478]">Add one using the form beside this list.</p></div>}
      </div></section>
      <aside className="border-t border-white/[0.08] pt-6 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"><p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">Add goal</p><form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-xs text-[#B8AAAE]">Measure<select value={type} onChange={e=>setType(e.target.value as Goal["type"])} className="mt-2 min-h-11 w-full border border-white/[0.1] bg-[#11090B] px-3 text-sm"><option value="study_minutes">Study minutes</option><option value="topics">Topics completed</option><option value="tests">Tests completed</option><option value="score">Score at least</option></select></label>
        <label className="block text-xs text-[#B8AAAE]">Period<select value={period} onChange={e=>setPeriod(e.target.value as Goal["period"])} className="mt-2 min-h-11 w-full border border-white/[0.1] bg-[#11090B] px-3 text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option></select></label>
        <label className="block text-xs text-[#B8AAAE]">Target<input type="number" min="1" max={type==="score"?10:undefined} step="1" value={target} onChange={e=>setTarget(e.target.value)} className="mt-2 min-h-11 w-full border border-white/[0.1] bg-[#11090B] px-3 text-sm"/></label>
        {message?<p className="text-xs text-[#9f9195]" role="status">{message}</p>:null}<button className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white hover:bg-[#C52845]"><Plus className="size-4"/>Add goal</button>
      </form></aside>
    </div>
  </div></main>;
}
