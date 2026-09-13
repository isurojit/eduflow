export type EducationLevel = "school" | "college";

export interface StudentProfile {
  id: string;
  name: string;
  educationLevel: EducationLevel;
  classGrade?: string;
  board?: string;
  collegeName?: string;
  course?: string;
  year?: string;
  semester?: string;
  branch?: string;
  subjectIds: string[];
  onboardingCompletedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type TopicDifficulty = "easy" | "medium" | "hard";

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  difficulty?: TopicDifficulty;
  completed: boolean;
  completedAt?: string;
  bookmarked: boolean;
  isStarterContent: boolean;
}

export interface Subject {
  id: string;
  name: string;
  type: EducationLevel;
  isCustom: boolean;
  createdAt: string;
  topics: Topic[];
}

export interface Goal {
  id: string;
  type: "study_minutes" | "topics" | "tests" | "score";
  period: "daily" | "weekly";
  target: number;
  createdAt: string;
}

export interface DailyActivity {
  date: string;
  topicCompletions: number;
  testsCompleted: number;
  focusSeconds: number;
}

export interface TestQuestion {
  id: string;
  subjectId: string;
  topicId: string;
  difficulty: TopicDifficulty;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  revisionHint?: string;
}

export interface QuestionResult {
  questionId: string;
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
}

export interface TestMistake {
  questionId: string;
  question: string;
  studentAnswer: string | null;
  correctAnswer: string;
  explanation: string;
  revisionHint?: string;
}

export interface TestAttempt {
  id: string;
  studentId: string;
  date: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  score: number;
  totalMarks: 10;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  difficulty: TopicDifficulty;
  answers: QuestionResult[];
  mistakes: TestMistake[];
  durationSeconds: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topicId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  type: "focus";
  completed: true;
}

export interface Exam {
  id: string;
  name: string;
  date: string;
  subjectIds: string[];
  createdAt: string;
}

export interface PlannerPreferences {
  date: string;
  availableMinutes: number;
  activeSubjectId?: string;
  activeTopicId?: string;
  activeTaskId?: string;
  preparedFocusMinutes?: number;
  completedTaskIds: string[];
  updatedAt: string;
}

export type FocusMode = "focus" | "break";
export type FocusStatus = "ready" | "running" | "paused" | "completed";

export interface ActiveFocusSession {
  id: string;
  mode: FocusMode;
  status: FocusStatus;
  subjectId?: string;
  topicId?: string;
  plannerTaskId?: string;
  plannedSeconds: number;
  elapsedSeconds: number;
  firstStartedAt?: string;
  runStartedAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionContent {
  summary: string;
  importantConcepts: string[];
  keyDefinitions: Array<{ term: string; definition: string }>;
  formulas: string[];
  commonMistakes: string[];
  keyPoints: string[];
  quickQuestions: string[];
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topicId: string;
  front: string;
  back: string;
}

export interface FlashcardProgress {
  topicId: string;
  knownCardIds: string[];
  reviewCardIds: string[];
  lastCardId?: string;
  updatedAt: string;
}

export type AchievementId =
  | "first-test"
  | "seven-day-streak"
  | "ten-topics"
  | "ninety-percent"
  | "perfect-ten"
  | "thirty-day-streak";

export interface AchievementUnlock {
  id: AchievementId;
  unlockedAt: string;
}

export type NotificationKind = "study_reminder" | "exam" | "goal" | "planner" | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  href?: string;
  sourceKey: string;
  createdAt: string;
  readAt?: string;
  browserDeliveredAt?: string;
}

export interface NotificationPreferences {
  inAppEnabled: boolean;
  browserEnabled: boolean;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  subjectId?: string;
  topicId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EduFlowState {
  version: 9;
  profile: StudentProfile | null;
  subjects: Subject[];
  goals: Goal[];
  dailyActivity: Record<string, DailyActivity>;
  testAttempts: TestAttempt[];
  studySessions: StudySession[];
  exams: Exam[];
  planner: PlannerPreferences;
  activeFocus: ActiveFocusSession | null;
  flashcardProgress: Record<string, FlashcardProgress>;
  achievements: Partial<Record<AchievementId, AchievementUnlock>>;
  notes: Note[];
  notifications: AppNotification[];
  notificationPreferences: NotificationPreferences;
  createdAt: string;
  updatedAt: string;
}
