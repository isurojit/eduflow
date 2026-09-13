"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PerformanceView } from "@/components/performance/performance-view";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { EduFlowState } from "@/types/domain";

export default function PerformancePage() {
  const router = useRouter();
  const store = useEduFlowStore();
  const { hydrated, profile } = store;

  useEffect(() => {
    if (hydrated && !profile) router.replace("/");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) return <div className="min-h-screen bg-[#090708]" />;

  const state: EduFlowState = {
    version: store.version,
    profile,
    subjects: store.subjects,
    goals: store.goals,
    dailyActivity: store.dailyActivity,
    testAttempts: store.testAttempts,
    studySessions: store.studySessions,
    exams: store.exams,
    planner: store.planner,
    activeFocus: store.activeFocus,
    flashcardProgress: store.flashcardProgress,
    achievements: store.achievements,
    notes: store.notes,
    notifications: store.notifications,
    notificationPreferences: store.notificationPreferences,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };

  return <PerformanceView state={state} />;
}
