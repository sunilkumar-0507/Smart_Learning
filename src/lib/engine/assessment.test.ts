import { describe, expect, it } from 'vitest';
import { buildAssessment, calculateScore, validateSubmission } from './assessment';
import { classifyPerformance, computeImprovement, computeTopicPerformance, overallScore, validateThresholds } from './performance';
import type { AssessmentResult, Question, Topic } from '@/types';

const q = (id: string, correctIndex: 0 | 1 | 2 | 3): Question => ({ id, topicId: 't', text: `Q ${id}`, options: ['a', 'b', 'c', 'd'], correctIndex, explanation: 'because' });
const questions = [q('1', 0), q('2', 1), q('3', 2), q('4', 3), q('5', 0)];

describe('quiz score calculation', () => {
  it('scores the percentage of correct answers', () => {
    const r = calculateScore(questions, { '1': 0, '2': 1, '3': 2, '4': 0, '5': 1 });
    expect(r).toMatchObject({ score: 60, correctCount: 3, totalQuestions: 5 });
    expect(r.answers.map((a) => a.correct)).toEqual([true, true, true, false, false]);
  });
  it('handles zero and perfect scores', () => {
    expect(calculateScore(questions, { '1': 1, '2': 0, '3': 0, '4': 0, '5': 3 }).score).toBe(0);
    expect(calculateScore(questions, { '1': 0, '2': 1, '3': 2, '4': 3, '5': 0 }).score).toBe(100);
  });
  it('rounds to whole percentages', () => {
    expect(calculateScore(questions.slice(0, 3), { '1': 0, '2': 0, '3': 0 }).score).toBe(33);
  });
  it('returns 0 for an assessment without questions', () => {
    expect(calculateScore([], {}).score).toBe(0);
  });
});

describe('submission validation', () => {
  it('prevents incomplete submissions', () => {
    const check = validateSubmission(questions, { '1': 0, '3': 2 });
    expect(check.complete).toBe(false);
    expect(check.unanswered).toEqual(['2', '4', '5']);
  });
  it('rejects invalid option indexes', () => {
    expect(validateSubmission(questions.slice(0, 1), { '1': 7 }).complete).toBe(false);
    expect(validateSubmission(questions.slice(0, 1), { '1': 1.5 }).complete).toBe(false);
  });
  it('accepts a fully answered assessment and rejects an empty one', () => {
    expect(validateSubmission(questions, { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }).complete).toBe(true);
    expect(validateSubmission([], {}).complete).toBe(false);
  });
  it('builds an assessment from the topic question bank', () => {
    const topic = { id: 't', name: 'Loops', questions } as unknown as Topic;
    expect(buildAssessment(topic)).toEqual({ topicId: 't', title: 'Loops Assessment', questions });
  });
});

describe('performance analysis', () => {
  const t = { developing: 40, good: 60, excellent: 80 };
  it('classifies performance using configurable thresholds', () => {
    expect(classifyPerformance(39, t)).toBe('Needs Improvement');
    expect(classifyPerformance(40, t)).toBe('Developing');
    expect(classifyPerformance(60, t)).toBe('Good');
    expect(classifyPerformance(80, t)).toBe('Excellent');
    expect(classifyPerformance(55, { developing: 50, good: 70, excellent: 90 })).toBe('Developing');
  });
  it('validates threshold order', () => {
    expect(validateThresholds(t)).toBeNull();
    expect(validateThresholds({ developing: 60, good: 50, excellent: 80 })).toMatch(/increase/);
    expect(validateThresholds({ developing: -1, good: 50, excellent: 80 })).toMatch(/between/);
  });
  it('computes topic performance and improvement', () => {
    const r = (topicId: string, score: number, day: number): AssessmentResult => ({
      id: `${topicId}-${day}`,
      topicId,
      subjectId: 's',
      score,
      correctCount: 0,
      totalQuestions: 5,
      answers: [],
      startedAt: `2026-01-0${day}T10:00:00.000Z`,
      completedAt: `2026-01-0${day}T10:05:00.000Z`,
      durationSeconds: 300,
    });
    const perf = computeTopicPerformance([r('a', 80, 3), r('a', 40, 1), r('b', 60, 2)]);
    const a = perf.find((p) => p.topicId === 'a')!;
    expect(a).toMatchObject({ attempts: 2, first: 40, latest: 80, best: 80, improvement: 40 });
    expect(overallScore(perf)).toBe(70);
    expect(computeImprovement(perf)).toEqual({ topicsCompared: 1, averagePointChange: 40, relativeChange: 100 });
    expect(overallScore([])).toBeNull();
  });
});
