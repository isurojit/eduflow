"use client";

import { createId } from "@/lib/utils/id";
import { create } from "zustand";
import type { ActiveFocusSession, DailyActivity, EduFlowState, Exam, Goal, Note, StudySession, TestAttempt, Topic, TopicDifficulty } from "@/types/domain";
import type { OnboardingValues } from "@/features/onboarding/schema";
import { buildInitialState } from "@/lib/storage/profile.repository";
import { createEmptyState, storage } from "@/lib/storage/storage";
import { localDateKey } from "@/lib/date/local-date";
import { focusElapsedSeconds } from "@/lib/focus/timer";
import { reconcileAchievements } from "@/lib/achievements/engine";
import { reconcileNotifications } from "@/lib/notifications/engine";

interface MutationResult {
  ok: boolean;
  message?: string;
}

interface EduFlowStore extends EduFlowState {
  hydrated: boolean;
  hydrate: () => void;
  refreshNotifications: () => void;
  completeOnboarding: (values: OnboardingValues) => void;
  toggleTopicCompletion: (subjectId: string, topicId: string) => MutationResult;
  toggleTopicBookmark: (subjectId: string, topicId: string) => MutationResult;
  addTopic: (subjectId: string, input: { name: string; description?: string; difficulty?: TopicDifficulty }) => MutationResult;
  importSubjectTopics: (subjectName: string, topicNames: string[]) => MutationResult;
  saveTestAttempt: (attempt: TestAttempt) => MutationResult;
  setAvailableStudyMinutes: (minutes: number) => MutationResult;
  activatePlannerTask: (task: { id: string; subjectId: string; topicId: string; minutes: number }) => MutationResult;
  addGoal: (input: { type: Goal["type"]; period: Goal["period"]; target: number }) => MutationResult;
  removeGoal: (goalId: string) => MutationResult;
  addExam: (input: { name: string; date: string; subjectIds: string[] }) => MutationResult;
  removeExam: (examId: string) => MutationResult;
  prepareFocusSession: (input: { subjectId: string; topicId: string; minutes?: number; plannerTaskId?: string }) => MutationResult;
  startActiveFocus: () => MutationResult;
  pauseActiveFocus: () => MutationResult;
  resetActiveFocus: () => MutationResult;
  completeActiveFocus: () => MutationResult;
  prepareBreak: () => MutationResult;
  prepareNextFocus: () => MutationResult;
  clearActiveFocus: () => MutationResult;
  setFlashcardRating: (topicId: string, cardId: string, rating: "known" | "review") => MutationResult;
  setFlashcardLastSeen: (topicId: string, cardId: string) => MutationResult;
  resetFlashcardProgress: (topicId: string) => MutationResult;
  createNote: (input: { title: string; body: string; subjectId?: string; topicId?: string }) => MutationResult;
  updateNote: (noteId: string, input: { title: string; body: string; subjectId?: string; topicId?: string }) => MutationResult;
  deleteNote: (noteId: string) => MutationResult;
  markNotificationRead: (notificationId: string) => MutationResult;
  markAllNotificationsRead: () => MutationResult;
  markNotificationBrowserDelivered: (notificationId: string) => MutationResult;
  setBrowserNotificationsEnabled: (enabled: boolean) => MutationResult;
  setInAppNotificationsEnabled: (enabled: boolean) => MutationResult;
  resetPrototype: () => void;
}

function stateFromStore(store: EduFlowStore): EduFlowState {
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

function withActivityDelta(
  activity: Record<string, DailyActivity>,
  date: string,
  field: "topicCompletions" | "testsCompleted" | "focusSeconds",
  delta: number,
) {
  const existing = activity[date] ?? { date, topicCompletions: 0, testsCompleted: 0, focusSeconds: 0 };
  return {
    ...activity,
    [date]: {
      ...existing,
      [field]: Math.max(0, existing[field] + delta),
    },
  };
}

function reconcileState(next: EduFlowState) {
  return reconcileNotifications(reconcileAchievements(next));
}

function persist(set: (partial: Partial<EduFlowStore>) => void, next: EduFlowState) {
  const reconciled = reconcileState(next);
  storage.save(reconciled);
  set(reconciled);
}

export const useEduFlowStore = create<EduFlowStore>((set, get) => ({
  ...createEmptyState(),
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const loaded = storage.load();
    const reconciled = reconcileState(loaded);
    if (reconciled !== loaded) storage.save(reconciled);
    set({ ...reconciled, hydrated: true });
  },
  refreshNotifications: () => {
    if (!get().hydrated) return;
    const current = stateFromStore(get());
    const next = reconcileNotifications(current);
    if (next !== current) { storage.save(next); set(next); }
  },
  completeOnboarding: (values) => {
    const next = buildInitialState(stateFromStore(get()), values);
    persist(set, next);
  },
  toggleTopicCompletion: (subjectId, topicId) => {
    const current = stateFromStore(get());
    const subject = current.subjects.find((item) => item.id === subjectId);
    const topic = subject?.topics.find((item) => item.id === topicId);
    if (!subject || !topic) return { ok: false, message: "Topic could not be found." };

    const now = new Date().toISOString();
    const completing = !topic.completed;
    const activityDate = completing ? localDateKey() : localDateKey(topic.completedAt ?? now);
    const subjects = current.subjects.map((item) => item.id !== subjectId ? item : {
      ...item,
      topics: item.topics.map((candidate) => candidate.id !== topicId ? candidate : {
        ...candidate,
        completed: completing,
        completedAt: completing ? now : undefined,
      }),
    });
    const activePlannerCompletion = completing && current.planner.activeSubjectId === subjectId && current.planner.activeTopicId === topicId && current.planner.activeTaskId;
    const next: EduFlowState = {
      ...current,
      subjects,
      dailyActivity: withActivityDelta(current.dailyActivity, activityDate, "topicCompletions", completing ? 1 : -1),
      planner: activePlannerCompletion ? {
        ...current.planner,
        completedTaskIds: [...new Set([...current.planner.completedTaskIds, current.planner.activeTaskId!])],
        activeTaskId: undefined,
        activeSubjectId: undefined,
        activeTopicId: undefined,
        preparedFocusMinutes: undefined,
        updatedAt: now,
      } : current.planner,
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  toggleTopicBookmark: (subjectId, topicId) => {
    const current = stateFromStore(get());
    const exists = current.subjects.some((subject) => subject.id === subjectId && subject.topics.some((topic) => topic.id === topicId));
    if (!exists) return { ok: false, message: "Topic could not be found." };
    const now = new Date().toISOString();
    const next: EduFlowState = {
      ...current,
      subjects: current.subjects.map((subject) => subject.id !== subjectId ? subject : {
        ...subject,
        topics: subject.topics.map((topic) => topic.id !== topicId ? topic : { ...topic, bookmarked: !topic.bookmarked }),
      }),
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  addTopic: (subjectId, input) => {
    const current = stateFromStore(get());
    const subject = current.subjects.find((item) => item.id === subjectId);
    if (!subject) return { ok: false, message: "Subject could not be found." };
    const name = input.name.trim();
    if (name.length < 2) return { ok: false, message: "Enter a topic name with at least 2 characters." };
    if (subject.topics.some((topic) => topic.name.trim().toLowerCase() === name.toLowerCase())) {
      return { ok: false, message: "That topic already exists in this subject." };
    }
    const topic: Topic = {
      id: createId(),
      subjectId,
      name,
      description: input.description?.trim() || undefined,
      difficulty: input.difficulty ?? "medium",
      completed: false,
      bookmarked: false,
      isStarterContent: false,
    };
    const now = new Date().toISOString();
    const next: EduFlowState = {
      ...current,
      subjects: current.subjects.map((item) => item.id !== subjectId ? item : { ...item, topics: [...item.topics, topic] }),
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  importSubjectTopics: (subjectName: string, topicNames: string[]) => {
    const current = stateFromStore(get());
    if (!current.profile) return { ok: false, message: "Complete onboarding before importing a syllabus." };
    const name = subjectName.trim();
    const cleanTopics: string[] = [...new Set(topicNames.map((item: string) => item.trim()).filter((item: string) => item.length >= 2))];
    if (!name || !cleanTopics.length) return { ok: false, message: "No usable subject/topics were found." };
    const now = new Date().toISOString();
    const existing = current.subjects.find((item) => item.name.trim().toLowerCase() === name.toLowerCase());
    let subjects = current.subjects;
    let subjectIds = current.profile.subjectIds;
    if (existing) {
      const known = new Set(existing.topics.map((topic) => topic.name.trim().toLowerCase()));
      const additions: Topic[] = cleanTopics.filter((topic: string) => !known.has(topic.toLowerCase())).map((topic: string) => ({ id: createId(), subjectId: existing.id, name: topic, difficulty: "medium", completed: false, bookmarked: false, isStarterContent: false }));
      subjects = current.subjects.map((item) => item.id === existing.id ? { ...item, topics: [...item.topics, ...additions] } : item);
    } else {
      const subjectId = createId();
      subjects = [...current.subjects, { id: subjectId, name, type: current.profile.educationLevel, isCustom: true, createdAt: now, topics: cleanTopics.map((topic: string): Topic => ({ id: createId(), subjectId, name: topic, difficulty: "medium", completed: false, bookmarked: false, isStarterContent: false })) }];
      subjectIds = [...current.profile.subjectIds, subjectId];
    }
    const next: EduFlowState = { ...current, subjects, profile: { ...current.profile, subjectIds, updatedAt: now }, updatedAt: now };
    persist(set, next);
    return { ok: true };
  },
  saveTestAttempt: (attempt) => {
    const current = stateFromStore(get());
    if (!current.profile) return { ok: false, message: "Complete onboarding before taking a test." };
    if (attempt.totalMarks !== 10 || attempt.answers.length !== 10) return { ok: false, message: "A normal topic test must contain exactly 10 questions." };
    if (current.testAttempts.some((item) => item.id === attempt.id)) return { ok: false, message: "This test attempt has already been saved." };
    const now = new Date().toISOString();
    const activityDate = localDateKey(attempt.date);
    const next: EduFlowState = {
      ...current,
      testAttempts: [...current.testAttempts, attempt],
      dailyActivity: withActivityDelta(current.dailyActivity, activityDate, "testsCompleted", 1),
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  setAvailableStudyMinutes: (minutes) => {
    const normalized = Math.round(minutes);
    if (!Number.isFinite(normalized) || normalized < 10 || normalized > 720) {
      return { ok: false, message: "Enter between 10 and 720 minutes." };
    }
    const current = stateFromStore(get());
    const now = new Date().toISOString();
    const today = localDateKey();
    const next: EduFlowState = {
      ...current,
      planner: {
        ...current.planner,
        date: today,
        availableMinutes: normalized,
        completedTaskIds: current.planner.date === today ? current.planner.completedTaskIds : [],
        updatedAt: now,
      },
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  activatePlannerTask: (task) => {
    const current = stateFromStore(get());
    const subject = current.subjects.find((item) => item.id === task.subjectId);
    const topic = subject?.topics.find((item) => item.id === task.topicId);
    if (!subject || !topic) return { ok: false, message: "Planner topic could not be found." };
    const now = new Date().toISOString();
    const next: EduFlowState = {
      ...current,
      planner: {
        ...current.planner,
        date: localDateKey(),
        activeTaskId: task.id,
        activeSubjectId: task.subjectId,
        activeTopicId: task.topicId,
        preparedFocusMinutes: 25,
        updatedAt: now,
      },
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  addGoal: (input) => {
    const current = stateFromStore(get());
    const target = Number(input.target);
    if (!Number.isFinite(target) || target <= 0) return { ok: false, message: "Enter a valid goal target." };
    if (input.type === "score" && (target < 1 || target > 10)) return { ok: false, message: "Score goals must be between 1 and 10." };
    if (input.type === "study_minutes" && target > 10_080) return { ok: false, message: "Study-time target is too high." };
    if ((input.type === "topics" || input.type === "tests") && (!Number.isInteger(target) || target > 1000)) return { ok: false, message: "Use a whole-number target." };
    const duplicate = current.goals.some((goal) => goal.type === input.type && goal.period === input.period && goal.target === target);
    if (duplicate) return { ok: false, message: "That goal already exists." };
    const now = new Date().toISOString();
    const goal: Goal = { id: createId(), type: input.type, period: input.period, target, createdAt: now };
    persist(set, { ...current, goals: [...current.goals, goal], updatedAt: now });
    return { ok: true };
  },
  removeGoal: (goalId) => {
    const current = stateFromStore(get());
    if (!current.goals.some((goal) => goal.id === goalId)) return { ok: false, message: "Goal could not be found." };
    const now = new Date().toISOString();
    persist(set, { ...current, goals: current.goals.filter((goal) => goal.id !== goalId), updatedAt: now });
    return { ok: true };
  },
  addExam: (input) => {
    const current = stateFromStore(get());
    const name = input.name.trim();
    if (name.length < 2) return { ok: false, message: "Enter an exam name." };
    const parsed = new Date(`${input.date}T00:00:00`);
    if (!input.date || !Number.isFinite(parsed.getTime()) || input.date < localDateKey()) return { ok: false, message: "Choose today or a future exam date." };
    const validSubjectIds: string[] = input.subjectIds.filter((id: string) => current.subjects.some((subject) => subject.id === id));
    if (!validSubjectIds.length) return { ok: false, message: "Select at least one related subject." };
    const now = new Date().toISOString();
    const exam: Exam = { id: createId(), name, date: input.date, subjectIds: [...new Set(validSubjectIds)], createdAt: now };
    const next: EduFlowState = { ...current, exams: [...current.exams, exam], updatedAt: now };
    persist(set, next);
    return { ok: true };
  },
  removeExam: (examId) => {
    const current = stateFromStore(get());
    if (!current.exams.some((exam) => exam.id === examId)) return { ok: false, message: "Exam could not be found." };
    const now = new Date().toISOString();
    const next: EduFlowState = { ...current, exams: current.exams.filter((exam) => exam.id !== examId), updatedAt: now };
    persist(set, next);
    return { ok: true };
  },

  prepareFocusSession: (input) => {
    const current = stateFromStore(get());
    if (current.activeFocus && (current.activeFocus.status === "running" || current.activeFocus.status === "paused")) {
      return { ok: false, message: "Finish the current focus session before preparing another one." };
    }
    const subject = current.subjects.find((item) => item.id === input.subjectId);
    const topic = subject?.topics.find((item) => item.id === input.topicId);
    if (!subject || !topic) return { ok: false, message: "Focus topic could not be found." };
    const minutes = Math.max(1, Math.min(720, Math.round(input.minutes ?? 25)));
    const now = new Date().toISOString();
    const activeFocus: ActiveFocusSession = {
      id: createId(), mode: "focus", status: "ready", subjectId: subject.id, topicId: topic.id,
      plannerTaskId: input.plannerTaskId, plannedSeconds: minutes * 60, elapsedSeconds: 0, createdAt: now, updatedAt: now,
    };
    const next: EduFlowState = { ...current, activeFocus, updatedAt: now };
    persist(set, next);
    return { ok: true };
  },
  startActiveFocus: () => {
    const current = stateFromStore(get());
    const session = current.activeFocus;
    if (!session || session.status === "completed") return { ok: false, message: "Prepare a focus session first." };
    if (session.status === "running") return { ok: true };
    const nowMs = Date.now();
    const now = new Date(nowMs).toISOString();
    const remaining = Math.max(1, session.plannedSeconds - session.elapsedSeconds);
    const activeFocus: ActiveFocusSession = { ...session, status: "running", firstStartedAt: session.firstStartedAt ?? now, runStartedAt: now, endsAt: new Date(nowMs + remaining * 1000).toISOString(), updatedAt: now };
    persist(set, { ...current, activeFocus, updatedAt: now });
    return { ok: true };
  },
  pauseActiveFocus: () => {
    const current = stateFromStore(get());
    const session = current.activeFocus;
    if (!session || session.status !== "running") return { ok: false, message: "No running timer to pause." };
    const now = new Date().toISOString();
    const activeFocus: ActiveFocusSession = { ...session, status: "paused", elapsedSeconds: focusElapsedSeconds(session), runStartedAt: undefined, endsAt: undefined, updatedAt: now };
    persist(set, { ...current, activeFocus, updatedAt: now });
    return { ok: true };
  },
  resetActiveFocus: () => {
    const current = stateFromStore(get());
    const session = current.activeFocus;
    if (!session) return { ok: false, message: "No timer to reset." };
    const now = new Date().toISOString();
    const activeFocus: ActiveFocusSession = { ...session, status: "ready", elapsedSeconds: 0, firstStartedAt: undefined, runStartedAt: undefined, endsAt: undefined, updatedAt: now };
    persist(set, { ...current, activeFocus, updatedAt: now });
    return { ok: true };
  },
  completeActiveFocus: () => {
    const current = stateFromStore(get());
    const session = current.activeFocus;
    if (!session || session.status === "completed") return { ok: false, message: "There is no active session to complete." };
    const now = new Date().toISOString();
    const elapsed = session.status === "running" ? focusElapsedSeconds(session) : session.elapsedSeconds;
    const durationSeconds = Math.min(session.plannedSeconds, Math.max(0, elapsed));
    let next: EduFlowState = { ...current, activeFocus: { ...session, status: "completed", elapsedSeconds: durationSeconds, runStartedAt: undefined, endsAt: undefined, updatedAt: now }, updatedAt: now };
    if (session.mode === "focus" && session.subjectId && session.topicId && durationSeconds > 0) {
      const study: StudySession = { id: createId(), subjectId: session.subjectId, topicId: session.topicId, startedAt: session.firstStartedAt ?? session.createdAt, endedAt: now, durationSeconds, type: "focus", completed: true };
      next = {
        ...next,
        studySessions: [...current.studySessions, study],
        dailyActivity: withActivityDelta(current.dailyActivity, localDateKey(now), "focusSeconds", durationSeconds),
        planner: session.plannerTaskId ? { ...current.planner, completedTaskIds: [...new Set([...current.planner.completedTaskIds, session.plannerTaskId])], activeTaskId: undefined, activeSubjectId: undefined, activeTopicId: undefined, preparedFocusMinutes: undefined, updatedAt: now } : current.planner,
      };
    }
    persist(set, next);
    return { ok: true };
  },
  prepareBreak: () => {
    const current = stateFromStore(get());
    const previous = current.activeFocus;
    if (!previous || previous.mode !== "focus" || previous.status !== "completed") return { ok: false, message: "Complete a focus session before starting a break." };
    const now = new Date().toISOString();
    const activeFocus: ActiveFocusSession = { id: createId(), mode: "break", status: "ready", subjectId: previous.subjectId, topicId: previous.topicId, plannedSeconds: 300, elapsedSeconds: 0, createdAt: now, updatedAt: now };
    persist(set, { ...current, activeFocus, updatedAt: now });
    return { ok: true };
  },
  prepareNextFocus: () => {
    const current = stateFromStore(get());
    const previous = current.activeFocus;
    if (!previous?.subjectId || !previous.topicId) return { ok: false, message: "Choose a topic before starting another focus block." };
    const now = new Date().toISOString();
    const activeFocus: ActiveFocusSession = { id: createId(), mode: "focus", status: "ready", subjectId: previous.subjectId, topicId: previous.topicId, plannedSeconds: 1500, elapsedSeconds: 0, createdAt: now, updatedAt: now };
    persist(set, { ...current, activeFocus, updatedAt: now });
    return { ok: true };
  },
  clearActiveFocus: () => {
    const current = stateFromStore(get());
    if (!current.activeFocus) return { ok: true };
    const now = new Date().toISOString();
    persist(set, { ...current, activeFocus: null, updatedAt: now });
    return { ok: true };
  },
  setFlashcardRating: (topicId, cardId, rating) => {
    const current = stateFromStore(get());
    const exists = current.subjects.some((subject) => subject.topics.some((topic) => topic.id === topicId));
    if (!exists) return { ok: false, message: "Topic could not be found." };
    const now = new Date().toISOString();
    const previous = current.flashcardProgress[topicId] ?? { topicId, knownCardIds: [], reviewCardIds: [], updatedAt: now };
    const known = new Set(previous.knownCardIds);
    const review = new Set(previous.reviewCardIds);
    known.delete(cardId);
    review.delete(cardId);
    if (rating === "known") known.add(cardId);
    else review.add(cardId);
    const next: EduFlowState = {
      ...current,
      flashcardProgress: {
        ...current.flashcardProgress,
        [topicId]: { ...previous, knownCardIds: [...known], reviewCardIds: [...review], lastCardId: cardId, updatedAt: now },
      },
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  setFlashcardLastSeen: (topicId, cardId) => {
    const current = stateFromStore(get());
    const now = new Date().toISOString();
    const previous = current.flashcardProgress[topicId] ?? { topicId, knownCardIds: [], reviewCardIds: [], updatedAt: now };
    const next: EduFlowState = {
      ...current,
      flashcardProgress: { ...current.flashcardProgress, [topicId]: { ...previous, lastCardId: cardId, updatedAt: now } },
      updatedAt: now,
    };
    persist(set, next);
    return { ok: true };
  },
  resetFlashcardProgress: (topicId) => {
    const current = stateFromStore(get());
    if (!current.flashcardProgress[topicId]) return { ok: true };
    const copy = { ...current.flashcardProgress };
    delete copy[topicId];
    const now = new Date().toISOString();
    const next: EduFlowState = { ...current, flashcardProgress: copy, updatedAt: now };
    persist(set, next);
    return { ok: true };
  },
  createNote: (input) => {
    const current = stateFromStore(get());
    const title = input.title.trim();
    const body = input.body.trim();
    if (title.length < 2) return { ok: false, message: "Enter a note title with at least 2 characters." };
    if (!body) return { ok: false, message: "Write something before saving this note." };
    const subject = input.subjectId ? current.subjects.find((item) => item.id === input.subjectId) : undefined;
    if (input.subjectId && !subject) return { ok: false, message: "Selected subject could not be found." };
    const topic = input.topicId ? subject?.topics.find((item) => item.id === input.topicId) : undefined;
    if (input.topicId && !topic) return { ok: false, message: "Selected topic could not be found." };
    const now = new Date().toISOString();
    const note: Note = { id: createId(), title, body, subjectId: subject?.id, topicId: topic?.id, createdAt: now, updatedAt: now };
    persist(set, { ...current, notes: [note, ...current.notes], updatedAt: now });
    return { ok: true };
  },
  updateNote: (noteId, input) => {
    const current = stateFromStore(get());
    const existing = current.notes.find((note) => note.id === noteId);
    if (!existing) return { ok: false, message: "Note could not be found." };
    const title = input.title.trim();
    const body = input.body.trim();
    if (title.length < 2) return { ok: false, message: "Enter a note title with at least 2 characters." };
    if (!body) return { ok: false, message: "A note cannot be empty." };
    const subject = input.subjectId ? current.subjects.find((item) => item.id === input.subjectId) : undefined;
    if (input.subjectId && !subject) return { ok: false, message: "Selected subject could not be found." };
    const topic = input.topicId ? subject?.topics.find((item) => item.id === input.topicId) : undefined;
    if (input.topicId && !topic) return { ok: false, message: "Selected topic could not be found." };
    const now = new Date().toISOString();
    const notes = current.notes.map((note) => note.id !== noteId ? note : { ...note, title, body, subjectId: subject?.id, topicId: topic?.id, updatedAt: now });
    persist(set, { ...current, notes, updatedAt: now });
    return { ok: true };
  },
  deleteNote: (noteId) => {
    const current = stateFromStore(get());
    if (!current.notes.some((note) => note.id === noteId)) return { ok: false, message: "Note could not be found." };
    const now = new Date().toISOString();
    persist(set, { ...current, notes: current.notes.filter((note) => note.id !== noteId), updatedAt: now });
    return { ok: true };
  },
  markNotificationRead: (notificationId) => {
    const current = stateFromStore(get());
    const target = current.notifications.find((item) => item.id === notificationId);
    if (!target) return { ok: false, message: "Notification could not be found." };
    if (target.readAt) return { ok: true };
    const now = new Date().toISOString();
    persist(set, { ...current, notifications: current.notifications.map((item) => item.id === notificationId ? { ...item, readAt: now } : item), updatedAt: now });
    return { ok: true };
  },
  markAllNotificationsRead: () => {
    const current = stateFromStore(get());
    const now = new Date().toISOString();
    persist(set, { ...current, notifications: current.notifications.map((item) => item.readAt ? item : { ...item, readAt: now }), updatedAt: now });
    return { ok: true };
  },
  markNotificationBrowserDelivered: (notificationId) => {
    const current = stateFromStore(get());
    const target = current.notifications.find((item) => item.id === notificationId);
    if (!target) return { ok: false, message: "Notification could not be found." };
    if (target.browserDeliveredAt) return { ok: true };
    const now = new Date().toISOString();
    storage.save({ ...current, notifications: current.notifications.map((item) => item.id === notificationId ? { ...item, browserDeliveredAt: now } : item), updatedAt: now });
    set({ notifications: current.notifications.map((item) => item.id === notificationId ? { ...item, browserDeliveredAt: now } : item), updatedAt: now });
    return { ok: true };
  },
  setBrowserNotificationsEnabled: (enabled) => {
    const current = stateFromStore(get());
    const now = new Date().toISOString();
    persist(set, { ...current, notificationPreferences: { ...current.notificationPreferences, browserEnabled: enabled, updatedAt: now }, updatedAt: now });
    return { ok: true };
  },
  setInAppNotificationsEnabled: (enabled) => {
    const current = stateFromStore(get());
    const now = new Date().toISOString();
    persist(set, { ...current, notificationPreferences: { ...current.notificationPreferences, inAppEnabled: enabled, updatedAt: now }, updatedAt: now });
    return { ok: true };
  },
  resetPrototype: () => {
    storage.clear();
    set({ ...createEmptyState(), hydrated: true });
  },
}));
