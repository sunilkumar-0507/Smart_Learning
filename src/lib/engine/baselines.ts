// Baseline recommendation strategies used for the experimental comparison.
//
// Method A — Equal Priority: every eligible (unlocked, incomplete) topic gets the
//            same priority; ties are broken by curriculum order.
// Method B — Performance-Based: incomplete topics are ranked by knowledge gap only,
//            with no awareness of prerequisites.
// Method C — PBWPS (see pbwps.ts).

import { prioritizedTopologicalOrder } from './graph';
import {
  calculateKnowledgeGap,
  generateLearningPath,
  rankRecommendations,
  validatePrerequisites,
  type EngineConfig,
  type TopicSignal,
} from './pbwps';

export type MethodId = 'A' | 'B' | 'C';

export interface MethodOutput {
  method: MethodId;
  /** Ranked recommendation list (topic ids). */
  ranking: string[];
  /** Full learning sequence over all incomplete topics (topic ids). */
  sequence: string[];
}

export const METHOD_NAMES: Record<MethodId, string> = {
  A: 'Equal Priority',
  B: 'Performance-Based',
  C: 'PBWPS (proposed)',
};

const byOrder = (a: TopicSignal, b: TopicSignal) => a.order - b.order || a.id.localeCompare(b.id);

export function equalPriorityMethod(signals: TopicSignal[], config: EngineConfig): MethodOutput {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const incomplete = signals.filter((s) => s.status !== 'completed');
  const ranking = incomplete
    .filter((s) => validatePrerequisites(s, byId, config.prerequisiteMastery).satisfied)
    .sort(byOrder)
    .map((s) => s.id);
  const nodes = incomplete.map((s) => ({
    ...s,
    prerequisites: validatePrerequisites(s, byId, config.prerequisiteMastery).missing,
  }));
  const { order, blocked } = prioritizedTopologicalOrder(nodes, byOrder);
  return { method: 'A', ranking, sequence: [...order, ...blocked] };
}

export function performanceBasedMethod(signals: TopicSignal[], config: EngineConfig): MethodOutput {
  const gap = (s: TopicSignal) => calculateKnowledgeGap(s.latestScore, config.defaultUnassessedGap);
  const ranking = signals
    .filter((s) => s.status !== 'completed')
    .sort((a, b) => gap(b) - gap(a) || byOrder(a, b))
    .map((s) => s.id);
  return { method: 'B', ranking, sequence: ranking };
}

export function pbwpsMethod(signals: TopicSignal[], config: EngineConfig): MethodOutput {
  const ranking = rankRecommendations(signals, config)
    .recommendations.filter((r) => r.kind === 'learn')
    .map((r) => r.topicId);
  const sequence = generateLearningPath(signals, config).map((s) => s.topicId);
  return { method: 'C', ranking, sequence };
}

export function runMethod(method: MethodId, signals: TopicSignal[], config: EngineConfig): MethodOutput {
  if (method === 'A') return equalPriorityMethod(signals, config);
  if (method === 'B') return performanceBasedMethod(signals, config);
  return pbwpsMethod(signals, config);
}
