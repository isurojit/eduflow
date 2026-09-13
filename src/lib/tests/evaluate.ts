import { createId } from "@/lib/utils/id";
import type { QuestionResult, TestAttempt, TestMistake, TestQuestion, TopicDifficulty } from "@/types/domain";

export interface EvaluatedTest {
  score: number;
  totalMarks: 10;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  answers: QuestionResult[];
  mistakes: TestMistake[];
}

export function evaluateAnswers(questions: TestQuestion[], selections: Array<number | null>): EvaluatedTest {
  if (questions.length !== 10) throw new Error("A normal EduFlow topic test must contain exactly 10 questions.");

  const answers = questions.map((question, index): QuestionResult => {
    const selectedOption = selections[index] ?? null;
    return {
      questionId: question.id,
      selectedOption,
      correctOption: question.correctOption,
      isCorrect: selectedOption === question.correctOption,
    };
  });

  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const unanswered = answers.filter((answer) => answer.selectedOption === null).length;
  const wrongAnswers = 10 - correctAnswers - unanswered;
  const mistakes: TestMistake[] = answers.flatMap((answer, index) => {
    if (answer.isCorrect) return [];
    const question = questions[index];
    return [{
      questionId: question.id,
      question: question.question,
      studentAnswer: answer.selectedOption === null ? null : question.options[answer.selectedOption],
      correctAnswer: question.options[question.correctOption],
      explanation: question.explanation,
      revisionHint: question.revisionHint,
    }];
  });

  return {
    score: correctAnswers,
    totalMarks: 10,
    percentage: correctAnswers * 10,
    correctAnswers,
    wrongAnswers,
    unanswered,
    answers,
    mistakes,
  };
}

export function buildAttempt(input: {
  studentId: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty: TopicDifficulty;
  questions: TestQuestion[];
  selections: Array<number | null>;
  durationSeconds: number;
}): TestAttempt {
  const result = evaluateAnswers(input.questions, input.selections);
  return {
    id: createId(),
    studentId: input.studentId,
    date: new Date().toISOString(),
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    topicId: input.topicId,
    topicName: input.topicName,
    difficulty: input.difficulty,
    durationSeconds: Math.max(0, Math.round(input.durationSeconds)),
    ...result,
  };
}

export function resultMessage(score: number) {
  if (score >= 8) return "Excellent work. You understand this topic well.";
  if (score >= 5) return "Good progress. A little revision should improve your score.";
  return "This topic needs another pass. Review the concepts below and try again.";
}
