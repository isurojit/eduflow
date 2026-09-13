import type { EduFlowState, Exam, Subject, Topic } from "@/types/domain";
import { calculateSubjectPerformance, calculateTopicPerformance } from "@/lib/analytics/performance";
import { goalProgress } from "@/lib/goals/progress";
import { localDateKey } from "@/lib/date/local-date";

const DAY_MS = 86_400_000;

export interface PlannerTask {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  minutes: number;
  priority: number;
  reason: string;
  signals: string[];
  kind: "study" | "revision";
}

export interface PlannerSnapshot {
  availableMinutes: number;
  allocatedMinutes: number;
  remainingMinutes: number;
  tasks: PlannerTask[];
  explanation: string;
}

function parseDateOnly(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function daysUntilExam(exam: Exam, now: Date) {
  const date = parseDateOnly(exam.date);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((date.getTime() - today.getTime()) / DAY_MS);
}

function examSignal(subjectId: string, exams: Exam[], now: Date) {
  const upcoming = exams
    .filter((exam) => exam.subjectIds.includes(subjectId))
    .map((exam) => ({ exam, days: daysUntilExam(exam, now) }))
    .filter((entry): entry is { exam: Exam; days: number } => entry.days !== null && entry.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  if (!upcoming) return { score: 0, label: null as string | null };
  if (upcoming.days <= 7) return { score: 4, label: `Exam in ${upcoming.days} ${upcoming.days === 1 ? "day" : "days"}` };
  if (upcoming.days <= 14) return { score: 3, label: `Exam in ${upcoming.days} days` };
  if (upcoming.days <= 30) return { score: 2, label: `Exam in ${upcoming.days} days` };
  return { score: 1, label: `Exam in ${upcoming.days} days` };
}

function lastStudiedAt(subject: Subject, topic: Topic, state: EduFlowState) {
  const dates = [
    topic.completedAt,
    ...state.testAttempts.filter((attempt) => attempt.topicId === topic.id).map((attempt) => attempt.date),
    ...state.studySessions.filter((session) => session.topicId === topic.id).map((session) => session.endedAt),
  ].filter((value): value is string => Boolean(value));
  return dates.sort((a, b) => b.localeCompare(a))[0] ?? null;
}

function staleScore(subject: Subject, topic: Topic, state: EduFlowState, now: Date) {
  const last = lastStudiedAt(subject, topic, state);
  if (!last) return { score: 2, label: "Not studied yet" };
  const then = new Date(last);
  if (!Number.isFinite(then.getTime())) return { score: 1, label: "Study date unavailable" };
  const days = Math.floor((now.getTime() - then.getTime()) / DAY_MS);
  if (days >= 14) return { score: 2, label: `Not studied for ${days} days` };
  if (days >= 7) return { score: 1, label: `Not studied for ${days} days` };
  return { score: 0, label: null as string | null };
}

function dailyGoalRisk(state: EduFlowState, now: Date) {
  const goals = state.goals.filter((goal) => goal.period === "daily");
  if (!goals.length) return 0;
  const incomplete = goals.filter((goal) => goalProgress(goal, state, now).percentage < 100).length;
  return Math.min(2, incomplete);
}

function weaknessFor(topicId: string, subjectId: string, state: EduFlowState) {
  const topic = calculateTopicPerformance(state.testAttempts).find((entry) => entry.topicId === topicId);
  if (topic) {
    if (topic.health === "Weak") return { score: 4, label: `Weak · ${topic.average.toFixed(1)}/10 average` };
    if (topic.health === "Needs Practice") return { score: 2.5, label: `Needs practice · ${topic.average.toFixed(1)}/10 average` };
    if (topic.health === "Watch" && topic.average < 5) return { score: 2, label: `Low first score · ${topic.recentScore}/10` };
    if (topic.health === "Watch") return { score: 1, label: `Early signal · ${topic.recentScore}/10` };
  }

  const subject = calculateSubjectPerformance(state.subjects, state.testAttempts).find((entry) => entry.subjectId === subjectId);
  if (subject?.health === "Weak") return { score: 2, label: `Weak subject · ${subject.average?.toFixed(1)}/10 average` };
  if (subject?.health === "Needs Practice") return { score: 1, label: `Subject needs practice` };
  return { score: 0, label: null as string | null };
}

function taskMinutes(priority: number, availableMinutes: number) {
  const preferred = priority >= 26 ? 35 : priority >= 18 ? 30 : priority >= 10 ? 25 : 20;
  return Math.max(10, Math.min(preferred, availableMinutes));
}

export function buildSmartPlan(state: EduFlowState, availableMinutes: number, now = new Date()): PlannerSnapshot {
  const budget = Math.max(0, Math.min(720, Math.round(availableMinutes)));
  const goalRisk = dailyGoalRisk(state, now);

  const candidates = state.subjects.flatMap((subject) => subject.topics.flatMap((topic, orderIndex) => {
    const weakness = weaknessFor(topic.id, subject.id, state);
    const shouldInclude = !topic.completed || weakness.score >= 2;
    if (!shouldInclude) return [];

    const exam = examSignal(subject.id, state.exams, now);
    const stale = staleScore(subject, topic, state, now);
    const incompleteWeight = topic.completed ? 0 : 1;
    const bookmarkWeight = topic.bookmarked ? 1.5 : 0;
    const syllabusOrder = topic.completed ? 0 : Math.max(0, 1 - orderIndex * 0.04);

    // Explainable Phase 7 priority model:
    // weakness * 4 + exam urgency * 3 + incomplete * 2 + goal risk * 2 + stale + bookmark/order signals.
    const priority = weakness.score * 4 + exam.score * 3 + incompleteWeight * 2 + goalRisk * 2 + stale.score + bookmarkWeight + syllabusOrder;
    const signals = [weakness.label, exam.label, topic.completed ? "Revision" : "Incomplete topic", topic.bookmarked ? "Important" : null, stale.label]
      .filter((value): value is string => Boolean(value));

    return [{
      id: `${localDateKey(now)}:${subject.id}:${topic.id}`,
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: topic.id,
      topicName: topic.name,
      minutes: 0,
      priority,
      reason: signals.slice(0, 2).join(" • ") || "Incomplete topic",
      signals,
      kind: topic.completed ? "revision" as const : "study" as const,
    }];
  }));

  const completedToday = new Set(state.planner.date === localDateKey(now) ? state.planner.completedTaskIds : []);
  const sorted = candidates
    .filter((candidate) => !completedToday.has(candidate.id))
    .sort((a, b) => b.priority - a.priority || a.subjectName.localeCompare(b.subjectName));
  const tasks: PlannerTask[] = [];
  let remaining = budget;

  for (const candidate of sorted) {
    if (remaining < 10) break;
    const minutes = taskMinutes(candidate.priority, remaining);
    tasks.push({ ...candidate, minutes });
    remaining -= minutes;
    if (tasks.length >= 6) break;
  }

  const allocatedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  return {
    availableMinutes: budget,
    allocatedMinutes,
    remainingMinutes: Math.max(0, budget - allocatedMinutes),
    tasks,
    explanation: tasks.length
      ? "Priority combines weak-area evidence, exam urgency, incomplete work, goals at risk, bookmarks, and how recently a topic was studied."
      : budget === 0
        ? "Set how much time you have today and EduFlow will build a plan from your real study data."
        : "There are no incomplete or performance-risk topics to schedule right now.",
  };
}
