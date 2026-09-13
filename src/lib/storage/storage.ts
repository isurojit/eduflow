import { z } from "zod";
import type { EduFlowState } from "@/types/domain";

const STORAGE_KEY = "eduflow:v1";

const topicSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  completed: z.boolean(),
  completedAt: z.string().optional(),
  bookmarked: z.boolean(),
  isStarterContent: z.boolean(),
});

const subjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["school", "college"]),
  isCustom: z.boolean(),
  createdAt: z.string(),
  topics: z.array(topicSchema),
});

const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  educationLevel: z.enum(["school", "college"]),
  classGrade: z.string().optional(),
  board: z.string().optional(),
  collegeName: z.string().optional(),
  course: z.string().optional(),
  year: z.string().optional(),
  semester: z.string().optional(),
  branch: z.string().optional(),
  subjectIds: z.array(z.string()),
  onboardingCompletedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const goalSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["study_minutes", "topics", "tests", "score"]),
  period: z.enum(["daily", "weekly"]),
  target: z.number().positive(),
  createdAt: z.string(),
});

const dailyActivitySchema = z.object({
  date: z.string(),
  topicCompletions: z.number().nonnegative(),
  testsCompleted: z.number().nonnegative(),
  focusSeconds: z.number().nonnegative(),
});

const questionResultSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z.number().int().min(0).max(3).nullable(),
  correctOption: z.number().int().min(0).max(3),
  isCorrect: z.boolean(),
});

const mistakeSchema = z.object({
  questionId: z.string().min(1),
  question: z.string().min(1),
  studentAnswer: z.string().nullable(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
  revisionHint: z.string().optional(),
});

const testAttemptSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  date: z.string(),
  subjectId: z.string().min(1),
  subjectName: z.string().min(1),
  topicId: z.string().min(1),
  topicName: z.string().min(1),
  score: z.number().int().min(0).max(10),
  totalMarks: z.literal(10),
  percentage: z.number().min(0).max(100),
  correctAnswers: z.number().int().min(0).max(10),
  wrongAnswers: z.number().int().min(0).max(10),
  unanswered: z.number().int().min(0).max(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  answers: z.array(questionResultSchema).length(10),
  mistakes: z.array(mistakeSchema),
  durationSeconds: z.number().nonnegative(),
});

const studySessionSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  topicId: z.string().min(1),
  startedAt: z.string(),
  endedAt: z.string(),
  durationSeconds: z.number().nonnegative(),
  type: z.literal("focus"),
  completed: z.literal(true),
});

const examSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.string(),
  subjectIds: z.array(z.string()),
  createdAt: z.string(),
});


const plannerSchema = z.object({
  date: z.string(),
  availableMinutes: z.number().int().min(0).max(720),
  activeSubjectId: z.string().optional(),
  activeTopicId: z.string().optional(),
  activeTaskId: z.string().optional(),
  preparedFocusMinutes: z.number().int().min(1).max(720).optional(),
  completedTaskIds: z.array(z.string()),
  updatedAt: z.string(),
});



const flashcardProgressSchema = z.object({
  topicId: z.string().min(1),
  knownCardIds: z.array(z.string()),
  reviewCardIds: z.array(z.string()),
  lastCardId: z.string().optional(),
  updatedAt: z.string(),
});

const activeFocusSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(["focus", "break"]),
  status: z.enum(["ready", "running", "paused", "completed"]),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  plannerTaskId: z.string().optional(),
  plannedSeconds: z.number().int().positive().max(43_200),
  elapsedSeconds: z.number().int().nonnegative(),
  firstStartedAt: z.string().optional(),
  runStartedAt: z.string().optional(),
  endsAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});




const noteSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


const notificationSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["study_reminder", "exam", "goal", "planner", "system"]),
  title: z.string().min(1),
  message: z.string().min(1),
  href: z.string().optional(),
  sourceKey: z.string().min(1),
  createdAt: z.string(),
  readAt: z.string().optional(),
  browserDeliveredAt: z.string().optional(),
});

const notificationPreferencesSchema = z.object({
  inAppEnabled: z.boolean(),
  browserEnabled: z.boolean(),
  updatedAt: z.string(),
});

const achievementIdSchema = z.enum(["first-test", "seven-day-streak", "ten-topics", "ninety-percent", "perfect-ten", "thirty-day-streak"]);
const achievementUnlockSchema = z.object({ id: achievementIdSchema, unlockedAt: z.string() });

const v9Schema = z.object({
  version: z.literal(9),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  planner: plannerSchema,
  activeFocus: activeFocusSchema.nullable(),
  flashcardProgress: z.record(flashcardProgressSchema),
  achievements: z.record(achievementIdSchema, achievementUnlockSchema),
  notes: z.array(noteSchema),
  notifications: z.array(notificationSchema),
  notificationPreferences: notificationPreferencesSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const v8Schema = z.object({
  version: z.literal(8),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  planner: plannerSchema,
  activeFocus: activeFocusSchema.nullable(),
  flashcardProgress: z.record(flashcardProgressSchema),
  achievements: z.record(achievementIdSchema, achievementUnlockSchema),
  notes: z.array(noteSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const v7Schema = z.object({
  version: z.literal(7),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  planner: plannerSchema,
  activeFocus: activeFocusSchema.nullable(),
  flashcardProgress: z.record(flashcardProgressSchema),
  achievements: z.record(achievementIdSchema, achievementUnlockSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const v6Schema = z.object({
  version: z.literal(6),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  planner: plannerSchema,
  activeFocus: activeFocusSchema.nullable(),
  flashcardProgress: z.record(flashcardProgressSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const v5Schema = z.object({
  version: z.literal(5),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  planner: plannerSchema,
  activeFocus: activeFocusSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const v4Schema = z.object({
  version: z.literal(4),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  planner: plannerSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const v3Schema = z.object({
  version: z.literal(3),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  testAttempts: z.array(testAttemptSchema),
  studySessions: z.array(studySessionSchema),
  exams: z.array(examSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const legacyTestAttemptSchema = z.object({
  id: z.string().min(1), studentId: z.string().min(1), date: z.string(),
  subjectId: z.string().min(1), subjectName: z.string().min(1),
  topicId: z.string().min(1), topicName: z.string().min(1),
  score: z.number().nonnegative(), totalMarks: z.number().positive(), percentage: z.number().min(0).max(100),
  correctAnswers: z.number().nonnegative(), wrongAnswers: z.number().nonnegative(), unanswered: z.number().nonnegative(),
  difficulty: z.enum(["easy", "medium", "hard"]), durationSeconds: z.number().nonnegative(),
});

const v2Schema = z.object({
  version: z.literal(2),
  profile: profileSchema.nullable(), subjects: z.array(subjectSchema), goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema), testAttempts: z.array(legacyTestAttemptSchema),
  studySessions: z.array(studySessionSchema), exams: z.array(examSchema), createdAt: z.string(), updatedAt: z.string(),
});

const v1Schema = z.object({
  version: z.literal(1),
  profile: profileSchema.nullable(),
  subjects: z.array(subjectSchema),
  goals: z.array(goalSchema),
  dailyActivity: z.record(dailyActivitySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createEmptyState = (): EduFlowState => {
  const now = new Date().toISOString();
  return {
    version: 9,
    profile: null,
    subjects: [],
    goals: [],
    dailyActivity: {},
    testAttempts: [],
    studySessions: [],
    exams: [],
    planner: { date: new Date().toISOString().slice(0, 10), availableMinutes: 120, completedTaskIds: [], updatedAt: now },
    activeFocus: null,
    flashcardProgress: {},
    achievements: {},
    notes: [],
    notifications: [],
    notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now },
    createdAt: now,
    updatedAt: now,
  };
};

function parseAndMigrate(raw: string): EduFlowState | null {
  try {
    const candidate: unknown = JSON.parse(raw);
    const v9 = v9Schema.safeParse(candidate);
    if (v9.success) return v9.data;

    const v8 = v8Schema.safeParse(candidate);
    if (v8.success) {
      const now = new Date().toISOString();
      return { ...v8.data, version: 9, notifications: [], notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now }, updatedAt: now };
    }

    const v7 = v7Schema.safeParse(candidate);
    if (v7.success) {
      const now = new Date().toISOString();
      return { ...v7.data, version: 9, notes: [], notifications: [], notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now }, updatedAt: now };
    }

    const v6 = v6Schema.safeParse(candidate);
    if (v6.success) {
      const now = new Date().toISOString();
      return { ...v6.data, version: 9, notes: [], notifications: [], notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now }, achievements: {}, updatedAt: now };
    }

    const v5 = v5Schema.safeParse(candidate);
    if (v5.success) {
      const now = new Date().toISOString();
      return { ...v5.data, version: 9, notes: [], notifications: [], notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now }, flashcardProgress: {}, achievements: {}, updatedAt: now };
    }

    const v4 = v4Schema.safeParse(candidate);
    if (v4.success) {
      const now = new Date().toISOString();
      return { ...v4.data, version: 9, notes: [], notifications: [], notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now }, activeFocus: null, flashcardProgress: {}, achievements: {}, updatedAt: now };
    }

    const v3 = v3Schema.safeParse(candidate);
    if (v3.success) {
      const now = new Date().toISOString();
      return { ...v3.data, version: 9, notes: [], notifications: [], notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: now }, activeFocus: null, flashcardProgress: {}, achievements: {}, planner: { date: now.slice(0, 10), availableMinutes: 120, completedTaskIds: [], updatedAt: now }, updatedAt: now };
    }

    const v2 = v2Schema.safeParse(candidate);
    if (v2.success) {
      return {
        ...v2.data,
        version: 9,
        notes: [],
        notifications: [],
        notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: new Date().toISOString() },
        activeFocus: null,
        flashcardProgress: {},
        achievements: {},
        testAttempts: [],
        planner: { date: new Date().toISOString().slice(0, 10), availableMinutes: 120, completedTaskIds: [], updatedAt: new Date().toISOString() },
        updatedAt: new Date().toISOString(),
      };
    }

    const v1 = v1Schema.safeParse(candidate);
    if (v1.success) {
      return {
        ...v1.data,
        version: 9,
        notes: [],
        notifications: [],
        notificationPreferences: { inAppEnabled: true, browserEnabled: false, updatedAt: new Date().toISOString() },
        activeFocus: null,
        flashcardProgress: {},
        achievements: {},
        testAttempts: [],
        studySessions: [],
        exams: [],
        planner: { date: new Date().toISOString().slice(0, 10), availableMinutes: 120, completedTaskIds: [], updatedAt: new Date().toISOString() },
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export interface StorageAdapter {
  load(): EduFlowState;
  save(state: EduFlowState): void;
  clear(): void;
}

class BrowserStorageAdapter implements StorageAdapter {
  load(): EduFlowState {
    if (typeof window === "undefined") return createEmptyState();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    const state = parseAndMigrate(raw) ?? createEmptyState();
    return state;
  }

  save(state: EduFlowState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  }

  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const storage = new BrowserStorageAdapter();
