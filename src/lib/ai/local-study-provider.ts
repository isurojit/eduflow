import { getTopicConcepts } from "@/data/questions/blueprints";
import { buildRevisionContent } from "@/lib/revision/content";
import { calculateWeakTopics } from "@/lib/analytics/performance";
import type { AIProvider, StudyAssistantContext, StudyAssistantReply } from "@/lib/ai/types";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function findContext(context: StudyAssistantContext) {
  const subject = context.subjectId ? context.state.subjects.find((item) => item.id === context.subjectId) : undefined;
  const topic = subject && context.topicId ? subject.topics.find((item) => item.id === context.topicId) : undefined;
  const attempt = context.attemptId
    ? context.state.testAttempts.find((item) => item.id === context.attemptId)
    : context.topicId
      ? [...context.state.testAttempts].filter((item) => item.topicId === context.topicId).sort((a, b) => b.date.localeCompare(a.date))[0]
      : undefined;
  return { subject, topic, attempt };
}

function noteMatches(context: StudyAssistantContext) {
  return context.state.notes.filter((note) => {
    if (context.topicId && note.topicId === context.topicId) return true;
    if (context.subjectId && note.subjectId === context.subjectId && !context.topicId) return true;
    return false;
  });
}

function formatConcepts(subjectName: string, topicName: string) {
  return getTopicConcepts(subjectName, topicName)
    .map((concept) => `• ${concept.term}: ${concept.definition}`)
    .join("\n");
}

function unsupported(subjectName?: string, topicName?: string): StudyAssistantReply {
  return {
    text: topicName
      ? `I don’t have verified local study content for “${topicName}”${subjectName ? ` in ${subjectName}` : ""}. I can still help you review your own notes or test history for this topic, but I won’t invent academic material.`
      : "Choose a supported subject/topic, or ask about your own test performance, mistakes, notes, or study priorities. I won’t invent academic material that is not in EduFlow’s local content.",
    sourceLabel: "Unavailable",
  };
}

export class LocalStudyProvider implements AIProvider {
  id = "local-study";
  name = "Local Study Assistant";
  mode = "local" as const;

  isAvailable() {
    return true;
  }

  async chat({ message, context }: Parameters<AIProvider["chat"]>[0]): Promise<StudyAssistantReply> {
    const query = normalize(message);
    const { subject, topic, attempt } = findContext(context);
    const notes = noteMatches(context);

    if (/mistake|wrong|lost mark|incorrect|why.*wrong|explain.*test/.test(query) && attempt) {
      if (!attempt.mistakes.length) {
        return { text: `Your latest ${attempt.topicName} attempt was ${attempt.score}/10 and has no recorded mistakes.`, sourceLabel: "Student performance" };
      }
      const lines = attempt.mistakes.map((mistake, index) => `${index + 1}. ${mistake.question}\n   Correct answer: ${mistake.correctAnswer}\n   Why: ${mistake.explanation}${mistake.revisionHint ? `\n   Revise: ${mistake.revisionHint}` : ""}`);
      return {
        text: `Your ${attempt.topicName} attempt was ${attempt.score}/10. These are the areas to correct:\n\n${lines.join("\n\n")}`,
        sourceLabel: "Student performance",
        relatedMistakes: attempt.mistakes,
      };
    }

    if (/note|my notes|what did i write|summari[sz]e.*note/.test(query)) {
      if (!notes.length) return { text: "You don’t have any saved notes linked to this study context yet.", sourceLabel: "Student notes" };
      return {
        text: notes.map((note) => `${note.title}\n${note.body}`).join("\n\n—\n\n"),
        sourceLabel: "Student notes",
      };
    }

    if (/weak|priority|what.*study|recommend|lowest|improve next/.test(query)) {
      const weak = calculateWeakTopics(context.state.testAttempts).slice(0, 3);
      if (!weak.length) {
        return { text: "There isn’t enough repeated test data to identify a reliable weak-topic priority yet. Complete a few topic tests and I can use those results.", sourceLabel: "Student performance" };
      }
      return {
        text: `Based on your saved test attempts, focus on:\n${weak.map((item, index) => `${index + 1}. ${item.subjectName} · ${item.topicName} — ${item.average.toFixed(1)}/10 average across ${item.attempts} ${item.attempts === 1 ? "attempt" : "attempts"}.`).join("\n")}`,
        sourceLabel: "Student performance",
      };
    }

    if (!subject || !topic) {
      return unsupported();
    }

    const concepts = getTopicConcepts(subject.name, topic.name);
    const revision = buildRevisionContent(subject.name, topic.name);
    if (!concepts.length || !revision) return unsupported(subject.name, topic.name);

    const exactConcept = concepts.find((concept) => {
      const term = normalize(concept.term);
      return query.includes(term) || query === `what is ${term}` || query === `define ${term}`;
    });
    if (exactConcept) {
      return {
        text: `${exactConcept.term}: ${exactConcept.definition}\n\nRevision cue: ${exactConcept.hint}`,
        sourceLabel: "EduFlow local content",
      };
    }

    if (/formula|equation|calculate|calculation/.test(query)) {
      if (!revision.formulas.length) {
        return { text: `EduFlow’s verified local revision content for ${topic.name} does not currently include a formula list. I can explain the stored concepts instead.`, sourceLabel: "EduFlow local content" };
      }
      return { text: `Key formulas for ${topic.name}:\n${revision.formulas.map((formula) => `• ${formula}`).join("\n")}`, sourceLabel: "EduFlow local content" };
    }

    if (/common mistake|avoid|confus|trick/.test(query)) {
      return { text: `Common revision traps for ${topic.name}:\n${revision.commonMistakes.map((item) => `• ${item}`).join("\n")}`, sourceLabel: "EduFlow local content" };
    }

    if (/quiz|question|recall|practice me/.test(query)) {
      return { text: `Try these quick recall prompts without looking at your notes:\n${revision.quickQuestions.slice(0, 5).map((item, index) => `${index + 1}. ${item}`).join("\n")}`, sourceLabel: "EduFlow local content" };
    }

    if (/summar|revise|revision|explain|teach|help|overview|key point|concept/.test(query)) {
      const formulaText = revision.formulas.length ? `\n\nFormulas:\n${revision.formulas.map((formula) => `• ${formula}`).join("\n")}` : "";
      return {
        text: `${revision.summary}\n\nCore concepts:\n${formatConcepts(subject.name, topic.name)}${formulaText}\n\nKey reminders:\n${revision.keyPoints.slice(0, 5).map((item) => `• ${item}`).join("\n")}`,
        sourceLabel: "EduFlow local content",
      };
    }

    return {
      text: `I can help with ${topic.name} using EduFlow’s verified local content. Ask me to explain a concept, summarize the topic, list formulas, show common mistakes, give recall questions, review your test mistakes, or read your linked notes.`,
      sourceLabel: "EduFlow local content",
    };
  }
}
