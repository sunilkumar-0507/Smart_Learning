// React bindings for the pure engine modules. All derived data is memoised
// from store state, so every view updates automatically when data changes.

import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import type { Subject, Topic } from '@/types';
import { buildEngineConfig, buildTopicSignals } from '@/lib/engine/signals';
import { generateLearningPath, rankRecommendations, type EngineConfig, type TopicSignal } from '@/lib/engine/pbwps';
import {
  computeImprovement,
  computeScoreTrend,
  computeSubjectPerformance,
  computeTopicPerformance,
  overallScore,
} from '@/lib/engine/performance';
import { calculateStreak, totalLearningMinutes } from '@/lib/engine/progress';
import { toISODate } from '@/lib/date';

export function useTopicSignals(): TopicSignal[] {
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  const results = useAppStore((s) => s.results);
  const progress = useAppStore((s) => s.progress);
  return useMemo(() => buildTopicSignals({ subjects, topics, results, progress }), [subjects, topics, results, progress]);
}

export function useEngineConfig(): EngineConfig {
  const settings = useAppStore((s) => s.settings);
  // Recompute "now" whenever activity changes so revision needs stay current.
  const activities = useAppStore((s) => s.activities);
  return useMemo(() => buildEngineConfig(settings, new Date()), [settings, activities]);
}

export function useRanking() {
  const signals = useTopicSignals();
  const config = useEngineConfig();
  return useMemo(() => rankRecommendations(signals, config), [signals, config]);
}

export function useLearningPath() {
  const signals = useTopicSignals();
  const config = useEngineConfig();
  return useMemo(() => generateLearningPath(signals, config), [signals, config]);
}

export function useLookups(): { topicById: Map<string, Topic>; subjectById: Map<string, Subject> } {
  const topics = useAppStore((s) => s.topics);
  const subjects = useAppStore((s) => s.subjects);
  return useMemo(
    () => ({ topicById: new Map(topics.map((t) => [t.id, t])), subjectById: new Map(subjects.map((s) => [s.id, s])) }),
    [topics, subjects],
  );
}

export function usePerformance() {
  const results = useAppStore((s) => s.results);
  const subjects = useAppStore((s) => s.subjects);
  const topics = useAppStore((s) => s.topics);
  return useMemo(() => {
    const topicPerf = computeTopicPerformance(results);
    return {
      topicPerf,
      subjectPerf: computeSubjectPerformance(subjects, topics, topicPerf),
      overall: overallScore(topicPerf),
      improvement: computeImprovement(topicPerf),
      trend: computeScoreTrend(results),
    };
  }, [results, subjects, topics]);
}

export function useProgressSummary() {
  const topics = useAppStore((s) => s.topics);
  const subjects = useAppStore((s) => s.subjects);
  const progress = useAppStore((s) => s.progress);
  const activities = useAppStore((s) => s.activities);
  return useMemo(() => {
    const subjectIds = new Set(subjects.map((s) => s.id));
    const live = topics.filter((t) => subjectIds.has(t.subjectId));
    const completed = live.filter((t) => progress[t.id]?.status === 'completed').length;
    const inProgress = live.filter((t) => progress[t.id]?.status === 'in-progress').length;
    return {
      totalTopics: live.length,
      completed,
      inProgress,
      pending: live.length - completed,
      completionRate: live.length ? (completed / live.length) * 100 : 0,
      streak: calculateStreak(activities, toISODate(new Date())),
      learningMinutes: totalLearningMinutes(activities),
    };
  }, [topics, subjects, progress, activities]);
}
