"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Goal as GoalIcon,
  GraduationCap,
  Sparkles,
  FileText,
  SearchCode,
  Target,
  TestTube2,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { GlobalActions } from "@/components/common/global-actions";
import { ActiveFocusSummary } from "@/components/focus/active-focus-summary";
import { UserMenu } from "@/components/auth/user-menu";
import { buildDashboardSnapshot, formatStudyTime, goalProgress, subjectHealth } from "@/lib/analytics/dashboard";
import type { EduFlowState, Goal } from "@/types/domain";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function goalLabel(goal: Goal) {
  const period = goal.period === "daily" ? "Today" : "This week";
  if (goal.type === "study_minutes") return `${period} · Study time`;
  if (goal.type === "topics") return `${period} · Topics`;
  if (goal.type === "tests") return `${period} · Tests`;
  return `${period} · Score`;
}

function goalValue(goal: Goal, current: number, target: number) {
  const rounded = Math.floor(current);
  if (goal.type === "study_minutes") return `${rounded} / ${target} min`;
  if (goal.type === "score") return `${rounded} / ${target}`;
  return `${rounded} / ${target}`;
}

function activityCopy(date: string, focusSeconds: number, topics: number, tests: number) {
  const parts: string[] = [];
  if (focusSeconds) parts.push(`${formatStudyTime(focusSeconds)} focused`);
  if (topics) parts.push(`${topics} ${topics === 1 ? "topic" : "topics"} completed`);
  if (tests) parts.push(`${tests} ${tests === 1 ? "test" : "tests"}`);
  return { date, text: parts.join(" · ") };
}

export function DashboardView({ state }: { state: EduFlowState }) {
  const reduceMotion = useReducedMotion();
  const snapshot = buildDashboardSnapshot(state);
  const firstName = state.profile?.name.split(" ")[0] ?? "Student";
  const recentActivity = Object.values(state.dailyActivity)
    .filter((item) => item.focusSeconds > 0 || item.topicCompletions > 0 || item.testsCompleted > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const completedToday = snapshot.today.topicCompletions + snapshot.today.testsCompleted + (snapshot.today.focusSeconds > 0 ? 1 : 0);

  const enter = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.34, delay },
  });

  return (
    <main className="min-h-screen px-4 py-4 sm:px-7 sm:py-5 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex min-h-14 items-center justify-between border-b border-white/[0.07] pb-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalActions />
            <Link href="/assistant" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white lg:inline-flex"><GraduationCap className="size-3.5"/><span className="hidden 2xl:inline">AI Copilot</span></Link>
            <Link href="/documents" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white xl:inline-flex"><FileText className="size-3.5"/><span className="hidden 2xl:inline">Documents</span></Link>
            <Link href="/research" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white xl:inline-flex"><SearchCode className="size-3.5"/><span className="hidden 2xl:inline">Research</span></Link>
            <Link href="/subjects" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] sm:inline-flex transition hover:bg-white/[0.04] hover:text-white">
              <BookOpen className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Subjects</span>
            </Link>
            <Link href="/goals" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white sm:inline-flex"><GoalIcon className="size-3.5"/><span className="hidden xl:inline">Goals</span></Link>
            <Link href="/streak" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white md:inline-flex"><Flame className="size-3.5"/><span className="hidden xl:inline">Streak</span></Link>
            <Link href="/achievements" className="focus-ring hidden min-h-10 items-center gap-2 px-3 text-xs font-medium text-[#9f9195] transition hover:bg-white/[0.04] hover:text-white lg:inline-flex"><Award className="size-3.5"/><span className="hidden xl:inline">Awards</span></Link>
            <div className="hidden text-right md:block">
              <p className="text-xs font-medium text-[#D8CDD0]">{state.profile?.name}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[.14em] text-[#807478]">
                {state.profile?.educationLevel === "school" ? state.profile.classGrade : state.profile?.course}
              </p>
            </div>
            <UserMenu />
            <div className="grid size-9 shrink-0 place-items-center rounded-full sm:size-10 border border-white/[0.1] bg-[#180C10] text-sm font-semibold">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <motion.section {...enter(0.02)} className="grid gap-5 py-7 sm:gap-6 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#A81736]">Your study desk</p>
            <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-[2.25rem] font-semibold tracking-[-.055em] sm:text-5xl lg:text-[58px]">
              {greeting()}, {firstName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#B8AAAE]">
              {state.testAttempts.length === 0
                ? "No scores to judge yet. Build your first study record and EduFlow will become more useful with every session."
                : snapshot.averageScore !== null
                  ? `Your current test average is ${snapshot.averageScore.toFixed(1)}/10 across ${snapshot.totalTests} ${snapshot.totalTests === 1 ? "test" : "tests"}.`
                  : "Your dashboard is ready for today."}
            </p>
          </div>
          <div className="border-l border-white/[0.08] pl-4 text-left lg:min-w-44">
            <p className="text-[10px] uppercase tracking-[.18em] text-[#807478]">Syllabus progress</p>
            <p className="mt-2 text-xl font-semibold">{snapshot.completedTopics} / {snapshot.totalTopics}</p>
            <p className="mt-1 text-xs text-[#807478]">topics completed</p>
          </div>
        </motion.section>

        <motion.section {...enter(0.06)} className="grid overflow-hidden border border-white/[0.08] bg-white/[0.07] lg:grid-cols-[1.35fr_.65fr]">
          <div className="bg-[#0d090a] p-6 sm:p-8 lg:p-9">
            <div className="flex items-center justify-between gap-5">
              <p className="text-[10px] uppercase tracking-[.21em] text-[#807478]">Today&apos;s progress</p>
              <span className="text-xs text-[#807478]">{completedToday ? `${completedToday} logged actions` : "Nothing logged yet"}</span>
            </div>
            <div className="mt-8 flex items-end gap-4">
              <span className="font-[family-name:var(--font-display)] text-6xl font-semibold tracking-[-.07em] sm:text-7xl">{snapshot.todayProgress}%</span>
              <div className="pb-2 text-xs leading-5 text-[#807478]">
                <p>{snapshot.today.topicCompletions} topics</p>
                <p>{snapshot.today.testsCompleted} tests</p>
              </div>
            </div>
            <div className="mt-7 h-1 overflow-hidden bg-white/[0.06]">
              <motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${snapshot.todayProgress}%` }} transition={{ duration: 0.65 }} className="h-full bg-[#A81736]" />
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#807478]">
              {snapshot.todayProgress === 0
                ? "Complete a topic, finish a test, or complete a focus session to start today’s activity record."
                : `You’ve focused for ${formatStudyTime(snapshot.today.focusSeconds)} today. Keep going at a pace you can repeat tomorrow.`}
            </p>
          </div>

          <ActiveFocusSummary session={state.activeFocus} subjects={state.subjects} />
        </motion.section>

        <motion.section {...enter(0.1)} className="grid grid-cols-2 border-x border-b border-white/[0.08] md:grid-cols-4">
          {[
            [Clock3, "Study time", formatStudyTime(snapshot.totalStudySeconds)],
            [TestTube2, "Tests taken", String(snapshot.totalTests)],
            [Target, "Average score", snapshot.averageScore === null ? "—" : `${snapshot.averageScore.toFixed(1)}/10`],
            [Flame, "Current streak", `${snapshot.currentStreak} ${snapshot.currentStreak === 1 ? "day" : "days"}`],
          ].map(([Icon, label, value], index) => {
            const ItemIcon = Icon as typeof Clock3;
            return (
              <div key={String(label)} className={`min-h-32 p-5 sm:p-6 ${index < 3 ? "border-r border-white/[0.07]" : ""} ${index < 2 ? "border-b border-white/[0.07] md:border-b-0" : ""}`}>
                <ItemIcon className="size-4 text-[#78152A]" aria-hidden="true" />
                <p className="mt-5 text-xl font-semibold tracking-[-.025em]">{String(value)}</p>
                <p className="mt-1.5 text-[10px] uppercase tracking-[.16em] text-[#807478]">{String(label)}</p>
              </div>
            );
          })}
        </motion.section>

        <div className="grid gap-10 py-10 xl:grid-cols-[1.15fr_.85fr]">
          <motion.section {...enter(0.14)}>
            <div className="flex items-end justify-between border-b border-white/[0.08] pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Today&apos;s plan</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-.025em]">Prioritized for today</h2>
              </div>
              <Link href="/planner" className="focus-ring hidden min-h-10 items-center border border-white/[0.08] px-3 text-xs text-[#9f9195] transition hover:text-white sm:inline-flex">Open planner</Link>
            </div>
            {snapshot.plan.length ? (
              <div>
                {snapshot.plan.map((task, index) => (
                  <div key={task.topicId} className="grid gap-3 border-b border-white/[0.06] py-5 sm:grid-cols-[42px_1fr_auto] sm:items-center">
                    <span className="text-xs text-[#5f5558]">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-sm font-medium text-[#EEE7E9]">{task.topicName}</p>
                      <p className="mt-1 text-xs text-[#807478]">{task.subjectName} · {task.reason}</p>
                    </div>
                    <span className="w-fit border border-white/[0.08] px-2.5 py-1.5 text-[10px] uppercase tracking-[.14em] text-[#9f9195]">{task.minutes} min</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8">
                <CheckCircle2 className="size-5 text-[#78152A]" />
                <p className="mt-4 text-sm font-medium">Nothing incomplete right now.</p>
                <p className="mt-2 max-w-lg text-xs leading-5 text-[#807478]">When new topics are added or test evidence changes, EduFlow will reprioritize the planner automatically.</p>
              </div>
            )}
          </motion.section>

          <motion.aside {...enter(0.17)} className="border-l border-white/[0.08] pl-0 xl:pl-8">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Smart recommendation</p>
              <Sparkles className="size-4 text-[#A81736]" aria-hidden="true" />
            </div>
            <p className="mt-7 text-[10px] font-semibold uppercase tracking-[.16em] text-[#A81736]">{snapshot.recommendation.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em]">{snapshot.recommendation.title}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#9f9195]">{snapshot.recommendation.detail}</p>
          </motion.aside>
        </div>

        <div className="grid gap-px border border-white/[0.08] bg-white/[0.07] xl:grid-cols-[1.1fr_.9fr]">
          <motion.section {...enter(0.2)} className="bg-[#0d090a] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Subject health</p>
                <h2 className="mt-2 text-xl font-semibold">What the evidence says</h2>
              </div>
              <GraduationCap className="size-5 text-[#78152A]" aria-hidden="true" />
            </div>
            <div className="mt-6">
              {state.subjects.map((subject) => {
                const health = subjectHealth(subject, state.testAttempts);
                const completed = subject.topics.filter((topic) => topic.completed).length;
                const progress = subject.topics.length ? Math.round((completed / subject.topics.length) * 100) : 0;
                return (
                  <div key={subject.id} className="grid gap-3 border-t border-white/[0.06] py-4 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{subject.name}</p>
                        <span className="border border-white/[0.08] px-2 py-0.5 text-[9px] uppercase tracking-[.13em] text-[#807478]">{health.label}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/[0.07]"><div className="h-px bg-[#78152A]" style={{ width: `${progress}%` }} /></div>
                        <span className="text-[10px] text-[#807478]">{completed}/{subject.topics.length}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#807478]">{health.average === null ? "No test data" : `${health.average.toFixed(1)}/10 avg`}</p>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section {...enter(0.23)} className="bg-[#11090B] p-6 sm:p-8">
            <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Goals</p>
            <h2 className="mt-2 text-xl font-semibold">Measured automatically</h2>
            <div className="mt-6 space-y-6">
              {state.goals.length ? state.goals.slice(0, 4).map((goal) => {
                const progress = goalProgress(goal, state);
                return (
                  <div key={goal.id}>
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex items-center gap-2"><GoalIcon className="size-3.5 text-[#78152A]" /><p className="text-xs text-[#B8AAAE]">{goalLabel(goal)}</p></div>
                      <p className="text-xs font-medium">{goalValue(goal, progress.current, progress.target)}</p>
                    </div>
                    <div className="mt-3 h-1 bg-white/[0.06]"><motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${progress.percentage}%` }} className="h-full bg-[#78152A]" /></div>
                  </div>
                );
              }) : <p className="text-sm leading-6 text-[#807478]">No goals have been created yet.</p>}
            </div>
          </motion.section>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-3">
          <motion.section {...enter(0.26)} className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div><p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Performance trend</p><h2 className="mt-2 text-xl font-semibold">Scores over time</h2></div>
              <ArrowUpRight className="size-4 text-[#5f5558]" aria-hidden="true" />
            </div>
            {state.testAttempts.length ? (
              <div className="mt-6 flex h-40 items-end gap-2 border-b border-white/[0.07] px-1 pb-1">
                {state.testAttempts.slice(-12).map((attempt) => (
                  <div key={attempt.id} className="group flex h-full min-w-3 flex-1 items-end" title={`${attempt.topicName}: ${attempt.score}/${attempt.totalMarks}`}>
                    <motion.div initial={reduceMotion ? false : { height: 0 }} animate={{ height: `${Math.max(4, attempt.percentage)}%` }} className="w-full bg-[#78152A]/70 transition group-hover:bg-[#A81736]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10">
                <TestTube2 className="size-5 text-[#78152A]" />
                <p className="mt-4 text-sm font-medium">Your score trend will appear after your first test.</p>
                <p className="mt-2 max-w-lg text-xs leading-5 text-[#807478]">Nothing is plotted until there is a real result to show.</p>
              </div>
            )}
          </motion.section>

          <motion.section {...enter(0.29)}>
            <div className="border-b border-white/[0.08] pb-4">
              <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Upcoming exam</p>
              <h2 className="mt-2 text-xl font-semibold">Next deadline</h2>
            </div>
            {snapshot.upcomingExam ? (
              <div className="pt-6">
                <CalendarDays className="size-5 text-[#A81736]" />
                <p className="mt-4 text-lg font-semibold">{snapshot.upcomingExam.exam.name}</p>
                <p className="mt-1 text-sm text-[#B8AAAE]">{snapshot.upcomingExam.daysLeft} {snapshot.upcomingExam.daysLeft === 1 ? "day" : "days"} left</p>
              </div>
            ) : (
              <div className="pt-6">
                <CalendarDays className="size-5 text-[#78152A]" />
                <p className="mt-4 text-sm font-medium">No exam added yet.</p>
                <p className="mt-2 text-xs leading-5 text-[#807478]">Once you add an exam date, its countdown will appear here and can influence study priorities.</p>
              </div>
            )}
          </motion.section>
        </div>

        <motion.section {...enter(0.32)} className="border-t border-white/[0.08] py-8">
          <div className="grid gap-7 lg:grid-cols-[.35fr_.65fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-[#807478]">Recent activity</p>
              <h2 className="mt-2 text-xl font-semibold">Your actual record</h2>
              <p className="mt-3 text-xs leading-5 text-[#807478]">Best streak: {snapshot.bestStreak} {snapshot.bestStreak === 1 ? "day" : "days"}</p>
            </div>
            {recentActivity.length ? (
              <div>
                {recentActivity.map((item) => {
                  const copy = activityCopy(item.date, item.focusSeconds, item.topicCompletions, item.testsCompleted);
                  return <div key={item.date} className="grid gap-2 border-b border-white/[0.06] py-4 first:pt-0 sm:grid-cols-[110px_1fr]"><p className="text-xs text-[#807478]">{copy.date}</p><p className="text-sm text-[#B8AAAE]">{copy.text}</p></div>;
                })}
              </div>
            ) : (
              <div className="border-l border-white/[0.08] pl-5">
                <BookOpen className="size-5 text-[#78152A]" />
                <p className="mt-4 text-sm font-medium">No study activity yet.</p>
                <p className="mt-2 max-w-lg text-xs leading-5 text-[#807478]">Opening EduFlow does not count toward your streak. Meaningful study actions will appear here.</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
