"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CheckCheck, Goal, TimerReset, X } from "lucide-react";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { NotificationKind } from "@/types/domain";

const iconFor = (kind: NotificationKind) => kind === "exam" ? CalendarDays : kind === "goal" ? Goal : kind === "study_reminder" ? TimerReset : Bell;
function relative(value:string){const diff=Math.max(0,Date.now()-new Date(value).getTime());const mins=Math.floor(diff/60000);if(mins<1)return "Just now";if(mins<60)return `${mins}m ago`;const hrs=Math.floor(mins/60);if(hrs<24)return `${hrs}h ago`;return new Intl.DateTimeFormat(undefined,{day:"numeric",month:"short"}).format(new Date(value));}

export function NotificationCenter() {
  const store = useEduFlowStore();
  const [open,setOpen]=useState(false);
  const [permissionMessage,setPermissionMessage]=useState("");
  const unread=useMemo(()=>store.notifications.filter(item=>!item.readAt).length,[store.notifications]);

  useEffect(()=>{const show=()=>setOpen(true);const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};window.addEventListener("eduflow:open-notifications",show);window.addEventListener("keydown",key);return()=>{window.removeEventListener("eduflow:open-notifications",show);window.removeEventListener("keydown",key)}},[]);

  useEffect(()=>{
    if(!store.hydrated || !store.notificationPreferences.browserEnabled || typeof Notification==="undefined" || Notification.permission!=="granted")return;
    const pending=store.notifications.filter(item=>!item.readAt&&!item.browserDeliveredAt).slice(0,2);
    pending.forEach(item=>{try{const notice=new Notification(item.title,{body:item.message,tag:item.sourceKey});notice.onclick=()=>{window.focus();if(item.href)window.location.assign(item.href)};store.markNotificationBrowserDelivered(item.id);}catch{ /* in-app center remains the fallback */ }});
  },[store.hydrated,store.notifications,store.notificationPreferences.browserEnabled]);

  async function enableBrowser(){
    if(typeof Notification==="undefined"){setPermissionMessage("Browser notifications are not supported here. In-app reminders will keep working.");return;}
    const permission=await Notification.requestPermission();
    if(permission==="granted"){store.setBrowserNotificationsEnabled(true);setPermissionMessage("Browser study reminders enabled.");}
    else {store.setBrowserNotificationsEnabled(false);setPermissionMessage("Permission was not granted. In-app reminders will remain available.");}
  }

  if(!open||!store.profile)return null;
  return <div className="fixed inset-0 z-[95] bg-black/55 backdrop-blur-sm" onMouseDown={(event)=>{if(event.currentTarget===event.target)setOpen(false)}}>
    <aside className="ml-auto flex h-[100dvh] w-full max-w-md flex-col border-l border-white/[0.09] bg-[#0d090a] pb-[env(safe-area-inset-bottom)]" role="dialog" aria-modal="true" aria-label="Notifications">
      <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] p-5"><div><p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">Study reminders</p><h2 className="mt-1 text-xl font-semibold">Notifications {unread?`· ${unread} unread`:""}</h2></div><button onClick={()=>setOpen(false)} className="focus-ring grid min-h-10 min-w-10 place-items-center text-[#807478] hover:text-white" aria-label="Close notifications"><X className="size-4"/></button></header>
      <div className="border-b border-white/[0.08] p-5">
        <div className="flex flex-wrap gap-2"><button onClick={enableBrowser} className="focus-ring min-h-10 bg-[#A81736] px-3 text-xs font-semibold text-white hover:bg-[#C52845]">{store.notificationPreferences.browserEnabled?"Browser reminders enabled":"Enable Study Reminders"}</button><button onClick={()=>store.setInAppNotificationsEnabled(!store.notificationPreferences.inAppEnabled)} className="focus-ring min-h-10 border border-white/[0.09] px-3 text-xs text-[#B8AAAE] hover:text-white">{store.notificationPreferences.inAppEnabled?"Pause in-app reminders":"Resume in-app reminders"}</button>{unread?<button onClick={()=>store.markAllNotificationsRead()} className="focus-ring inline-flex min-h-10 items-center gap-2 border border-white/[0.09] px-3 text-xs text-[#B8AAAE] hover:text-white"><CheckCheck className="size-3.5"/>Mark all read</button>:null}</div>
        <p className="mt-3 text-[10px] leading-4 text-[#62585b]">Browser permission is requested only after you press the button. In-app notifications work without browser permission.</p>{permissionMessage?<p className="mt-2 text-xs text-[#9f9195]">{permissionMessage}</p>:null}
      </div>
      <div className="flex-1 overflow-y-auto">
        {store.notifications.length?store.notifications.map(item=>{const Icon=iconFor(item.kind);const body=<div className={`border-b border-white/[0.06] p-5 transition ${item.readAt?"opacity-55":"bg-white/[0.015]"}`}><div className="flex gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center border border-white/[0.08] text-[#78152A]"><Icon className="size-3.5"/></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-[#D8CDD0]">{item.title}</p><span className="shrink-0 text-[9px] text-[#62585b]">{relative(item.createdAt)}</span></div><p className="mt-2 text-xs leading-5 text-[#807478]">{item.message}</p>{!item.readAt?<button onClick={(e)=>{e.preventDefault();e.stopPropagation();store.markNotificationRead(item.id)}} className="focus-ring mt-3 min-h-8 px-2 text-[10px] font-medium text-[#B8AAAE] hover:bg-white/[0.04] hover:text-white">Mark read</button>:null}</div></div></div>;return item.href?<Link key={item.id} href={item.href} onClick={()=>{store.markNotificationRead(item.id);setOpen(false)}}>{body}</Link>:<div key={item.id}>{body}</div>}):<div className="p-8"><Bell className="size-5 text-[#78152A]"/><p className="mt-4 text-sm font-medium">Nothing needs your attention.</p><p className="mt-2 text-xs leading-5 text-[#807478]">EduFlow creates reminders from real deadlines, goal progress, and study activity instead of filling this panel with generic messages.</p></div>}
      </div>
    </aside>
  </div>;
}
