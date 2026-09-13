import type { DailyActivity } from "@/types/domain";
import { calculateBestStreak, calculateCurrentStreak, isMeaningfulActivity, localDateKey } from "@/lib/analytics/dashboard";

export function streakSnapshot(activity: Record<string, DailyActivity>, now = new Date()) {
  const meaningful = Object.values(activity).filter(isMeaningfulActivity).sort((a, b) => a.date.localeCompare(b.date));
  const current = calculateCurrentStreak(activity, now);
  const best = calculateBestStreak(activity);
  const lastActiveDate = meaningful.length ? meaningful[meaningful.length - 1].date : null;
  const last14 = Array.from({ length: 14 }, (_, offset) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - offset));
    const key = localDateKey(date);
    const entry = activity[key];
    return { date: key, active: isMeaningfulActivity(entry), focusSeconds: entry?.focusSeconds ?? 0, topics: entry?.topicCompletions ?? 0, tests: entry?.testsCompleted ?? 0 };
  });
  return { current, best, lastActiveDate, last14 };
}
