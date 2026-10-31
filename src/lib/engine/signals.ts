// Adapter: converts persisted application state into algorithm inputs.

import type { AppData, AssessmentResult, AppSettings } from '@/types';
import type { EngineConfig, TopicSignal } from './pbwps';

/** Latest result per topic, by completion time. */
export function latestResultsByTopic(results: AssessmentResult[]): Map<string, AssessmentResult> {
  const latest = new Map<string, AssessmentResult>();
  for (const r of results) {
    const current = latest.get(r.topicId);
    if (!current || r.completedAt > current.completedAt) latest.set(r.topicId, r);
  }
  return latest;
}

export function buildTopicSignals(data: Pick<AppData, 'subjects' | 'topics' | 'results' | 'progress'>): TopicSignal[] {
  const subjectIndex = new Map(data.subjects.map((s, i) => [s.id, i]));
  const latest = latestResultsByTopic(data.results);
  const attempts = new Map<string, number>();
  for (const r of data.results) attempts.set(r.topicId, (attempts.get(r.topicId) ?? 0) + 1);

  return data.topics
    .filter((t) => subjectIndex.has(t.subjectId))
    .map((t) => {
      const result = latest.get(t.id);
      const progress = data.progress[t.id];
      const practiced = [result?.completedAt, progress?.lastReviewedAt, progress?.completedAt]
        .filter((v): v is string => Boolean(v))
        .sort();
      return {
        id: t.id,
        name: t.name,
        subjectId: t.subjectId,
        difficulty: t.difficulty,
        importance: t.importance,
        estimatedMinutes: t.estimatedMinutes,
        prerequisites: t.prerequisites,
        latestScore: result ? result.score : null,
        attempts: attempts.get(t.id) ?? 0,
        lastPracticedAt: practiced.length > 0 ? practiced[practiced.length - 1] : null,
        status: progress?.status ?? 'not-started',
        order: (subjectIndex.get(t.subjectId) ?? 0) * 1000 + t.order,
      };
    });
}

export function buildEngineConfig(settings: AppSettings, now: Date = new Date()): EngineConfig {
  return { ...settings.engine, thresholds: settings.thresholds, now };
}
