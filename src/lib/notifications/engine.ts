import { createId } from "@/lib/utils/id";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { localDateKey } from "@/lib/date/local-date";
import { goalProgress } from "@/lib/analytics/dashboard";
import type { AppNotification, EduFlowState } from "@/types/domain";

function makeNotification(input: Omit<AppNotification, "id" | "createdAt">, now: Date): AppNotification {
  return { ...input, id: createId(), createdAt: now.toISOString() };
}

export function reconcileNotifications(state: EduFlowState, now = new Date()): EduFlowState {
  if (!state.profile || !state.notificationPreferences.inAppEnabled) return state;
  const today = localDateKey(now);
  const existingKeys = new Set(state.notifications.map((item) => item.sourceKey));
  const additions: AppNotification[] = [];
  const push = (item: Omit<AppNotification, "id" | "createdAt">) => {
    if (existingKeys.has(item.sourceKey)) return;
    existingKeys.add(item.sourceKey);
    additions.push(makeNotification(item, now));
  };

  for (const exam of state.exams) {
    const daysLeft = differenceInCalendarDays(parseISO(exam.date), now);
    if ([7, 3, 1, 0].includes(daysLeft)) {
      push({
        kind: "exam",
        title: daysLeft === 0 ? `${exam.name} is today` : `${exam.name} is ${daysLeft} ${daysLeft === 1 ? "day" : "days"} away`,
        message: daysLeft <= 2 ? "Keep today's plan focused on the subjects linked to this exam." : "Your planner can use this deadline to raise the priority of related topics.",
        href: "/planner",
        sourceKey: `exam:${exam.id}:${daysLeft}`,
      });
    }
  }

  for (const goal of state.goals.filter((item) => item.period === "daily")) {
    const progress = goalProgress(goal, state, now);
    if (progress.percentage >= 75 && progress.percentage < 100) {
      push({
        kind: "goal",
        title: "A daily goal is almost complete",
        message: `You're at ${Math.floor(progress.percentage)}%. A small final study block could finish it today.`,
        href: "/goals",
        sourceKey: `goal-near:${goal.id}:${today}`,
      });
    }
  }

  const todayActivity = state.dailyActivity[today];
  const meaningfulToday = Boolean(todayActivity && (todayActivity.focusSeconds > 0 || todayActivity.testsCompleted > 0 || todayActivity.topicCompletions > 0));
  if (!meaningfulToday && now.getHours() >= 18) {
    push({
      kind: "study_reminder",
      title: "No study activity logged today",
      message: "A short focus session is enough to make today count toward your study record.",
      href: "/planner",
      sourceKey: `evening-reminder:${today}`,
    });
  }

  if (!additions.length) return state;
  return { ...state, notifications: [...additions, ...state.notifications].slice(0, 100), updatedAt: now.toISOString() };
}
