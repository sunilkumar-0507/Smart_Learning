import { describe, expect, it } from 'vitest';
import {
  calculateKnowledgeGap,
  calculatePriorityScore,
  calculateRevisionRequirement,
  classifyPriority,
  DEFAULT_WEIGHTS,
  generateLearningPath,
  normalizeDifficulty,
  normalizeWeights,
  rankRecommendations,
  validatePrerequisites,
  type EngineConfig,
  type TopicSignal,
} from './pbwps';
import { detectCircularDependencies, prioritizedTopologicalOrder, wouldCreateCycle } from './graph';

const NOW = new Date('2026-03-01T12:00:00.000Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();

const config: EngineConfig = {
  weights: { ...DEFAULT_WEIGHTS },
  defaultUnassessedGap: 60,
  prerequisiteMastery: 60,
  revisionStabilityDays: 14,
  reviewThreshold: 60,
  thresholds: { developing: 40, good: 60, excellent: 80 },
  now: NOW,
};

let order = 0;
function signal(id: string, overrides: Partial<TopicSignal> = {}): TopicSignal {
  order += 1;
  return {
    id,
    name: id.toUpperCase(),
    subjectId: 's',
    difficulty: 3,
    importance: 50,
    estimatedMinutes: 60,
    prerequisites: [],
    latestScore: null,
    attempts: 0,
    lastPracticedAt: null,
    status: 'not-started',
    order,
    ...overrides,
  };
}

describe('knowledge gap', () => {
  it('is 100 minus the score', () => {
    expect(calculateKnowledgeGap(72)).toBe(28);
  });
  it('is 100 for a zero score and 0 for a perfect score', () => {
    expect(calculateKnowledgeGap(0)).toBe(100);
    expect(calculateKnowledgeGap(100)).toBe(0);
  });
  it('uses the assumed default gap when there is no assessment history', () => {
    expect(calculateKnowledgeGap(null)).toBe(60);
    expect(calculateKnowledgeGap(null, 85)).toBe(85);
  });
  it('clamps out-of-range scores', () => {
    expect(calculateKnowledgeGap(130)).toBe(0);
    expect(calculateKnowledgeGap(-20)).toBe(100);
  });
});

describe('difficulty normalisation', () => {
  it('maps 1..5 linearly onto 0..100', () => {
    expect([1, 2, 3, 4, 5].map((d) => normalizeDifficulty(d))).toEqual([0, 25, 50, 75, 100]);
  });
  it('supports custom ranges and clamps', () => {
    expect(normalizeDifficulty(5, 0, 10)).toBe(50);
    expect(normalizeDifficulty(9)).toBe(100);
    expect(normalizeDifficulty(3, 5, 5)).toBe(0);
  });
});

describe('revision requirement', () => {
  it('is zero for never-practised topics and right after practice', () => {
    expect(calculateRevisionRequirement(null, null)).toBe(0);
    expect(calculateRevisionRequirement(0, 80)).toBe(0);
  });
  it('grows with time and stays within 0..100', () => {
    const values = [1, 7, 14, 30, 365].map((d) => calculateRevisionRequirement(d, 60, 14));
    for (let i = 1; i < values.length; i += 1) expect(values[i]).toBeGreaterThan(values[i - 1]);
    expect(values[values.length - 1]).toBeLessThanOrEqual(100);
  });
  it('decays more slowly for better-mastered topics', () => {
    expect(calculateRevisionRequirement(10, 100)).toBeLessThan(calculateRevisionRequirement(10, 20));
  });
  it('matches the forgetting-curve formula', () => {
    // S = 14 · (0.5 + 0.5) = 14, R = 100(1 − e^(−14/14))
    expect(calculateRevisionRequirement(14, 50, 14)).toBeCloseTo(100 * (1 - Math.exp(-1)), 6);
  });
});

describe('priority score', () => {
  it('applies P = 0.40G + 0.25D + 0.20I + 0.15R', () => {
    const p = calculatePriorityScore({ gap: 80, difficulty: 50, importance: 90, revision: 20 });
    expect(p).toBeCloseTo(0.4 * 80 + 0.25 * 50 + 0.2 * 90 + 0.15 * 20, 6);
  });
  it('is 0 for all-zero factors and 100 for all-100 factors', () => {
    expect(calculatePriorityScore({ gap: 0, difficulty: 0, importance: 0, revision: 0 })).toBe(0);
    expect(calculatePriorityScore({ gap: 100, difficulty: 100, importance: 100, revision: 100 })).toBe(100);
  });
  it('normalises configurable weights to sum to 1', () => {
    const w = normalizeWeights({ gap: 2, difficulty: 1, importance: 1, revision: 0 });
    expect(w.gap + w.difficulty + w.importance + w.revision).toBeCloseTo(1);
    expect(w.gap).toBeCloseTo(0.5);
    expect(normalizeWeights({ gap: 0, difficulty: 0, importance: 0, revision: 0 }).gap).toBe(0.25);
    expect(normalizeWeights({ gap: -1, difficulty: 1, importance: 0, revision: 0 }).difficulty).toBe(1);
  });
  it('changes when the weights change', () => {
    const f = { gap: 100, difficulty: 0, importance: 0, revision: 0 };
    expect(calculatePriorityScore(f, { gap: 1, difficulty: 0, importance: 0, revision: 0 })).toBe(100);
    expect(calculatePriorityScore(f, { gap: 0, difficulty: 1, importance: 0, revision: 0 })).toBe(0);
  });
  it('classifies priority levels', () => {
    expect(classifyPriority(80)).toBe('Critical');
    expect(classifyPriority(79.99)).toBe('High');
    expect(classifyPriority(60)).toBe('High');
    expect(classifyPriority(40)).toBe('Medium');
    expect(classifyPriority(39.9)).toBe('Low');
  });
});

describe('prerequisite validation', () => {
  it('is satisfied by completed or mastered prerequisites', () => {
    const a = signal('a', { status: 'completed' });
    const b = signal('b', { latestScore: 80 });
    const c = signal('c', { prerequisites: ['a', 'b'] });
    const byId = new Map([a, b, c].map((s) => [s.id, s]));
    expect(validatePrerequisites(c, byId, 60)).toEqual({ satisfied: true, missing: [], unknown: [] });
  });
  it('reports missing prerequisites', () => {
    const a = signal('a', { latestScore: 40 });
    const c = signal('c', { prerequisites: ['a'] });
    const byId = new Map([a, c].map((s) => [s.id, s]));
    expect(validatePrerequisites(c, byId, 60)).toMatchObject({ satisfied: false, missing: ['a'] });
  });
  it('ignores prerequisites that reference deleted topics', () => {
    const c = signal('c', { prerequisites: ['ghost'] });
    expect(validatePrerequisites(c, new Map([[c.id, c]]), 60)).toEqual({ satisfied: true, missing: [], unknown: ['ghost'] });
  });
});

describe('graph utilities', () => {
  it('detects circular dependencies including self references', () => {
    const cycles = detectCircularDependencies([
      { id: 'a', prerequisites: ['c'] },
      { id: 'b', prerequisites: ['a'] },
      { id: 'c', prerequisites: ['b'] },
      { id: 'd', prerequisites: ['a'] },
      { id: 'e', prerequisites: ['e'] },
    ]);
    expect([...cycles].sort()).toEqual(['a', 'b', 'c', 'e']);
  });
  it('finds no cycles in a DAG', () => {
    expect(detectCircularDependencies([{ id: 'a', prerequisites: [] }, { id: 'b', prerequisites: ['a'] }]).size).toBe(0);
  });
  it('predicts whether a new prerequisite would create a cycle', () => {
    const nodes = [
      { id: 'a', prerequisites: [] },
      { id: 'b', prerequisites: ['a'] },
    ];
    expect(wouldCreateCycle(nodes, 'a', 'b')).toBe(true);
    expect(wouldCreateCycle(nodes, 'b', 'a')).toBe(false);
    expect(wouldCreateCycle(nodes, 'a', 'a')).toBe(true);
  });
  it('orders by priority while respecting dependencies', () => {
    const nodes = [
      { id: 'low', prerequisites: [], p: 1 },
      { id: 'high', prerequisites: ['low'], p: 9 },
      { id: 'mid', prerequisites: [], p: 5 },
    ];
    const { order: result } = prioritizedTopologicalOrder(nodes, (a, b) => b.p - a.p);
    expect(result).toEqual(['mid', 'low', 'high']);
  });
});

describe('recommendation ranking', () => {
  it('handles a student without any assessment history', () => {
    const signals = [signal('a'), signal('b', { importance: 90 })];
    const { recommendations } = rankRecommendations(signals, config);
    expect(recommendations).toHaveLength(2);
    expect(recommendations.every((r) => !r.assessed && r.factors.gap === 60)).toBe(true);
    expect(recommendations[0].topicId).toBe('b');
    expect(recommendations[0].reasons[0]).toMatch(/Not assessed yet/);
  });

  it('never recommends locked topics ahead of unlocked ones', () => {
    const signals = [
      signal('base', { latestScore: 90, importance: 10, difficulty: 1 }),
      signal('advanced', { prerequisites: ['missing-mastery'], importance: 100, difficulty: 5, latestScore: 0 }),
      signal('missing-mastery', { latestScore: 50 }),
    ];
    const { recommendations, locked } = rankRecommendations(signals, config);
    expect(recommendations.map((r) => r.topicId)).not.toContain('advanced');
    expect(locked.map((r) => r.topicId)).toEqual(['advanced']);
    expect(locked[0].missingPrerequisites).toEqual(['missing-mastery']);
    expect(locked[0].rank).toBeGreaterThan(Math.max(...recommendations.map((r) => r.rank)));
  });

  it('prioritises incomplete weak topics over higher-priority untested ones', () => {
    const signals = [signal('untested', { importance: 100, difficulty: 5 }), signal('weak', { latestScore: 20, importance: 0, difficulty: 1, lastPracticedAt: daysAgo(0) })];
    const { recommendations } = rankRecommendations(signals, config);
    expect(recommendations[0].topicId).toBe('weak');
    expect(recommendations[0].weak).toBe(true);
  });

  it('gives zero-score topics maximum gap and excludes perfectly mastered completed topics', () => {
    const signals = [signal('zero', { latestScore: 0, lastPracticedAt: daysAgo(1) }), signal('perfect', { latestScore: 100, status: 'completed', lastPracticedAt: daysAgo(1) })];
    const { recommendations } = rankRecommendations(signals, config);
    expect(recommendations.map((r) => r.topicId)).toEqual(['zero']);
    expect(recommendations[0].factors.gap).toBe(100);
  });

  it('suggests completed topics for revision when the revision need is high', () => {
    const signals = [signal('old', { latestScore: 70, status: 'completed', lastPracticedAt: daysAgo(60) })];
    const { recommendations } = rankRecommendations(signals, config);
    expect(recommendations[0]).toMatchObject({ topicId: 'old', kind: 'review' });
  });

  it('breaks ties deterministically when priorities are equal', () => {
    const signals = [signal('t2', { estimatedMinutes: 30 }), signal('t1', { estimatedMinutes: 30 }), signal('t3', { estimatedMinutes: 90 })];
    const first = rankRecommendations(signals, config).recommendations.map((r) => r.topicId);
    const second = rankRecommendations([...signals].reverse(), config).recommendations.map((r) => r.topicId);
    // Equal priority & importance → shorter time first, then curriculum order.
    expect(first).toEqual(['t2', 't1', 't3']);
    expect(second).toEqual(first);
    expect(new Set(rankRecommendations(signals, config).recommendations.map((r) => r.priority)).size).toBe(1);
  });

  it('re-ranks when the weights change', () => {
    const signals = [signal('gap', { latestScore: 0, importance: 0, lastPracticedAt: daysAgo(0) }), signal('important', { latestScore: 50, importance: 100, lastPracticedAt: daysAgo(0) })];
    const gapHeavy = rankRecommendations(signals, { ...config, weights: { gap: 1, difficulty: 0, importance: 0, revision: 0 }, thresholds: { developing: 0, good: 60, excellent: 80 } });
    const importanceHeavy = rankRecommendations(signals, { ...config, weights: { gap: 0, difficulty: 0, importance: 1, revision: 0 }, thresholds: { developing: 0, good: 60, excellent: 80 } });
    expect(gapHeavy.recommendations[0].topicId).toBe('gap');
    expect(importanceHeavy.recommendations[0].topicId).toBe('important');
  });

  it('explains every recommendation', () => {
    const signals = [signal('a', { latestScore: 30, lastPracticedAt: daysAgo(20), importance: 95, difficulty: 5 })];
    const [rec] = rankRecommendations(signals, config).recommendations;
    expect(rec.reasons.join(' ')).toMatch(/knowledge gap of 70%/);
    expect(rec.reasons.join(' ')).toMatch(/Main driver/);
    expect(rec.reasons.join(' ')).toMatch(/importance/);
  });

  it('handles an empty curriculum', () => {
    expect(rankRecommendations([], config)).toEqual({ recommendations: [], locked: [], cycleTopicIds: [] });
    expect(generateLearningPath([], config)).toEqual([]);
  });
});

describe('learning path generation', () => {
  it('places prerequisites before dependants and covers every incomplete topic', () => {
    const signals = [
      signal('vars', { latestScore: 40 }),
      signal('funcs', { prerequisites: ['vars'], importance: 100, latestScore: 0 }),
      signal('dom', { prerequisites: ['funcs'] }),
      signal('html', { status: 'completed', latestScore: 90 }),
    ];
    const path = generateLearningPath(signals, config);
    const ids = path.map((s) => s.topicId);
    expect(ids).toEqual(['vars', 'funcs', 'dom']);
    expect(path[0].availableNow).toBe(true);
    expect(path[1]).toMatchObject({ availableNow: false, waitingFor: ['vars'] });
    expect(path[2].cumulativeMinutes).toBe(180);
  });

  it('chooses the highest-priority available topic at each step', () => {
    const signals = [signal('a', { latestScore: 80, lastPracticedAt: daysAgo(0) }), signal('b', { latestScore: 10, lastPracticedAt: daysAgo(0) })];
    expect(generateLearningPath(signals, config).map((s) => s.topicId)).toEqual(['b', 'a']);
  });

  it('appends topics blocked by a circular dependency instead of failing', () => {
    const signals = [signal('free'), signal('x', { prerequisites: ['y'] }), signal('y', { prerequisites: ['x'] })];
    const path = generateLearningPath(signals, config);
    expect(path.map((s) => s.topicId)[0]).toBe('free');
    expect(path.filter((s) => s.blockedByCycle).map((s) => s.topicId).sort()).toEqual(['x', 'y']);
    expect(rankRecommendations(signals, config).cycleTopicIds.sort()).toEqual(['x', 'y']);
  });

  it('treats prerequisites mastered by score as satisfied', () => {
    const signals = [signal('a', { latestScore: 80 }), signal('b', { prerequisites: ['a'] })];
    const path = generateLearningPath(signals, config);
    expect(path.find((s) => s.topicId === 'b')!.availableNow).toBe(true);
  });
});
