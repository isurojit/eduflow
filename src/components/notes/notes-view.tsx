"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Save, Search, StickyNote, Trash2, X } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Note } from "@/types/domain";

interface Draft { title: string; body: string; subjectId: string; topicId: string; }
const emptyDraft: Draft = { title: "", body: "", subjectId: "", topicId: "" };
function niceDate(value: string){return new Intl.DateTimeFormat(undefined,{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(value));}

export function NotesView(){
  const store=useEduFlowStore();
  const params=useSearchParams();
  const [query,setQuery]=useState("");
  const [editingId,setEditingId]=useState<string|null>(null);
  const [draft,setDraft]=useState<Draft>(emptyDraft);
  const [message,setMessage]=useState("");
  const [editorOpen,setEditorOpen]=useState(false);
  const selectedSubject=store.subjects.find(subject=>subject.id===draft.subjectId);
  const topics=selectedSubject?.topics??[];

  useEffect(()=>{
    const noteId=params.get("note");
    if(noteId){const note=store.notes.find(item=>item.id===noteId);if(note){edit(note);return;}}
    const subjectId=params.get("subjectId")??"";
    const topicId=params.get("topicId")??"";
    if(subjectId && store.subjects.some(subject=>subject.id===subjectId)){
      setDraft(value=>({...value,subjectId,topicId:store.subjects.find(subject=>subject.id===subjectId)?.topics.some(topic=>topic.id===topicId)?topicId:""}));
      setEditorOpen(true);
    }
  },[params,store.subjects,store.notes]);

  const filtered=useMemo(()=>{
    const needle=query.trim().toLowerCase();
    return [...store.notes].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).filter(note=>{
      if(!needle)return true;
      const subject=store.subjects.find(item=>item.id===note.subjectId)?.name??"";
      const topic=store.subjects.flatMap(item=>item.topics).find(item=>item.id===note.topicId)?.name??"";
      return `${note.title} ${note.body} ${subject} ${topic}`.toLowerCase().includes(needle);
    });
  },[query,store.notes,store.subjects]);

  function resetEditor(){setEditingId(null);setDraft(emptyDraft);setMessage("");setEditorOpen(false);}
  function edit(note:Note){setEditingId(note.id);setDraft({title:note.title,body:note.body,subjectId:note.subjectId??"",topicId:note.topicId??""});setMessage("");setEditorOpen(true);}
  function submit(event:FormEvent){event.preventDefault();const input={title:draft.title,body:draft.body,subjectId:draft.subjectId||undefined,topicId:draft.topicId||undefined};const result=editingId?store.updateNote(editingId,input):store.createNote(input);if(!result.ok){setMessage(result.message??"Could not save this note.");return;}setMessage(editingId?"Changes saved.":"Note saved.");if(!editingId)setDraft(emptyDraft);}
  function remove(note:Note){if(!window.confirm(`Delete “${note.title}”? This cannot be undone.`))return;store.deleteNote(note.id);if(editingId===note.id)resetEditor();}

  return <main className="min-h-screen"><AppHeader name={store.profile?.name} context="Notes"/><div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10 xl:px-12">
    <header className="border-b border-white/[0.08] pb-8"><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Your own study material</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Notes</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Keep personal notes linked to a subject or exact topic. Search includes titles, note text, subjects and topics.</p></div><button onClick={()=>{setEditingId(null);setDraft(emptyDraft);setMessage("");setEditorOpen(true)}} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white hover:bg-[#C52845]"><Plus className="size-4"/>New note</button></div></header>
    <div className="grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <label className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#62585b]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search notes..." className="focus-ring min-h-12 w-full border border-white/[0.09] bg-transparent pl-10 pr-4 text-sm placeholder:text-[#5f5558]"/></label>
        <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">{filtered.length?filtered.map(note=>{const subject=store.subjects.find(item=>item.id===note.subjectId);const topic=subject?.topics.find(item=>item.id===note.topicId);return <article key={note.id} className="py-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><StickyNote className="size-3.5 text-[#78152A]"/><h2 className="truncate text-sm font-semibold">{note.title}</h2></div><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-[#9f9195]">{note.body}</p><div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#62585b]"><span>Updated {niceDate(note.updatedAt)}</span>{subject?<span>{subject.name}</span>:null}{topic?<span>{topic.name}</span>:null}</div></div><div className="flex shrink-0 gap-1"><button onClick={()=>edit(note)} className="focus-ring grid min-h-10 min-w-10 place-items-center border border-white/[0.08] text-[#807478] hover:text-white" aria-label={`Edit ${note.title}`}><Pencil className="size-3.5"/></button><button onClick={()=>remove(note)} className="focus-ring grid min-h-10 min-w-10 place-items-center border border-white/[0.08] text-[#807478] hover:text-white" aria-label={`Delete ${note.title}`}><Trash2 className="size-3.5"/></button></div></div></article>}):<div className="py-10"><p className="text-sm font-medium">{query?"No notes match your search.":"No notes yet."}</p><p className="mt-2 text-xs text-[#807478]">{query?"Try a topic, subject, or phrase from the note.":"Create your first note or open a topic and attach a note there."}</p></div>}</div>
      </section>
      <aside className={`${editorOpen?"fixed inset-0 z-[80] flex items-end bg-black/70 backdrop-blur-sm xl:static xl:block xl:bg-transparent xl:backdrop-blur-none":"hidden xl:block"}`} onMouseDown={(event)=>{if(editorOpen&&event.currentTarget===event.target)resetEditor()}}><form onSubmit={submit} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[22px] border border-white/[0.08] bg-[#0d090a] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 xl:sticky xl:top-24 xl:max-h-none xl:rounded-none"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.15em] text-[#807478]">{editingId?"Editing":"New note"}</p><h2 className="mt-1 text-lg font-semibold">{editingId?"Update your note":"Capture what matters"}</h2></div>{editorOpen?<button type="button" onClick={resetEditor} className="focus-ring grid min-h-10 min-w-10 place-items-center text-[#807478] xl:hidden" aria-label="Close editor"><X className="size-4"/></button>:null}</div>
          <div className="mt-5 space-y-4"><label className="block"><span className="text-[10px] uppercase tracking-[.12em] text-[#62585b]">Title</span><input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} maxLength={100} className="focus-ring mt-2 min-h-11 w-full border border-white/[0.09] bg-transparent px-3 text-sm" placeholder="e.g. Kirchhoff’s laws recap"/></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[.12em] text-[#62585b]">Subject</span><select value={draft.subjectId} onChange={e=>setDraft({...draft,subjectId:e.target.value,topicId:""})} className="focus-ring mt-2 min-h-11 w-full border border-white/[0.09] bg-[#0d090a] px-3 text-sm"><option value="">No subject link</option>{store.subjects.map(subject=><option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[.12em] text-[#62585b]">Topic</span><select disabled={!draft.subjectId} value={draft.topicId} onChange={e=>setDraft({...draft,topicId:e.target.value})} className="focus-ring mt-2 min-h-11 w-full border border-white/[0.09] bg-[#0d090a] px-3 text-sm disabled:opacity-40"><option value="">No topic link</option>{topics.map(topic=><option key={topic.id} value={topic.id}>{topic.name}</option>)}</select></label>
          <label className="block"><span className="text-[10px] uppercase tracking-[.12em] text-[#62585b]">Note</span><textarea value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} rows={11} className="focus-ring mt-2 w-full resize-y border border-white/[0.09] bg-transparent p-3 text-sm leading-6" placeholder="Write definitions, examples, mistakes to avoid, or your own explanation..."/></label></div>
          {message?<p className={`mt-4 text-xs ${message.includes("saved")?"text-[#B8AAAE]":"text-[#D59AA6]"}`}>{message}</p>:null}<div className="mt-5 flex gap-2"><button type="submit" className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white hover:bg-[#C52845]"><Save className="size-3.5"/>{editingId?"Save changes":"Save note"}</button>{editingId?<button type="button" onClick={resetEditor} className="focus-ring min-h-11 border border-white/[0.09] px-4 text-xs text-[#9f9195]">Cancel</button>:null}</div>
        </form></aside>
    </div>
  </div></main>;
}
