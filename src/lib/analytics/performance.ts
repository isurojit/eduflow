import type { EduFlowState, Subject, TestAttempt } from "@/types/domain";
import { localDateKey } from "@/lib/date/local-date";

export type HealthLabel = "Strong" | "Needs Practice" | "Weak" | "Not Enough Data";
export type TopicHealthLabel = HealthLabel | "Watch";

export interface PeriodAverage {
  label: string;
  start: string;
  end: string;
  average: number | null;
  attempts: number;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  average: number | null;
  attempts: number;
  recentScore: number | null;
  health: HealthLabel;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  average: number;
  recentScore: number;
  attempts: number;
  trend: number | null;
  health: TopicHealthLabel;
}

export interface ScoreTrendPoint {
  attemptId: string;
  date: string;
  score: number;
  percentage: number;
  subjectName: string;
  topicName: string;
}

const DAY_MS = 86_400_000;

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mondayOf(date: Date) {
  const start = dayStart(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

function endOfWeek(start: Date) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

function inDateRange(iso: string, start: Date, end: Date) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return false;
  const value = dayStart(date).getTime();
  return value >= start.getTime() && value <= end.getTime();
}

export function calculateAverageScore(attempts: TestAttempt[]) {
  if (!attempts.length) return null;
  return attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length;
}

export function calculateHighestScore(attempts: TestAttempt[]) {
  if (!attempts.length) return null;
  return Math.max(...attempts.map((attempt) => attempt.score));
}

export function calculateLowestScore(attempts: TestAttempt[]) {
  if (!attempts.length) return null;
  return Math.min(...attempts.map((attempt) => attempt.score));
}

export function calculateSubjectHealth(average: number | null): HealthLabel {
  if (average === null) return "Not Enough Data";
  if (average >= 8) return "Strong";
  if (average >= 5) return "Needs Practice";
  return "Weak";
}

export function calculateSubjectPerformance(subjects: Subject[], attempts: TestAttempt[]): SubjectPerformance[] {
  return subjects.map((subject) => {
    const relevant = attempts
      .filter((attempt) => attempt.subjectId === subject.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const average = calculateAverageScore(relevant);
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      average,
      attempts: relevant.length,
      recentScore: relevant[0]?.score ?? null,
      health: calculateSubjectHealth(average),
    };
  });
}

function topicHealth(average: number, recentScore: number, attempts: number, trend: number | null): TopicHealthLabel {
  if (attempts === 1) {
    if (average >= 8) return "Strong";
    return "Watch";
  }
  if (average < 5 && recentScore < 5) return "Weak";
  if (average >= 8 && recentScore >= 8) return "Strong";
  if (average >= 5 && recentScore >= 5 && (trend === null || trend >= -1)) return "Needs Practice";
  if (average < 5 || recentScore < 5) return "Needs Practice";
  return "Needs Practice";
}

export function calculateTopicPerformance(attempts: TestAttempt[]): TopicPerformance[] {
  const groups = new Map<string, TestAttempt[]>();
  attempts.forEach((attempt) => {
    const list = groups.get(attempt.topicId) ?? [];
    list.push(attempt);
    groups.set(attempt.topicId, list);
  });

  return [...groups.values()].map((entries) => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const recent = sorted[sorted.length - 1];
    const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const average = calculateAverageScore(sorted) ?? 0;
    const trend = previous ? recent.score - previous.score : null;
    return {
      topicId: recent.topicId,
      topicName: recent.topicName,
      subjectId: recent.subjectId,
      subjectName: recent.subjectName,
      average,
      recentScore: recent.score,
      attempts: sorted.length,
      trend,
      health: topicHealth(average, recent.score, sorted.length, trend),
    };
  }).sort((a, b) => a.average - b.average || b.attempts - a.attempts);
}

export function calculateWeakTopics(attempts: TestAttempt[]) {
  return calculateTopicPerformance(attempts)
    .filter((topic) => topic.health === "Weak" || topic.health === "Needs Practice" || (topic.health === "Watch" && topic.average < 5))
    .sort((a, b) => {
      const repeatedLowA = a.health === "Weak" ? 2 : a.health === "Needs Practice" ? 1 : 0;
      const repeatedLowB = b.health === "Weak" ? 2 : b.health === "Needs Practice" ? 1 : 0;
      return repeatedLowB - repeatedLowA || a.average - b.average || b.attempts - a.attempts;
    });
}

export function calculateWeeklyPerformance(attempts: TestAttempt[], now = new Date()) {
  const currentStart = mondayOf(now);
  const currentEnd = endOfWeek(currentStart);
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - 7);
  const previousEnd = endOfWeek(previousStart);

  const currentAttempts = attempts.filter((attempt) => inDateRange(attempt.date, currentStart, currentEnd));
  const previousAttempts = attempts.filter((attempt) => inDateRange(attempt.date, previousStart, previousEnd));

  const current: PeriodAverage = {
    label: "Current week",
    start: localDateKey(currentStart),
    end: localDateKey(currentEnd),
    average: calculateAverageScore(currentAttempts),
    attempts: currentAttempts.length,
  };
  const previous: PeriodAverage = {
    label: "Previous week",
    start: localDateKey(previousStart),
    end: localDateKey(previousEnd),
    average: calculateAverageScore(previousAttempts),
    attempts: previousAttempts.length,
  };
  return { current, previous };
}

export function calculateImprovement(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function calculateScoreTrend(attempts: TestAttempt[], limit = 16): ScoreTrendPoint[] {
  return [...attempts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit)
    .map((attempt) => ({
      attemptId: attempt.id,
      date: attempt.date,
      score: attempt.score,
      percentage: attempt.percentage,
      subjectName: attempt.subjectName,
      topicName: attempt.topicName,
    }));
}

export function calculatePerformanceSnapshot(state: EduFlowState, now = new Date()) {
  const weekly = calculateWeeklyPerformance(state.testAttempts, now);
  const totalStudySeconds = state.studySessions
    .filter((session) => session.completed)
    .reduce((sum, session) => sum + session.durationSeconds, 0);
  return {
    totalTests: state.testAttempts.length,
    averageScore: calculateAverageScore(state.testAttempts),
    highestScore: calculateHighestScore(state.testAttempts),
    lowestScore: calculateLowestScore(state.testAttempts),
    totalStudySeconds,
    subjectPerformance: calculateSubjectPerformance(state.subjects, state.testAttempts),
    topicPerformance: calculateTopicPerformance(state.testAttempts),
    weakTopics: calculateWeakTopics(state.testAttempts),
    scoreTrend: calculateScoreTrend(state.testAttempts),
    weekly,
    improvement: calculateImprovement(weekly.current.average, weekly.previous.average),
  };
}

export function daysBetween(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}
