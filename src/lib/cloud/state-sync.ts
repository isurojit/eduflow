"use client";

import type { EduFlowState } from "@/types/domain";
import { cloudFetch } from "@/lib/cloud/api-client";
import { storage } from "@/lib/storage/storage";
import { useEduFlowStore } from "@/store/use-eduflow-store";

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

function timestamp(value?: string) {
  if (!value) return 0;

  const parsed = new Date(value).getTime();

  return Number.isFinite(parsed) ? parsed : 0;
}

export async function initialCloudSync(uid: string) {
  if (!uid) {
    throw new Error("Cloud sync requires an authenticated user.");
  }

  const local = snapshotEduFlowState();

  const response = await cloudFetch("/api/cloud/state", {
    method: "GET",
    cache: "no-store",
  });

  if (response.status === 404) {
    const upload = await cloudFetch("/api/cloud/state", {
      method: "PUT",
      body: JSON.stringify({
        state: local,
      }),
    });

    if (!upload.ok) {
      const payload = await upload.json().catch(() => null);

      throw new Error(
        payload?.error || "Initial cloud state could not be saved.",
      );
    }

    return "uploaded" as const;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(payload?.error || "Cloud sync unavailable.");
  }

  const payload = (await response.json()) as {
    state?: EduFlowState;
  };

  const remote = payload.state;

  if (!remote) {
    throw new Error("Cloud state response did not contain state.");
  }

  const remoteUpdated = timestamp(remote.updatedAt);
  const localUpdated = timestamp(local.updatedAt);

  if (remoteUpdated > localUpdated) {
    storage.save(remote);

    useEduFlowStore.setState({
      ...remote,
      hydrated: true,
    });

    return "downloaded" as const;
  }

  if (localUpdated > remoteUpdated) {
    const upload = await cloudFetch("/api/cloud/state", {
      method: "PUT",
      body: JSON.stringify({
        state: local,
      }),
    });

    if (!upload.ok) {
      const uploadPayload = await upload.json().catch(() => null);

      throw new Error(
        uploadPayload?.error || "Cloud state could not be updated.",
      );
    }

    return "uploaded" as const;
  }

  return "unchanged" as const;
}

export async function pushCloudState() {
  const state = snapshotEduFlowState();

  const response = await cloudFetch("/api/cloud/state", {
    method: "PUT",
    body: JSON.stringify({
      state,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(payload?.error || "Cloud state could not be saved.");
  }

  return true;
}
