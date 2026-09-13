import { getTopicConcepts } from "@/data/questions/blueprints";
import type { RevisionContent } from "@/types/domain";

const FORMULAS: Record<string, Record<string, string[]>> = {
  Mathematics: {
    Trigonometry: ["sin²θ + cos²θ = 1", "sin θ = opposite / hypotenuse", "cos θ = adjacent / hypotenuse", "tan θ = opposite / adjacent"],
    Statistics: ["Mean = Σx / n", "Range = maximum − minimum"],
  },
  Physics: {
    Motion: ["Speed = distance / time", "Velocity = displacement / time", "Acceleration = change in velocity / time"],
    "Force and Laws of Motion": ["F = ma", "p = mv"],
    "Work and Energy": ["W = Fs cosθ", "K.E. = ½mv²", "P = W/t"],
    Electricity: ["I = Q/t", "V = IR", "P = VI", "P = I²R", "P = V²/R"],
    Light: ["n = c/v"],
  },
  Accountancy: {
    "Financial Statements": ["Equity = Assets − Liabilities"],
  },
};

export function hasRevisionSupport(subjectName: string, topicName: string) {
  return getTopicConcepts(subjectName, topicName).length > 0;
}

export function buildRevisionContent(subjectName: string, topicName: string): RevisionContent | null {
  const concepts = getTopicConcepts(subjectName, topicName);
  if (!concepts.length) return null;

  return {
    summary: `${topicName} can be revised efficiently by separating the topic into its core terms, what each term means, and the distinctions students commonly confuse. The notes below use EduFlow's verified starter concept bank for this topic.`,
    importantConcepts: concepts.map((item) => item.term),
    keyDefinitions: concepts.map((item) => ({ term: item.term, definition: item.definition })),
    formulas: FORMULAS[subjectName]?.[topicName] ?? [],
    commonMistakes: concepts.slice(0, 4).map((item) => `Do not rely on the term alone; make sure you can distinguish ${item.term} using this cue: ${item.hint}`),
    keyPoints: concepts.map((item) => item.hint),
    quickQuestions: concepts.map((item) => `In one or two sentences, explain ${item.term} without looking at the definition.`),
  };
}
