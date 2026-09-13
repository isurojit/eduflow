"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { focusRemainingSeconds, formatTimer } from "@/lib/focus/timer";
import type { ActiveFocusSession, Subject } from "@/types/domain";

export function ActiveFocusSummary({ session, subjects }: { session: ActiveFocusSession | null; subjects: Subject[] }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!session || session.status !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [session?.id, session?.status]);

  if (!session) {
    return <div className="bg-[#11090B] p-6 sm:p-8 lg:p-9"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.21em] text-[#807478]">Active focus</p><Clock3 className="size-4 text-[#A81736]" /></div><p className="mt-8 font-[family-name:var(--font-display)] text-5xl font-medium tracking-[-.055em]">25:00</p><p className="mt-2 text-xs text-[#807478]">No focus session prepared</p><div className="mt-8 border-t border-white/[0.07] pt-5"><Link href="/subjects" className="focus-ring inline-flex min-h-10 items-center text-xs text-[#D8CDD0]">Choose a topic →</Link></div></div>;
  }

  const subject = subjects.find((item) => item.id === session.subjectId);
  const topic = subject?.topics.find((item) => item.id === session.topicId);
  const remaining = focusRemainingSeconds(session, now);
  return <div className="bg-[#11090B] p-6 sm:p-8 lg:p-9"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.21em] text-[#807478]">Active focus</p><Clock3 className="size-4 text-[#A81736]" /></div><p className="mt-8 font-[family-name:var(--font-display)] text-5xl font-medium tracking-[-.055em]">{formatTimer(remaining)}</p><p className="mt-2 text-xs text-[#807478]">{session.mode === "break" ? "Break" : topic?.name ?? "Focus block"} · {session.status}</p><div className="mt-8 border-t border-white/[0.07] pt-5"><Link href="/focus" className="focus-ring inline-flex min-h-10 items-center text-xs text-[#D8CDD0]">Open focus mode →</Link></div></div>;
}
