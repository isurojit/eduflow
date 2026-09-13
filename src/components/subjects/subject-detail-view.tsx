"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Plus, Star, X } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { formatStudyTime } from "@/lib/analytics/dashboard";
import { subjectProgress, subjectRecentScore, subjectStatus, subjectStudySeconds } from "@/lib/subjects/subject-metrics";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { Subject, TopicDifficulty } from "@/types/domain";

function Difficulty({ value }: { value?: TopicDifficulty }) {
  return <span className="text-[9px] uppercase tracking-[.13em] text-[#807478]">{value ?? "medium"}</span>;
}

export function SubjectDetailView({ subject }: { subject: Subject }) {
  const reduceMotion = useReducedMotion();
  const store = useEduFlowStore();
  const liveSubject = store.subjects.find((item) => item.id === subject.id) ?? subject;
  const progress = subjectProgress(liveSubject);
  const health = subjectStatus(liveSubject.id, store.testAttempts);
  const studySeconds = subjectStudySeconds(liveSubject.id, store);
  const recentScore = subjectRecentScore(liveSubject.id, store.testAttempts);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<TopicDifficulty>("medium");
  const [error, setError] = useState<string | null>(null);

  function submitTopic(event: FormEvent) {
    event.preventDefault();
    const result = store.addTopic(liveSubject.id, { name, description, difficulty });
    if (!result.ok) return setError(result.message ?? "Could not add topic.");
    setName(""); setDescription(""); setDifficulty("medium"); setError(null); setAdding(false);
  }

  return (
    <main className="min-h-screen">
      <AppHeader name={store.profile?.name} context={liveSubject.name} />
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-10 xl:px-12">
        <Link href="/subjects" className="focus-ring inline-flex min-h-10 items-center gap-2 text-xs text-[#807478] transition hover:text-white"><ArrowLeft className="size-3.5" /> All subjects</Link>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-8 border-b border-white/[0.08] pb-9 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#A81736]">{liveSubject.isCustom ? "User-created subject" : "Starter syllabus"}</p><span className="h-px w-8 bg-white/[0.1]" /><p className="text-[10px] uppercase tracking-[.15em] text-[#807478]">{health.label}</p></div>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-.05em] sm:text-5xl">{liveSubject.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#9f9195]">{liveSubject.isCustom ? "This syllabus is yours. Add topics that match your actual curriculum." : "EduFlow starter content is a planning aid, not an official board or university syllabus."}</p>
          </div>
          <button onClick={() => setAdding(true)} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white transition hover:bg-[#C52845]"><Plus className="size-4" /> Add topic</button>
        </motion.section>

        <section className="grid gap-px border-x border-b border-white/[0.08] bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.16em] text-[#807478]">Completion</p><p className="mt-3 text-2xl font-semibold">{progress.percentage}%</p><p className="mt-1 text-[11px] text-[#807478]">{progress.completed} / {progress.total} topics</p></div>
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.16em] text-[#807478]">Performance</p><p className="mt-3 text-lg font-semibold">{health.label}</p><p className="mt-1 text-[11px] text-[#807478]">{health.average === null ? "Complete a test to measure this" : `${health.average.toFixed(1)}/10 average`}</p></div>
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.16em] text-[#807478]">Study time</p><p className="mt-3 text-lg font-semibold">{studySeconds ? formatStudyTime(studySeconds) : "—"}</p><p className="mt-1 text-[11px] text-[#807478]">Completed focus sessions only</p></div>
          <div className="bg-[#0d090a] p-5"><p className="text-[9px] uppercase tracking-[.16em] text-[#807478]">Recent test</p><p className="mt-3 text-lg font-semibold">{recentScore ? `${recentScore.score}/${recentScore.totalMarks}` : "—"}</p><p className="mt-1 text-[11px] text-[#807478]">{recentScore ? recentScore.topicName : "No attempts yet"}</p></div>
        </section>

        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Syllabus</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">Topics</h2></div>
            <p className="text-xs text-[#807478]">Check completion · star important · open to study</p>
          </div>

          {liveSubject.topics.length ? (
            <div>
              {liveSubject.topics.map((topic, index) => (
                <motion.article key={topic.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.025, 0.16) }} className="group grid gap-4 border-b border-white/[0.06] py-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                  <button
                    onClick={() => store.toggleTopicCompletion(liveSubject.id, topic.id)}
                    aria-label={topic.completed ? `Mark ${topic.name} incomplete` : `Mark ${topic.name} complete`}
                    className={`focus-ring grid size-11 place-items-center border transition ${topic.completed ? "border-[#A81736] bg-[#78152A]/30 text-white" : "border-white/[0.12] text-transparent hover:border-[#78152A]"}`}
                  >
                    <Check className="size-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><h3 className={`text-sm font-medium ${topic.completed ? "text-[#9f9195] line-through decoration-[#78152A]" : "text-[#F7F2F3]"}`}>{topic.name}</h3><Difficulty value={topic.difficulty} />{!topic.isStarterContent ? <span className="text-[9px] uppercase tracking-[.12em] text-[#78152A]">Your topic</span> : null}</div>
                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#807478]">{topic.description || (topic.isStarterContent ? "Starter topic. Open it to track your status and learning history." : "No description added.")}</p>
                  </div>
                  <div className="flex items-center gap-1 md:justify-end">
                    <button onClick={() => store.toggleTopicBookmark(liveSubject.id, topic.id)} aria-label={topic.bookmarked ? `Remove ${topic.name} from important topics` : `Mark ${topic.name} important`} className="focus-ring grid size-11 place-items-center text-[#807478] transition hover:bg-white/[0.04] hover:text-[#A81736]"><Star className={`size-4 ${topic.bookmarked ? "fill-[#78152A] text-[#A81736]" : ""}`} /></button>
                    <Link href={`/subjects/${liveSubject.id}/topics/${topic.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 px-3 text-xs font-medium text-[#B8AAAE] transition hover:bg-white/[0.04] hover:text-white">Open <ArrowRight className="size-3.5" /></Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="py-12"><p className="text-sm font-medium">This subject has no topics yet.</p><p className="mt-2 text-xs text-[#807478]">Add the first topic to begin tracking syllabus progress.</p></div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {adding ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-black/65 p-0 backdrop-blur-sm sm:place-items-center sm:p-6" onMouseDown={(event) => { if (event.currentTarget === event.target) setAdding(false); }}>
            <motion.form onSubmit={submitTopic} initial={reduceMotion ? false : { opacity: 0, y: 24, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[22px] border border-white/[0.1] bg-[#11090B] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-none sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#A81736]">{liveSubject.name}</p><h2 className="mt-2 text-2xl font-semibold">Add a syllabus topic</h2></div><button type="button" onClick={() => setAdding(false)} className="focus-ring grid size-10 place-items-center text-[#807478] hover:bg-white/[0.04] hover:text-white" aria-label="Close add topic dialog"><X className="size-4" /></button></div>
              <label className="mt-6 block text-xs text-[#B8AAAE]">Topic name<input autoFocus value={name} onChange={(e) => { setName(e.target.value); setError(null); }} className="focus-ring mt-2 min-h-12 w-full border border-white/[0.1] bg-[#090708] px-3 text-sm outline-none" placeholder="e.g. Binary Trees" /></label>
              <label className="mt-4 block text-xs text-[#B8AAAE]">Short description <span className="text-[#807478]">(optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="focus-ring mt-2 min-h-24 w-full resize-y border border-white/[0.1] bg-[#090708] p-3 text-sm outline-none" placeholder="What does this topic cover?" /></label>
              <label className="mt-4 block text-xs text-[#B8AAAE]">Difficulty<div className="relative mt-2"><select value={difficulty} onChange={(e) => setDifficulty(e.target.value as TopicDifficulty)} className="focus-ring min-h-12 w-full appearance-none border border-white/[0.1] bg-[#090708] px-3 text-sm outline-none"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#807478]" /></div></label>
              {error ? <p className="mt-4 text-xs text-[#C96B7D]" role="alert">{error}</p> : null}
              <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setAdding(false)} className="focus-ring min-h-11 px-4 text-xs text-[#9f9195] hover:bg-white/[0.04]">Cancel</button><button type="submit" className="focus-ring min-h-11 bg-[#A81736] px-5 text-xs font-semibold text-white hover:bg-[#C52845]">Add topic</button></div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
