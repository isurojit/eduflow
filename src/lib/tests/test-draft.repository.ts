export interface TestDraft {
  startedAt: string;
  selections: Array<number | null>;
  currentIndex: number;
}

const key = (subjectId: string, topicId: string) => `eduflow:test-draft:${subjectId}:${topicId}`;

export const testDraftRepository = {
  load(subjectId: string, topicId: string): TestDraft | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(key(subjectId, topicId));
      if (!raw) return null;
      const value = JSON.parse(raw) as TestDraft;
      if (!Array.isArray(value.selections) || typeof value.currentIndex !== "number" || !value.startedAt) return null;
      return value;
    } catch {
      return null;
    }
  },
  save(subjectId: string, topicId: string, draft: TestDraft) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(key(subjectId, topicId), JSON.stringify(draft));
  },
  clear(subjectId: string, topicId: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key(subjectId, topicId));
  },
};
