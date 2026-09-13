import type { EduFlowState, Goal, TestAttempt, Topic } from "@/types/domain";
import { localDateKey } from "@/lib/date/local-date";

export interface CalendarDaySnapshot {
  date: string;
  studied: boolean;
  focusSeconds: number;
  topicCompletions: Array<{ subjectId: string; subjectName: string; topicId: string; topicName: string }>;
  tests: TestAttempt[];
  goalAchieved: boolean;
  hasDailyGoals: boolean;
  missedStudyDay: boolean;
  streakDay: boolean;
}

function dailyGoalProgressForDate(goal: Goal, state: EduFlowState, date: string) {
  const activity = state.dailyActivity[date];
  if (goal.type === "study_minutes") return (activity?.focusSeconds ?? 0) / 60;
  if (goal.type === "topics") return activity?.topicCompletions ?? 0;
  if (goal.type === "tests") return activity?.testsCompleted ?? 0;
  if (goal.type === "score") {
    return state.testAttempts
      .filter((attempt) => localDateKey(attempt.date) === date)
      .reduce((best, attempt) => Math.max(best, attempt.score), 0);
  }
  return 0;
}

export function calendarDaySnapshot(state: EduFlowState, date: string, today = localDateKey()): CalendarDaySnapshot {
  const activity = state.dailyActivity[date];
  const topicCompletions: CalendarDaySnapshot["topicCompletions"] = [];
  for (const subject of state.subjects) {
    for (const topic of subject.topics) {
      if (topic.completedAt && localDateKey(topic.completedAt) === date) {
        topicCompletions.push({ subjectId: subject.id, subjectName: subject.name, topicId: topic.id, topicName: topic.name });
      }
    }
  }
  const tests = state.testAttempts.filter((attempt) => localDateKey(attempt.date) === date);
  const focusSeconds = activity?.focusSeconds ?? state.studySessions
    .filter((session) => localDateKey(session.endedAt) === date)
    .reduce((sum, session) => sum + session.durationSeconds, 0);
  const studied = focusSeconds > 0 || topicCompletions.length > 0 || tests.length > 0;
  const eligibleGoals = state.goals.filter((goal) => goal.period === "daily" && localDateKey(goal.createdAt) <= date);
  const goalAchieved = eligibleGoals.length > 0 && eligibleGoals.every((goal) => dailyGoalProgressForDate(goal, state, date) >= goal.target);
  const profileStart = state.profile ? localDateKey(state.profile.createdAt) : today;
  return {
    date,
    studied,
    focusSeconds,
    topicCompletions,
    tests,
    goalAchieved,
    hasDailyGoals: eligibleGoals.length > 0,
    missedStudyDay: date < today && date >= profileStart && !studied,
    streakDay: studied,
  };
}

export function monthCalendar(state: EduFlowState, year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const leading = first.getDay();
  const days: Array<{ inMonth: boolean; date: string; dayNumber: number; snapshot: CalendarDaySnapshot }> = [];
  for (let offset = -leading; offset < last.getDate(); offset += 1) {
    const date = new Date(year, monthIndex, offset + 1);
    const inMonth = date.getMonth() === monthIndex;
    const key = localDateKey(date);
    days.push({ inMonth, date: key, dayNumber: date.getDate(), snapshot: calendarDaySnapshot(state, key) });
  }
  while (days.length % 7 !== 0) {
    const previous = new Date(`${days[days.length - 1].date}T12:00:00`);
    previous.setDate(previous.getDate() + 1);
    const key = localDateKey(previous);
    days.push({ inMonth: false, date: key, dayNumber: previous.getDate(), snapshot: calendarDaySnapshot(state, key) });
  }
  return days;
}

export function completedTopicsByDate(state: EduFlowState, date: string): Topic[] {
  return state.subjects.flatMap((subject) => subject.topics).filter((topic) => topic.completedAt && localDateKey(topic.completedAt) === date);
}
