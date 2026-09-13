import type { AchievementId, AchievementUnlock, DailyActivity, EduFlowState } from "@/types/domain";
import { isMeaningfulActivity } from "@/lib/analytics/dashboard";

const DAY_MS = 86_400_000;

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  requirement: string;
}

export const achievementDefinitions: AchievementDefinition[] = [
  { id: "first-test", title: "First Test", description: "You turned study into evidence.", requirement: "Complete your first topic test." },
  { id: "seven-day-streak", title: "7-Day Streak", description: "A full week of meaningful study activity.", requirement: "Reach a 7-day study streak." },
  { id: "ten-topics", title: "10 Topics Completed", description: "Ten syllabus milestones are now behind you.", requirement: "Complete 10 topics." },
  { id: "ninety-percent", title: "90% Score", description: "A strong test result with very little left on the table.", requirement: "Score 9/10 or higher on a test." },
  { id: "perfect-ten", title: "Perfect 10", description: "Every question correct in one topic test.", requirement: "Score 10/10 on a test." },
  { id: "thirty-day-streak", title: "30-Day Streak", description: "A month of consistent meaningful study.", requirement: "Reach a 30-day study streak." },
];

function activityStreakUnlockDate(activity: Record<string, DailyActivity>, target: number) {
  const dates = Object.values(activity).filter(isMeaningfulActivity).map((entry) => entry.date).sort();
  if (!dates.length) return null;
  let streak = 1;
  if (target === 1) return dates[0];
  for (let index = 1; index < dates.length; index += 1) {
    const previous = new Date(`${dates[index - 1]}T00:00:00`);
    const current = new Date(`${dates[index]}T00:00:00`);
    const diff = Math.round((current.getTime() - previous.getTime()) / DAY_MS);
    streak = diff === 1 ? streak + 1 : 1;
    if (streak >= target) return dates[index];
  }
  return null;
}

function endOfLocalDay(dateKey: string) {
  return new Date(`${dateKey}T23:59:59`).toISOString();
}

export function achievementCandidates(state: EduFlowState): Partial<Record<AchievementId, string>> {
  const candidates: Partial<Record<AchievementId, string>> = {};
  const attempts = [...state.testAttempts].sort((a, b) => a.date.localeCompare(b.date));
  if (attempts[0]) candidates["first-test"] = attempts[0].date;
  const ninety = attempts.find((attempt) => attempt.score >= 9);
  if (ninety) candidates["ninety-percent"] = ninety.date;
  const perfect = attempts.find((attempt) => attempt.score === 10);
  if (perfect) candidates["perfect-ten"] = perfect.date;

  const completed = state.subjects.flatMap((subject) => subject.topics)
    .filter((topic) => topic.completed && topic.completedAt)
    .sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""));
  if (completed.length >= 10 && completed[9].completedAt) candidates["ten-topics"] = completed[9].completedAt;

  const seven = activityStreakUnlockDate(state.dailyActivity, 7);
  if (seven) candidates["seven-day-streak"] = endOfLocalDay(seven);
  const thirty = activityStreakUnlockDate(state.dailyActivity, 30);
  if (thirty) candidates["thirty-day-streak"] = endOfLocalDay(thirty);
  return candidates;
}

export function reconcileAchievements(state: EduFlowState) {
  const candidates = achievementCandidates(state);
  let changed = false;
  const achievements = { ...state.achievements };
  for (const definition of achievementDefinitions) {
    if (achievements[definition.id] || !candidates[definition.id]) continue;
    const unlock: AchievementUnlock = { id: definition.id, unlockedAt: candidates[definition.id]! };
    achievements[definition.id] = unlock;
    changed = true;
  }
  return changed ? { ...state, achievements } : state;
}
