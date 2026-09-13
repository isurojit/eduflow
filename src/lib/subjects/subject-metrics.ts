import type { EduFlowState, Subject, TestAttempt } from "@/types/domain";

export function subjectProgress(subject: Subject) {
  const total = subject.topics.length;
  const completed = subject.topics.filter((topic) => topic.completed).length;
  return { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 };
}

export function subjectAverageScore(subjectId: string, attempts: TestAttempt[]) {
  const relevant = attempts.filter((attempt) => attempt.subjectId === subjectId);
  if (!relevant.length) return null;
  return relevant.reduce((sum, attempt) => sum + attempt.score, 0) / relevant.length;
}

export function subjectStatus(subjectId: string, attempts: TestAttempt[]) {
  const average = subjectAverageScore(subjectId, attempts);
  if (average === null) return { label: "Not Enough Data", average };
  if (average >= 8) return { label: "Strong", average };
  if (average >= 5) return { label: "Needs Practice", average };
  return { label: "Weak", average };
}

export function subjectStudySeconds(subjectId: string, state: EduFlowState) {
  return state.studySessions
    .filter((session) => session.subjectId === subjectId && session.completed)
    .reduce((sum, session) => sum + session.durationSeconds, 0);
}

export function subjectRecentScore(subjectId: string, attempts: TestAttempt[]) {
  const relevant = attempts
    .filter((attempt) => attempt.subjectId === subjectId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return relevant[0] ?? null;
}

export function subjectLastStudied(subject: Subject, state: EduFlowState) {
  const dates = [
    ...state.studySessions.filter((session) => session.subjectId === subject.id).map((session) => session.endedAt),
    ...state.testAttempts.filter((attempt) => attempt.subjectId === subject.id).map((attempt) => attempt.date),
    ...subject.topics.flatMap((topic) => topic.completedAt ? [topic.completedAt] : []),
  ];
  if (!dates.length) return null;
  return dates.sort((a, b) => b.localeCompare(a))[0];
}
