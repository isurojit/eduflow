import type { EduFlowState } from "@/types/domain";

export type DocumentKind = "notes" | "syllabus" | "marksheet" | "question-paper" | "other";

export interface ExtractedMark {
  subject: string;
  score?: number;
  maximum?: number;
  grade?: string;
}

export interface ExtractedSyllabusSubject {
  name: string;
  topics: string[];
}

export interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  suggestedKind: DocumentKind;
  marks?: ExtractedMark[];
  syllabus?: ExtractedSyllabusSubject[];
  noteTitle?: string;
  noteBody?: string;
}

export interface UserDocumentRecord {
  id: string;
  ownerUid: string;
  name: string;
  mimeType: string;
  size: number;
  kind: DocumentKind;
  extractedText: string;
  analysis: DocumentAnalysis;
  storage: "gridfs" | "firebase" | "metadata-only";
  storageId?: string;
  createdAt: string;
}

export type AgentAction =
  | { type: "navigate"; href: string; label?: string }
  | { type: "set_study_minutes"; minutes: number }
  | { type: "add_goal"; goalType: "study_minutes" | "topics" | "tests" | "score"; period: "daily" | "weekly"; target: number }
  | { type: "add_exam"; name: string; date: string; subjectIds: string[] }
  | { type: "create_note"; title: string; body: string; subjectId?: string; topicId?: string }
  | { type: "complete_topic"; subjectId: string; topicId: string }
  | { type: "bookmark_topic"; subjectId: string; topicId: string }
  | { type: "start_focus"; subjectId: string; topicId: string; minutes?: number }
  | { type: "research"; query: string };

export interface AgentResponse {
  message: string;
  actions: AgentAction[];
  source: "gemini" | "local";
}

export interface CloudStateEnvelope {
  state: EduFlowState;
  updatedAt: string;
}

export interface ResearchResult {
  id: string;
  source: "Wikipedia" | "OpenAlex" | "Crossref";
  title: string;
  snippet: string;
  url: string;
  year?: number;
  authors?: string[];
}
