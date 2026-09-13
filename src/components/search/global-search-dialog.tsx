"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, BookOpen, FileText, Search, StickyNote, X } from "lucide-react";
import { searchEduFlow, type SearchResultKind } from "@/lib/search/search";
import { useEduFlowStore } from "@/store/use-eduflow-store";

const groups: Array<{ kind: SearchResultKind; label: string }> = [
  { kind: "subject", label: "Subjects" },
  { kind: "topic", label: "Topics" },
  { kind: "bookmark", label: "Important topics" },
  { kind: "note", label: "Notes" },
  { kind: "revision", label: "Revision" },
];

const iconFor = (kind: SearchResultKind) => kind === "subject" ? BookOpen : kind === "bookmark" ? Bookmark : kind === "note" ? StickyNote : kind === "revision" ? FileText : Search;

export function GlobalSearchDialog() {
  const store = useEduFlowStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchEduFlow(store, query), [query, store.subjects, store.notes, store.updatedAt]);

  useEffect(() => {
    const show = () => setOpen(true);
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("eduflow:open-search", show);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("eduflow:open-search", show); window.removeEventListener("keydown", key); };
  }, []);

  useEffect(() => { if (open) window.setTimeout(() => inputRef.current?.focus(), 20); else setQuery(""); }, [open]);
  if (!open || !store.profile) return null;

  return <div className="fixed inset-0 z-[90] flex items-end bg-black/65 px-0 py-0 backdrop-blur-sm sm:block sm:px-3 sm:py-[8vh]" role="dialog" aria-modal="true" aria-label="Search EduFlow" onMouseDown={(event)=>{if(event.currentTarget===event.target)setOpen(false)}}>
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-t-[22px] border border-white/[0.1] bg-[#0d090a] pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-none sm:pb-0">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
        <Search className="size-4 shrink-0 text-[#78152A]" />
        <input ref={inputRef} value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search subjects, topics, notes, revision..." className="min-h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-[#62585b]" />
        <button onClick={()=>setOpen(false)} className="focus-ring grid min-h-10 min-w-10 place-items-center text-[#807478] hover:text-white" aria-label="Close search"><X className="size-4"/></button>
      </div>
      <div className="max-h-[72dvh] overflow-y-auto p-2 sm:max-h-[65vh]">
        {!query.trim() ? <div className="px-4 py-10"><p className="text-sm font-medium">Find anything in your study space.</p><p className="mt-2 text-xs leading-5 text-[#807478]">Search includes selected subjects, topics, your notes, Important bookmarks, and starter revision content. Press Ctrl/Cmd + K from anywhere to reopen this.</p></div> : results.length ? groups.map(group=>{
          const items=results.filter(item=>item.kind===group.kind); if(!items.length)return null;
          return <section key={group.kind} className="py-2"><p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[.17em] text-[#62585b]">{group.label}</p>{items.map(item=>{const Icon=iconFor(item.kind);return <Link key={item.id} href={item.href} onClick={()=>setOpen(false)} className="focus-ring flex min-h-12 items-center gap-3 px-3 py-2 transition hover:bg-white/[0.04]"><span className="grid size-8 shrink-0 place-items-center border border-white/[0.08] text-[#78152A]"><Icon className="size-3.5"/></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#D8CDD0]">{item.title}</span><span className="mt-0.5 block truncate text-[10px] text-[#62585b]">{item.subtitle}</span></span></Link>})}</section>
        }) : <div className="px-4 py-10"><p className="text-sm font-medium">No results for “{query}”.</p><p className="mt-2 text-xs text-[#807478]">Try a subject name, topic, note phrase, or revision keyword.</p></div>}
      </div>
    </div>
  </div>;
}
