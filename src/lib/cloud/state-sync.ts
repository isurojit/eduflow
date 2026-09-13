"use client";

import type { EduFlowState } from "@/types/domain";
import { cloudFetch } from "@/lib/cloud/api-client";
import { createEmptyState, storage } from "@/lib/storage/storage";
import { useEduFlowStore } from "@/store/use-eduflow-store";

const AUTH_CACHE_KEY = "eduflow:auth-uid";

export function snapshotEduFlowState(): EduFlowState {
  const store = useEduFlowStore.getState();
  return {
    version: store.version,
    profile: store.profile,
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
}

export async function initialCloudSync(uid: string) {
  const local = snapshotEduFlowState();
  const response = await cloudFetch("/api/cloud/state", { method: "GET" });
  if (response.status === 404) {
    const previousUid = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_CACHE_KEY) : null;
    if (previousUid && previousUid !== uid) {
      const empty = createEmptyState();
      storage.save(empty);
      useEduFlowStore.setState({ ...empty, hydrated: true });
      if (typeof window !== "undefined") window.localStorage.setItem(AUTH_CACHE_KEY, uid);
      await cloudFetch("/api/cloud/state", { method: "PUT", body: JSON.stringify({ state: empty }) });
      return "new-account" as const;
    }
    if (typeof window !== "undefined") window.localStorage.setItem(AUTH_CACHE_KEY, uid);
    await cloudFetch("/api/cloud/state", { method: "PUT", body: JSON.stringify({ state: local }) });
    return "uploaded" as const;
  }
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Cloud sync unavailable.");
  const payload = await response.json() as { state: EduFlowState };
  const remote = payload.state;
  if (remote?.updatedAt && new Date(remote.updatedAt).getTime() > new Date(local.updatedAt).getTime()) {
    storage.save(remote);
    if (typeof window !== "undefined") window.localStorage.setItem(AUTH_CACHE_KEY, uid);
    useEduFlowStore.setState({ ...remote, hydrated: true });
    return "downloaded" as const;
  }
  if (typeof window !== "undefined") window.localStorage.setItem(AUTH_CACHE_KEY, uid);
  await cloudFetch("/api/cloud/state", { method: "PUT", body: JSON.stringify({ state: local }) });
  return "uploaded" as const;
}

export async function pushCloudState() {
  const state = snapshotEduFlowState();
  const response = await cloudFetch("/api/cloud/state", { method: "PUT", body: JSON.stringify({ state }) });
  if (!response.ok) throw new Error("Cloud state could not be saved.");
}
