import { describe, expect, it } from 'vitest';
import { buildCurriculum, defaultSettings } from '@/data/seed';
import { DEFAULT_EXPERIMENT_CONFIG, generateSimulatedProfiles, ndcgAtK, runExperiment, simulatePathCompletion, type CurriculumTopic } from './experiments';
import { equalPriorityMethod, performanceBasedMethod, pbwpsMethod } from './baselines';
import { validatePrerequisites, type EngineConfig } from './pbwps';

const settings = defaultSettings();
const curriculum: CurriculumTopic[] = (() => {
  const { subjects, topics } = buildCurriculum();
  const index = new Map(subjects.map((s, i) => [s.id, i]));
  return topics.map((t) => ({ id: t.id, name: t.name, subjectId: t.subjectId, difficulty: t.difficulty, importance: t.importance, estimatedMinutes: t.estimatedMinutes, prerequisites: t.prerequisites, order: index.get(t.subjectId)! * 1000 + t.order }));
})();
const engine: EngineConfig = { ...settings.engine, thresholds: settings.thresholds, now: new Date(DEFAULT_EXPERIMENT_CONFIG.referenceDate) };

describe('simulated dataset', () => {
  it('generates at least 100 reproducible profiles', () => {
    const a = generateSimulatedProfiles(curriculum, DEFAULT_EXPERIMENT_CONFIG);
    const b = generateSimulatedProfiles(curriculum, DEFAULT_EXPERIMENT_CONFIG);
    expect(a.length).toBeGreaterThanOrEqual(100);
    expect(a).toEqual(b);
    const c = generateSimulatedProfiles(curriculum, { ...DEFAULT_EXPERIMENT_CONFIG, seed: 7 });
    expect(c[0].trueMastery).not.toEqual(a[0].trueMastery);
  });

  it('only marks topics completed when their prerequisites are completed', () => {
    for (const p of generateSimulatedProfiles(curriculum, DEFAULT_EXPERIMENT_CONFIG)) {
      const byId = new Map(p.signals.map((s) => [s.id, s]));
      for (const s of p.signals.filter((x) => x.status === 'completed')) {
        expect(s.prerequisites.every((id) => byId.get(id)!.status === 'completed')).toBe(true);
      }
    }
  });
});

describe('comparison methods', () => {
  const profile = generateSimulatedProfiles(curriculum, DEFAULT_EXPERIMENT_CONFIG)[0];
  const byId = new Map(profile.signals.map((s) => [s.id, s]));
  const compliant = (ids: string[]) => ids.every((id) => validatePrerequisites(byId.get(id)!, byId, engine.prerequisiteMastery).satisfied);

  it('Method A only ranks eligible topics', () => {
    expect(compliant(equalPriorityMethod(profile.signals, engine).ranking)).toBe(true);
  });
  it('Method C only ranks eligible topics and its sequence is prerequisite-safe', () => {
    const out = pbwpsMethod(profile.signals, engine);
    expect(compliant(out.ranking)).toBe(true);
    expect(simulatePathCompletion(out.sequence, profile.signals, engine.prerequisiteMastery, 1e9)).toBe(1);
  });
  it('Method B ranks by knowledge gap without prerequisite filtering', () => {
    const out = performanceBasedMethod(profile.signals, engine);
    expect(out.ranking.length).toBe(profile.signals.filter((s) => s.status !== 'completed').length);
  });
});

describe('metrics', () => {
  it('computes nDCG correctly', () => {
    const rel = { a: 1, b: 0.5, c: 0 };
    expect(ndcgAtK(['a', 'b'], rel, ['a', 'b', 'c'], 2)).toBeCloseTo(1);
    expect(ndcgAtK(['c', 'b'], rel, ['a', 'b', 'c'], 2)).toBeLessThan(1);
    expect(ndcgAtK([], {}, [], 3)).toBe(1);
  });

  it('runs the full experiment with bounded metrics', () => {
    const result = runExperiment(curriculum, settings.engine, settings.thresholds, DEFAULT_EXPERIMENT_CONFIG);
    expect(result.simulated).toBe(true);
    expect(result.profileCount).toBe(DEFAULT_EXPERIMENT_CONFIG.profileCount);
    expect(result.methods.map((m) => m.method)).toEqual(['A', 'B', 'C']);
    for (const m of result.methods) {
      for (const k of ['weakTopicIdentification', 'relevance', 'prerequisiteCompliance', 'pathCompletion'] as const) {
        expect(m.mean[k]).toBeGreaterThanOrEqual(0);
        expect(m.mean[k]).toBeLessThanOrEqual(1);
      }
      expect(m.mean.generationTimeMs).toBeGreaterThanOrEqual(0);
    }
    const [a, , c] = result.methods;
    expect(a.mean.prerequisiteCompliance).toBe(1);
    expect(c.mean.prerequisiteCompliance).toBe(1);
    expect(c.mean.pathCompletion).toBe(1);
  });
});
