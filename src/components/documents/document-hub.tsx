"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileCheck2, FileText, LoaderCircle, Sparkles, Upload, WandSparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { cloudFetch } from "@/lib/cloud/api-client";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { DocumentKind, UserDocumentRecord } from "@/types/cloud";

const kinds: Array<{ value: DocumentKind; label: string }> = [
  { value: "other", label: "Auto detect" }, { value: "notes", label: "Notes" }, { value: "syllabus", label: "Syllabus" }, { value: "marksheet", label: "Marksheet" }, { value: "question-paper", label: "Question paper" },
];

export function DocumentHub() {
  const profile = useEduFlowStore((s) => s.profile);
  const importSubjectTopics = useEduFlowStore((s) => s.importSubjectTopics);
  const createNote = useEduFlowStore((s) => s.createNote);
  const [docs, setDocs] = useState<UserDocumentRecord[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<DocumentKind>("other");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try { const r = await cloudFetch("/api/documents"); const d = await r.json(); if (r.ok) setDocs(d.documents ?? []); }
    catch { /* cloud can be unconfigured */ }
  };
  useEffect(() => { void load(); }, []);

  const upload = async (event: FormEvent) => {
    event.preventDefault(); if (!file) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const body = new FormData(); body.append("file", file); body.append("kind", kind);
      const response = await cloudFetch("/api/documents", { method: "POST", body });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Upload failed.");
      setDocs((current) => [data.document, ...current]); setFile(null); setMessage("Document read successfully. Review the extracted information below before importing it into EduFlow.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
    finally { setBusy(false); }
  };

  const importDoc = (doc: UserDocumentRecord) => {
    setError(""); setMessage("");
    if (doc.analysis.syllabus?.length) {
      let imported = 0;
      for (const subject of doc.analysis.syllabus) if (importSubjectTopics(subject.name, subject.topics).ok) imported += 1;
      setMessage(imported ? `Imported ${imported} syllabus subject${imported === 1 ? "" : "s"} into Subjects.` : "No new syllabus topics were available to import.");
      return;
    }
    if (doc.analysis.suggestedKind === "notes" && (doc.analysis.noteBody || doc.extractedText)) {
      const result = createNote({ title: doc.analysis.noteTitle || doc.name.replace(/\.[^.]+$/, ""), body: doc.analysis.noteBody || doc.extractedText.slice(0, 12000) });
      setMessage(result.ok ? "Imported as an EduFlow note." : result.message || "Could not import this note.");
      return;
    }
    if (doc.analysis.marks?.length) {
      const body = [doc.analysis.summary, "", "Marks", ...doc.analysis.marks.map((m) => `• ${m.subject}: ${m.score ?? "—"}${m.maximum ? ` / ${m.maximum}` : ""}${m.grade ? ` · Grade ${m.grade}` : ""}`)].join("\n");
      const result = createNote({ title: `Academic record · ${doc.name.replace(/\.[^.]+$/, "")}`, body });
      setMessage(result.ok ? "Marksheet analysis saved under Notes as an academic record. It is kept separate from EduFlow test analytics." : result.message || "Could not save the record.");
      return;
    }
    if (doc.extractedText) {
      const result = createNote({ title: doc.name.replace(/\.[^.]+$/, ""), body: doc.extractedText.slice(0, 12000) });
      setMessage(result.ok ? "Document text imported into Notes." : result.message || "Could not import document text.");
    }
  };

  return <main className="min-h-screen"><AppHeader name={profile?.name} context="Documents"/><div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-7 lg:px-10"><section className="grid gap-8 border-b border-white/[0.08] pb-9 lg:grid-cols-[1fr_.75fr]"><div><p className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[#807478]"><Sparkles className="size-3.5 text-[#A81736]"/>AI document intelligence</p><h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Upload what you already study from.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Upload notes, syllabi, marksheets, question papers or spreadsheets. EduFlow extracts usable text, identifies the document, and prepares safe imports instead of silently rewriting your learning history.</p><p className="mt-4 text-xs text-[#62585b]">PDF · DOCX · XLSX · CSV · TXT · PNG/JPG/WebP · max 10 MB</p></div><form onSubmit={upload} className="border border-white/[0.09] bg-[#0d090a] p-5"><label className="text-[10px] uppercase tracking-[.15em] text-[#807478]">Document type</label><select value={kind} onChange={(e)=>setKind(e.target.value as DocumentKind)} className="focus-ring mt-2 min-h-11 w-full border border-white/[0.1] bg-[#11090B] px-3 text-sm">{kinds.map(k=><option key={k.value} value={k.value}>{k.label}</option>)}</select><label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-white/[0.12] bg-[#11090B] px-4 text-center"><Upload className="size-5 text-[#A81736]"/><span className="mt-2 text-sm text-[#B8AAAE]">{file?.name || "Choose a study file"}</span><input className="sr-only" type="file" accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.webp" onChange={(e)=>setFile(e.target.files?.[0] ?? null)}/></label><button disabled={!file||busy} className="focus-ring mt-4 flex min-h-11 w-full items-center justify-center gap-2 bg-[#A81736] text-sm font-semibold text-white disabled:opacity-40">{busy?<LoaderCircle className="size-4 animate-spin"/>:<WandSparkles className="size-4"/>}{busy?"Reading document…":"Upload & understand"}</button></form></section>{message?<div className="mt-6 border-l-2 border-[#78152A] bg-[#11090B] px-4 py-3 text-xs text-[#B8AAAE]">{message}</div>:null}{error?<div className="mt-6 border-l-2 border-[#C52845] bg-[#180C10] px-4 py-3 text-xs text-[#e5a0ad]">{error}</div>:null}<section className="py-8"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#807478]">Your uploads</p><h2 className="mt-2 text-2xl font-semibold">Document library</h2></div><span className="text-xs text-[#62585b]">{docs.length} document{docs.length===1?"":"s"}</span></div>{!docs.length?<div className="mt-6 border-y border-white/[0.08] py-10 text-sm text-[#807478]">No cloud documents yet. Upload your first note, syllabus or marksheet above.</div>:<div className="mt-5 divide-y divide-white/[0.07]">{docs.map(doc=><article key={doc.id} className="grid gap-5 py-6 lg:grid-cols-[220px_1fr_auto]"><div><div className="flex items-center gap-2 text-[9px] uppercase tracking-[.14em] text-[#A81736]"><FileText className="size-3.5"/>{doc.analysis.suggestedKind}</div><h3 className="mt-3 break-words text-sm font-medium">{doc.name}</h3><p className="mt-2 text-[10px] text-[#62585b]">{Math.round(doc.size/1024)} KB · {doc.storage}</p></div><div><p className="text-sm leading-6 text-[#B8AAAE]">{doc.analysis.summary}</p>{doc.analysis.keyPoints?.length?<ul className="mt-3 space-y-1 text-xs text-[#807478]">{doc.analysis.keyPoints.slice(0,4).map(point=><li key={point}>• {point}</li>)}</ul>:null}{doc.analysis.marks?.length?<div className="mt-4 flex flex-wrap gap-2">{doc.analysis.marks.slice(0,8).map(mark=><span key={mark.subject} className="border border-white/[0.08] bg-[#11090B] px-3 py-2 text-xs">{mark.subject} · {mark.score ?? mark.grade ?? "read"}{mark.maximum?`/${mark.maximum}`:""}</span>)}</div>:null}{doc.analysis.syllabus?.length?<p className="mt-4 text-xs text-[#807478]">Detected {doc.analysis.syllabus.length} subject group{doc.analysis.syllabus.length===1?"":"s"} and {doc.analysis.syllabus.reduce((n,s)=>n+s.topics.length,0)} topics.</p>:null}</div><button onClick={()=>importDoc(doc)} className="focus-ring inline-flex min-h-10 items-center gap-2 self-start border border-white/[0.1] px-3 text-xs text-[#D8CDD0] hover:bg-white/[0.04]"><FileCheck2 className="size-3.5"/>Import to EduFlow</button></article>)}</div>}</section></div></main>;
}
