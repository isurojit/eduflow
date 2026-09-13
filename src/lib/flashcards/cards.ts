import { getTopicConcepts } from "@/data/questions/blueprints";
import type { Flashcard } from "@/types/domain";

export function buildFlashcards(subjectId: string, topicId: string, subjectName: string, topicName: string): Flashcard[] {
  return getTopicConcepts(subjectName, topicName).map((concept, index) => ({
    id: `${subjectId}:${topicId}:flashcard:${index}`,
    subjectId,
    topicId,
    front: concept.term,
    back: `${concept.definition}\n\nMemory cue: ${concept.hint}`,
  }));
}
