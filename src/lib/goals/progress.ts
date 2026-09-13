import type { EduFlowState, Goal } from "@/types/domain";
import { localDateKey } from "@/lib/date/local-date";

function weekKeys(now = new Date()) {
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return localDateKey(date);
  });
}

export function goalProgress(goal: Goal, state: EduFlowState, now = new Date()) {
  const keys = goal.period === "daily" ? [localDateKey(now)] : weekKeys(now);
  const activities = keys.map((key) => state.dailyActivity[key]).filter(Boolean);

  let current = 0;
  if (goal.type === "study_minutes") current = activities.reduce((sum, item) => sum + item.focusSeconds / 60, 0);
  if (goal.type === "topics") current = activities.reduce((sum, item) => sum + item.topicCompletions, 0);
  if (goal.type === "tests") current = activities.reduce((sum, item) => sum + item.testsCompleted, 0);
  if (goal.type === "score") {
    const keySet = new Set(keys);
    current = state.testAttempts
      .filter((attempt) => keySet.has(localDateKey(attempt.date)))
      .reduce((best, attempt) => Math.max(best, attempt.score), 0);
  }
  return { current, target: goal.target, percentage: Math.min(100, (current / goal.target) * 100) };
}
