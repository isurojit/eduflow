"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubjectsView } from "@/components/subjects/subjects-view";
import { useEduFlowStore } from "@/store/use-eduflow-store";
import type { EduFlowState } from "@/types/domain";

export default function SubjectsPage() {
  const router = useRouter();
  const store = useEduFlowStore();
  useEffect(() => { if (store.hydrated && !store.profile) router.replace("/"); }, [store.hydrated, store.profile, router]);
  if (!store.hydrated || !store.profile) return <div className="min-h-screen bg-[#090708]" />;
  const state: EduFlowState = {
    version: store.version, profile: store.profile, subjects: store.subjects, goals: store.goals,
    dailyActivity: store.dailyActivity, testAttempts: store.testAttempts, studySessions: store.studySessions,
    exams: store.exams,
    planner: store.planner, activeFocus: store.activeFocus,
    flashcardProgress: store.flashcardProgress,
    achievements: store.achievements, notes: store.notes, notifications: store.notifications, notificationPreferences: store.notificationPreferences, createdAt: store.createdAt, updatedAt: store.updatedAt,
  };
  return <SubjectsView state={state} />;
}
