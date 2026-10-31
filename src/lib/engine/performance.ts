// Performance analytics derived from assessment history.

import type { AssessmentResult, PerformanceThresholds, Subject, Topic } from '@/types';

export type PerformanceBand = 'Needs Improvement' | 'Developing' | 'Good' | 'Excellent';

export const DEFAULT_THRESHOLDS: PerformanceThresholds = { developing: 40, good: 60, excellent: 80 };

export function classifyPerformance(score: number, t: PerformanceThresholds = DEFAULT_THRESHOLDS): PerformanceBand {
  if (score < t.developing) return 'Needs Improvement';
  if (score < t.good) return 'Developing';
  if (score < t.excellent) return 'Good';
  return 'Excellent';
}

/** Thresholds must be strictly increasing and within 0–100. */
export function validateThresholds(t: PerformanceThresholds): string | null {
  const values = [t.developing, t.good, t.excellent];
  if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) return 'Thresholds must be between 0 and 100.';
  if (!(t.developing < t.good && t.good < t.excellent)) return 'Thresholds must increase: Developing < Good < Excellent.';
  return null;
}

export interface TopicPerformance {
  topicId: string;
  subjectId: string;
  attempts: number;
  first: number;
  latest: number;
  best: number;
  average: number;
  /** Latest minus first score, in percentage points. */
  improvement: number;
  lastAttemptAt: string;
}

function chronological(results: AssessmentResult[]): AssessmentResult[] {
  return [...results].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
}

export function computeTopicPerformance(results: AssessmentResult[]): TopicPerformance[] {
  const byTopic = new Map<string, AssessmentResult[]>();
  for (const r of chronological(results)) byTopic.set(r.topicId, [...(byTopic.get(r.topicId) ?? []), r]);
  return [...byTopic.entries()].map(([topicId, list]) => {
    const scores = list.map((r) => r.score);
    return {
      topicId,
      subjectId: list[0].subjectId,
      attempts: list.length,
      first: scores[0],
      latest: scores[scores.length - 1],
      best: Math.max(...scores),
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      improvement: scores[scores.length - 1] - scores[0],
      lastAttemptAt: list[list.length - 1].completedAt,
    };
  });
}

export interface SubjectPerformance {
  subjectId: string;
  name: string;
  color: string;
  average: number | null;
  assessedTopics: number;
  totalTopics: number;
}

export function computeSubjectPerformance(subjects: Subject[], topics: Topic[], perf: TopicPerformance[]): SubjectPerformance[] {
  const latestByTopic = new Map(perf.map((p) => [p.topicId, p.latest]));
  return subjects.map((s) => {
    const subjectTopics = topics.filter((t) => t.subjectId === s.id);
    const scores = subjectTopics.map((t) => latestByTopic.get(t.id)).filter((v): v is number => v !== undefined);
    return {
      subjectId: s.id,
      name: s.name,
      color: s.color,
      average: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
      assessedTopics: scores.length,
      totalTopics: subjectTopics.length,
    };
  });
}

/** Mean of the latest score of every assessed topic, or null with no history. */
export function overallScore(perf: TopicPerformance[]): number | null {
  if (perf.length === 0) return null;
  return perf.reduce((s, p) => s + p.latest, 0) / perf.length;
}

export interface ImprovementSummary {
  /** Topics with at least two attempts. */
  topicsCompared: number;
  /** Mean change from first to latest attempt (percentage points). */
  averagePointChange: number;
  /** Relative change of the mean score from first to latest attempt (%). */
  relativeChange: number;
}

export function computeImprovement(perf: TopicPerformance[]): ImprovementSummary {
  const repeated = perf.filter((p) => p.attempts >= 2);
  if (repeated.length === 0) return { topicsCompared: 0, averagePointChange: 0, relativeChange: 0 };
  const firstMean = repeated.reduce((s, p) => s + p.first, 0) / repeated.length;
  const latestMean = repeated.reduce((s, p) => s + p.latest, 0) / repeated.length;
  return {
    topicsCompared: repeated.length,
    averagePointChange: latestMean - firstMean,
    relativeChange: firstMean === 0 ? (latestMean > 0 ? 100 : 0) : ((latestMean - firstMean) / firstMean) * 100,
  };
}

export interface TrendPoint {
  index: number;
  date: string;
  score: number;
  runningAverage: number;
  topicId: string;
}

export function computeScoreTrend(results: AssessmentResult[]): TrendPoint[] {
  let sum = 0;
  return chronological(results).map((r, i) => {
    sum += r.score;
    return { index: i + 1, date: r.completedAt, score: r.score, runningAverage: Math.round((sum / (i + 1)) * 10) / 10, topicId: r.topicId };
  });
}
