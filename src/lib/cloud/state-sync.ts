"use client";

import type { EduFlowState } from "@/types/domain";
import { cloudFetch } from "@/lib/cloud/api-client";
import { storage } from "@/lib/storage/storage";
import { useEduFlowStore } from "@/store/use-eduflow-store";

let lastServerUpdatedAt: string | null = null;

export function resetCloudRevision() {
  lastServerUpdatedAt = null;
}

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
        expectedUpdatedAt: null,
      }),
    });

    const uploadPayload = await upload.json().catch(() => null);

    if (!upload.ok) {
      throw new Error(
        uploadPayload?.error || "Initial cloud state could not be saved.",
      );
    }

    lastServerUpdatedAt = uploadPayload?.updatedAt ?? null;

    return "uploaded" as const;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    throw new Error(payload?.error || "Cloud sync unavailable.");
  }

  const payload = (await response.json()) as {
    state?: EduFlowState;
    updatedAt?: string;
  };

  const remote = payload.state;

  if (!remote) {
    throw new Error("Cloud state response did not contain state.");
  }

  lastServerUpdatedAt = payload.updatedAt ?? null;

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
        expectedUpdatedAt: lastServerUpdatedAt,
      }),
    });

    const uploadPayload = await upload.json().catch(() => null);

    if (upload.status === 409) {
      throw new Error(
        "Cloud conflict detected. Your local changes were not overwritten.",
      );
    }

    if (!upload.ok) {
      throw new Error(
        uploadPayload?.error || "Cloud state could not be updated.",
      );
    }

    lastServerUpdatedAt = uploadPayload?.updatedAt ?? null;

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
      expectedUpdatedAt: lastServerUpdatedAt,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 409) {
    throw new Error(
      "Cloud conflict detected. Your local changes were kept on this device.",
    );
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Cloud state could not be saved.");
  }

  lastServerUpdatedAt = payload?.updatedAt ?? null;

  return true;
}
