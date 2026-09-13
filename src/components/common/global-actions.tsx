"use client";

import { Bell, Search } from "lucide-react";
import { useEduFlowStore } from "@/store/use-eduflow-store";

export function openGlobalSearch() {
  window.dispatchEvent(new Event("eduflow:open-search"));
}

export function openNotifications() {
  window.dispatchEvent(new Event("eduflow:open-notifications"));
}

export function GlobalActions({ compact = false }: { compact?: boolean }) {
  const unread = useEduFlowStore((state) => state.notifications.filter((item) => !item.readAt).length);
  return (
    <div className="flex items-center gap-1">
      <button onClick={openGlobalSearch} className="focus-ring inline-flex min-h-10 items-center gap-2 px-2.5 text-xs text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white" aria-label="Search EduFlow">
        <Search className="size-3.5" />
        {!compact ? <><span className="hidden xl:inline">Search</span><span className="hidden 2xl:inline border border-white/[0.08] px-1.5 py-0.5 text-[9px] text-[#62585b]">⌘K</span></> : null}
      </button>
      <button onClick={openNotifications} className="focus-ring relative grid min-h-10 min-w-10 place-items-center text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white" aria-label={unread ? `${unread} unread notifications` : "Notifications"}>
        <Bell className="size-3.5" />
        {unread ? <span className="absolute right-1.5 top-1.5 grid min-h-3 min-w-3 place-items-center rounded-full bg-[#A81736] px-1 text-[8px] font-bold text-white">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
    </div>
  );
}
