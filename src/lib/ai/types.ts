import type { EduFlowState, TestMistake } from "@/types/domain";

export type StudyAssistantRole = "user" | "assistant";

export interface StudyAssistantMessage {
  id: string;
  role: StudyAssistantRole;
  content: string;
  createdAt: string;
}

export interface StudyAssistantContext {
  state: EduFlowState;
  subjectId?: string;
  topicId?: string;
  attemptId?: string;
}

export interface StudyAssistantReply {
  text: string;
  sourceLabel: "EduFlow local content" | "Student performance" | "Student notes" | "Unavailable";
  relatedMistakes?: TestMistake[];
}

export interface AIProvider {
  id: string;
  name: string;
  mode: "local" | "remote";
  isAvailable(): boolean;
  chat(input: { message: string; context: StudyAssistantContext; history?: StudyAssistantMessage[] }): Promise<StudyAssistantReply>;
}
