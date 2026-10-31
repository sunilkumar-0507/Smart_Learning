// Assessment construction, submission validation and scoring.

import type { AnswerRecord, Assessment, Question, Topic } from '@/types';

export function buildAssessment(topic: Topic): Assessment {
  return { topicId: topic.id, title: `${topic.name} Assessment`, questions: topic.questions };
}

export interface SubmissionCheck {
  complete: boolean;
  unanswered: string[];
}

/** A submission is complete only when every question has a valid option selected. */
export function validateSubmission(questions: Question[], answers: Record<string, number | undefined>): SubmissionCheck {
  const unanswered = questions
    .filter((q) => {
      const a = answers[q.id];
      return a === undefined || !Number.isInteger(a) || a < 0 || a >= q.options.length;
    })
    .map((q) => q.id);
  return { complete: questions.length > 0 && unanswered.length === 0, unanswered };
}

export interface ScoreResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: AnswerRecord[];
}

/** Percentage of correctly answered questions, rounded to an integer. */
export function calculateScore(questions: Question[], answers: Record<string, number | undefined>): ScoreResult {
  const records: AnswerRecord[] = questions.map((q) => {
    const selectedIndex = answers[q.id] ?? -1;
    return { questionId: q.id, selectedIndex, correct: selectedIndex === q.correctIndex };
  });
  const correctCount = records.filter((r) => r.correct).length;
  const totalQuestions = questions.length;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  return { score, correctCount, totalQuestions, answers: records };
}
