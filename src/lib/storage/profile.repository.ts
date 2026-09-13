import { createId } from "@/lib/utils/id";
import type { EduFlowState, StudentProfile, Subject, Goal, Topic } from "@/types/domain";
import type { OnboardingValues } from "@/features/onboarding/schema";
import { starterSyllabus } from "@/data/syllabus/starter";

const id = () => createId();

export function buildInitialState(previous: EduFlowState, values: OnboardingValues): EduFlowState {
  const now = new Date().toISOString();

  const subjects: Subject[] = values.subjects.map((name) => {
    const subjectId = id();
    const topicNames = starterSyllabus[name] ?? [];
    const topics: Topic[] = topicNames.map((topicName) => ({
      id: id(),
      subjectId,
      name: topicName,
      completed: false,
      bookmarked: false,
      difficulty: "medium",
      isStarterContent: true,
    }));

    return {
      id: subjectId,
      name,
      type: values.educationLevel,
      isCustom: !starterSyllabus[name],
      createdAt: now,
      topics,
    };
  });

  const profile: StudentProfile = {
    id: previous.profile?.id ?? id(),
    name: values.name.trim(),
    educationLevel: values.educationLevel,
    classGrade: values.educationLevel === "school" ? values.classGrade : undefined,
    board: values.educationLevel === "school" ? values.board : undefined,
    collegeName: values.educationLevel === "college" ? values.collegeName?.trim() : undefined,
    course: values.educationLevel === "college" ? values.course : undefined,
    year: values.educationLevel === "college" ? values.year : undefined,
    semester: values.educationLevel === "college" ? values.semester : undefined,
    branch: values.educationLevel === "college" ? values.branch : undefined,
    subjectIds: subjects.map((subject) => subject.id),
    onboardingCompletedAt: now,
    createdAt: previous.profile?.createdAt ?? now,
    updatedAt: now,
  };

  const goals: Goal[] = previous.goals.length ? previous.goals : [
    { id: id(), type: "study_minutes", period: "daily", target: 120, createdAt: now },
    { id: id(), type: "topics", period: "daily", target: 2, createdAt: now },
  ];

  return { ...previous, version: 9, profile, subjects, goals, activeFocus: null, updatedAt: now };
}
