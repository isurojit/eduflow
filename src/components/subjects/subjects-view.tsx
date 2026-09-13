"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookMarked, BookOpen, Clock3, Star } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { formatStudyTime } from "@/lib/analytics/dashboard";
import { subjectLastStudied, subjectProgress, subjectStatus, subjectStudySeconds } from "@/lib/subjects/subject-metrics";
import type { EduFlowState } from "@/types/domain";

function formatLastStudied(value: string | null) {
  if (!value) return "Not studied yet";
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  if (sameDay) return "Today";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date);
}

export function SubjectsView({ state }: { state: EduFlowState }) {
  const reduceMotion = useReducedMotion();
  const bookmarked = state.subjects.flatMap((subject) => subject.topics.filter((topic) => topic.bookmarked).map((topic) => ({ subject, topic })));

  return (
    <main className="min-h-screen">
      <AppHeader
        name={state.profile?.name}
        context={state.profile?.educationLevel === "school" ? state.profile.classGrade : state.profile?.course}
      />
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 sm:py-10 lg:px-10 xl:px-12">
        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#A81736]">Your syllabus</p>
          <div className="mt-3 grid gap-5 border-b border-white/[0.08] pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Subjects</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9f9195]">Every percentage here comes from your actual topic completion. Starter syllabi are clearly separated from topics you add yourself.</p>
            </div>
            <p className="text-xs text-[#807478]">{state.subjects.length} {state.subjects.length === 1 ? "subject" : "subjects"}</p>
          </div>
        </motion.section>

        <section className="grid gap-px border-x border-b border-white/[0.08] bg-white/[0.07] lg:grid-cols-2">
          {state.subjects.map((subject, index) => {
            const progress = subjectProgress(subject);
            const health = subjectStatus(subject.id, state.testAttempts);
            const lastStudied = subjectLastStudied(subject, state);
            const seconds = subjectStudySeconds(subject.id, state);
            const nextTopic = subject.topics.find((topic) => !topic.completed) ?? subject.topics[0];
            return (
              <motion.article
                key={subject.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.2) }}
                className="group bg-[#0d090a] p-6 transition hover:bg-[#11090B] sm:p-8"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[.18em] text-[#807478]">{subject.isCustom ? "Your subject" : "Starter syllabus"}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{subject.name}</h2>
                  </div>
                  <BookOpen className="size-5 text-[#78152A] transition group-hover:text-[#A81736]" aria-hidden="true" />
                </div>

                <div className="mt-7 flex items-end justify-between gap-5">
                  <div>
                    <p className="text-3xl font-semibold tracking-[-.04em]">{progress.percentage}%</p>
                    <p className="mt-1 text-[11px] text-[#807478]">{progress.completed} of {progress.total} topics</p>
                  </div>
                  <span className="border border-white/[0.09] px-2.5 py-1 text-[9px] uppercase tracking-[.13em] text-[#9f9195]">{health.label}</span>
                </div>
                <div className="mt-4 h-1 bg-white/[0.06]">
                  <motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${progress.percentage}%` }} className="h-full bg-[#A81736]" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-white/[0.06] py-4 text-xs">
                  <div><p className="text-[#807478]">Last studied</p><p className="mt-1 text-[#D8CDD0]">{formatLastStudied(lastStudied)}</p></div>
                  <div><p className="text-[#807478]">Study time</p><p className="mt-1 text-[#D8CDD0]">{seconds ? formatStudyTime(seconds) : "No sessions yet"}</p></div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link href={`/subjects/${subject.id}`} className="focus-ring inline-flex min-h-11 items-center gap-2 bg-[#A81736] px-4 text-xs font-semibold text-white transition hover:bg-[#C52845]">
                    View syllabus <ArrowRight className="size-3.5" />
                  </Link>
                  {nextTopic ? (
                    <Link href={`/subjects/${subject.id}/topics/${nextTopic.id}`} className="focus-ring inline-flex min-h-11 items-center px-4 text-xs font-medium text-[#B8AAAE] transition hover:bg-white/[0.04] hover:text-white">
                      {progress.percentage === 100 ? "Review a topic" : "Continue study"}
                    </Link>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </section>

        <section className="grid gap-8 py-10 lg:grid-cols-[.34fr_.66fr]">
          <div>
            <div className="flex items-center gap-2 text-[#A81736]"><BookMarked className="size-4" /><p className="text-[10px] font-semibold uppercase tracking-[.2em]">Important Topics</p></div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-.035em]">Keep the hard things close.</h2>
            <p className="mt-3 max-w-sm text-xs leading-5 text-[#807478]">Use the star beside any topic to collect it here. Bookmarks persist across refreshes.</p>
          </div>
          <div className="border-t border-white/[0.08]">
            {bookmarked.length ? bookmarked.map(({ subject, topic }) => (
              <Link key={topic.id} href={`/subjects/${subject.id}/topics/${topic.id}`} className="focus-ring group flex min-h-16 items-center gap-4 border-b border-white/[0.06] py-4 transition hover:pl-2">
                <Star className="size-4 fill-[#78152A] text-[#A81736]" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{topic.name}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-[#807478]">{subject.name}</p></div>
                <ArrowRight className="size-4 text-[#5f5558] transition group-hover:text-[#A81736]" />
              </Link>
            )) : (
              <div className="py-8">
                <Clock3 className="size-5 text-[#78152A]" />
                <p className="mt-4 text-sm font-medium">Nothing marked important yet.</p>
                <p className="mt-2 text-xs leading-5 text-[#807478]">Open a subject and star the topics you want to revisit.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
