// Performance-Based Weighted Priority Scheduling (PBWPS).
//
//   P = wG·G + wD·D + wI·I + wR·R        (weights normalised so Σw = 1)
//
//   G  knowledge gap            = 100 − latest assessment score
//   D  normalised difficulty    = (level − 1) / 4 · 100
//   I  topic importance         ∈ [0, 100]
//   R  revision requirement     = 100 · (1 − e^(−Δt / S)),  S = S₀ · (0.5 + score/100)
//
// Ranking is prerequisite-aware: locked topics are never recommended ahead of
// unlocked ones, and learning paths are produced by a priority-driven
// topological sort over the prerequisite graph.
//
// Every function here is pure and independent of React.

import type {
  EngineSettings,
  PerformanceThresholds,
  PriorityFactors,
  PriorityLevel,
  PriorityWeights,
  Recommendation,
  RecommendationKind,
  TopicStatus,
} from '@/types';
import { clamp } from '@/lib/random';
import { countDependents, detectCircularDependencies, prioritizedTopologicalOrder } from './graph';

/** Algorithm-facing view of a topic, derived from application state. */
export interface TopicSignal {
  id: string;
  name: string;
  subjectId: string;
  difficulty: number;
  importance: number;
  estimatedMinutes: number;
  prerequisites: string[];
  /** Latest assessment score, or null when never assessed. */
  latestScore: number | null;
  attempts: number;
  /** ISO timestamp of the latest assessment or review. */
  lastPracticedAt: string | null;
  status: TopicStatus;
  /** Global curriculum position, used as the final deterministic tie-breaker. */
  order: number;
}

export interface EngineConfig extends EngineSettings {
  thresholds: PerformanceThresholds;
  now: Date;
}

export const DEFAULT_WEIGHTS: PriorityWeights = { gap: 0.4, difficulty: 0.25, importance: 0.2, revision: 0.15 };

// ---------------------------------------------------------------------------
// Factor calculations
// ---------------------------------------------------------------------------

/** G = 100 − score. Untested topics receive `defaultGap` (an assumed gap). */
export function calculateKnowledgeGap(score: number | null, defaultGap = 60): number {
  if (score === null || Number.isNaN(score)) return clamp(defaultGap, 0, 100);
  return clamp(100 - score, 0, 100);
}

/** Maps a difficulty level on [min, max] linearly onto [0, 100]. */
export function normalizeDifficulty(level: number, min = 1, max = 5): number {
  if (max <= min) return 0;
  return clamp(((level - min) / (max - min)) * 100, 0, 100);
}

/**
 * Exponential forgetting curve. Better-mastered topics decay more slowly:
 * stability S = S₀ · (0.5 + score/100), so a perfect score lasts 3× longer than a zero score.
 * Topics never practiced have no revision requirement (their need is captured by G).
 */
export function calculateRevisionRequirement(
  daysSincePractice: number | null,
  score: number | null,
  stabilityDays = 14,
): number {
  if (daysSincePractice === null || Number.isNaN(daysSincePractice)) return 0;
  if (stabilityDays <= 0) return 100;
  const stability = stabilityDays * (0.5 + clamp(score ?? 50, 0, 100) / 100);
  const requirement = 100 * (1 - Math.exp(-Math.max(0, daysSincePractice) / stability));
  return clamp(requirement, 0, 100);
}

/** Clamps negatives to zero and rescales so the weights sum to 1. */
export function normalizeWeights(weights: PriorityWeights): PriorityWeights {
  const w = {
    gap: Math.max(0, weights.gap || 0),
    difficulty: Math.max(0, weights.difficulty || 0),
    importance: Math.max(0, weights.importance || 0),
    revision: Math.max(0, weights.revision || 0),
  };
  const sum = w.gap + w.difficulty + w.importance + w.revision;
  if (sum === 0) return { gap: 0.25, difficulty: 0.25, importance: 0.25, revision: 0.25 };
  return { gap: w.gap / sum, difficulty: w.difficulty / sum, importance: w.importance / sum, revision: w.revision / sum };
}

/** Weighted contribution of each factor to the final priority. */
export function priorityContributions(factors: PriorityFactors, weights: PriorityWeights): PriorityFactors {
  const w = normalizeWeights(weights);
  return {
    gap: w.gap * clamp(factors.gap, 0, 100),
    difficulty: w.difficulty * clamp(factors.difficulty, 0, 100),
    importance: w.importance * clamp(factors.importance, 0, 100),
    revision: w.revision * clamp(factors.revision, 0, 100),
  };
}

/** P = Σ wᵢ·xᵢ, rounded to two decimals, always within [0, 100]. */
export function calculatePriorityScore(factors: PriorityFactors, weights: PriorityWeights = DEFAULT_WEIGHTS): number {
  const c = priorityContributions(factors, weights);
  return Math.round((c.gap + c.difficulty + c.importance + c.revision) * 100) / 100;
}

export function classifyPriority(priority: number): PriorityLevel {
  if (priority >= 80) return 'Critical';
  if (priority >= 60) return 'High';
  if (priority >= 40) return 'Medium';
  return 'Low';
}

export function computeFactors(signal: TopicSignal, config: EngineConfig): PriorityFactors {
  const days = signal.lastPracticedAt
    ? Math.max(0, (config.now.getTime() - new Date(signal.lastPracticedAt).getTime()) / 86_400_000)
    : null;
  return {
    gap: calculateKnowledgeGap(signal.latestScore, config.defaultUnassessedGap),
    difficulty: normalizeDifficulty(signal.difficulty),
    importance: clamp(signal.importance, 0, 100),
    revision: calculateRevisionRequirement(days, signal.latestScore, config.revisionStabilityDays),
  };
}

// ---------------------------------------------------------------------------
// Prerequisite validation
// ---------------------------------------------------------------------------

export function isTopicMastered(signal: TopicSignal, masteryScore: number): boolean {
  return signal.status === 'completed' || (signal.latestScore !== null && signal.latestScore >= masteryScore);
}

export interface PrerequisiteCheck {
  satisfied: boolean;
  /** Known prerequisites that are not yet mastered. */
  missing: string[];
  /** Prerequisite ids that reference topics which no longer exist (ignored). */
  unknown: string[];
}

export function validatePrerequisites(
  signal: TopicSignal,
  signalsById: Map<string, TopicSignal>,
  masteryScore: number,
): PrerequisiteCheck {
  const missing: string[] = [];
  const unknown: string[] = [];
  for (const prereqId of new Set(signal.prerequisites)) {
    const prereq = signalsById.get(prereqId);
    if (!prereq) unknown.push(prereqId);
    else if (prereqId === signal.id || !isTopicMastered(prereq, masteryScore)) missing.push(prereqId);
  }
  return { satisfied: missing.length === 0, missing, unknown };
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

interface Evaluated {
  signal: TopicSignal;
  factors: PriorityFactors;
  priority: number;
  kind: RecommendationKind;
  locked: boolean;
  missing: string[];
  inCycle: boolean;
  weak: boolean;
}

/**
 * Deterministic lexicographic ordering used for both ranking and path generation:
 * unlocked → incomplete weak topics → higher priority → higher importance →
 * shorter study time → curriculum order → id.
 */
function compareEvaluated(a: Evaluated, b: Evaluated): number {
  if (a.locked !== b.locked) return a.locked ? 1 : -1;
  const tierA = a.weak && a.kind === 'learn' ? 0 : 1;
  const tierB = b.weak && b.kind === 'learn' ? 0 : 1;
  if (tierA !== tierB) return tierA - tierB;
  if (b.priority !== a.priority) return b.priority - a.priority;
  if (b.signal.importance !== a.signal.importance) return b.signal.importance - a.signal.importance;
  if (a.signal.estimatedMinutes !== b.signal.estimatedMinutes) return a.signal.estimatedMinutes - b.signal.estimatedMinutes;
  if (a.signal.order !== b.signal.order) return a.signal.order - b.signal.order;
  return a.signal.id.localeCompare(b.signal.id);
}

const FACTOR_LABELS: Record<keyof PriorityFactors, string> = {
  gap: 'knowledge gap',
  difficulty: 'difficulty',
  importance: 'importance',
  revision: 'revision need',
};

function explain(
  e: Evaluated,
  config: EngineConfig,
  signalsById: Map<string, TopicSignal>,
  dependents: Map<string, number>,
): string[] {
  const { signal, factors } = e;
  const reasons: string[] = [];
  const name = (id: string) => signalsById.get(id)?.name ?? id;

  if (signal.latestScore === null) {
    reasons.push(`Not assessed yet — an assumed knowledge gap of ${Math.round(factors.gap)}% is used until you take the assessment.`);
  } else {
    reasons.push(`Latest score ${Math.round(signal.latestScore)}% gives a knowledge gap of ${Math.round(factors.gap)}%.`);
  }
  if (e.weak) reasons.push(`Weak topic: score is below the ${config.thresholds.developing}% "Developing" threshold, so it is scheduled first.`);
  if (e.kind === 'review') reasons.push('Already completed — recommended as a revision session.');
  if (factors.difficulty >= 75) reasons.push(`Advanced topic (difficulty ${signal.difficulty}/5) that benefits from early, spaced study.`);
  if (factors.importance >= 80) reasons.push(`High curriculum importance (${Math.round(factors.importance)}/100).`);
  if (factors.revision >= 50 && signal.lastPracticedAt) {
    const days = Math.round((config.now.getTime() - new Date(signal.lastPracticedAt).getTime()) / 86_400_000);
    reasons.push(`Due for revision: last practised ${days} day${days === 1 ? '' : 's'} ago (revision need ${Math.round(factors.revision)}%).`);
  }

  const contributions = priorityContributions(factors, config.weights);
  const top = (Object.keys(contributions) as (keyof PriorityFactors)[]).reduce((best, k) =>
    contributions[k] > contributions[best] ? k : best,
  );
  reasons.push(`Main driver: ${FACTOR_LABELS[top]} (${contributions[top].toFixed(1)} of ${e.priority.toFixed(1)} priority points).`);

  if (e.inCycle) reasons.push('Part of a circular prerequisite chain — review this topic’s prerequisites.');
  if (e.locked) reasons.push(`Locked until you master: ${e.missing.map(name).join(', ')}.`);
  else if (signal.prerequisites.length > 0 && e.kind === 'learn') reasons.push('All prerequisites are satisfied.');
  const unlocks = dependents.get(signal.id) ?? 0;
  if (unlocks > 0 && e.kind === 'learn') reasons.push(`Unlocks ${unlocks} dependent topic${unlocks === 1 ? '' : 's'}.`);
  return reasons;
}

function evaluate(signal: TopicSignal, config: EngineConfig, byId: Map<string, TopicSignal>, cycles: Set<string>): Evaluated | null {
  const factors = computeFactors(signal, config);
  const assessed = signal.latestScore !== null;
  const weakScore = assessed && signal.latestScore! < config.thresholds.developing;
  let kind: RecommendationKind = 'learn';
  if (signal.status === 'completed') {
    if (factors.revision < config.reviewThreshold && !weakScore) return null;
    kind = 'review';
  }
  const check = validatePrerequisites(signal, byId, config.prerequisiteMastery);
  const locked = kind === 'learn' && !check.satisfied;
  return {
    signal,
    factors,
    priority: calculatePriorityScore(factors, config.weights),
    kind,
    locked,
    missing: locked ? check.missing : [],
    inCycle: cycles.has(signal.id),
    weak: weakScore,
  };
}

function toRecommendation(e: Evaluated, rank: number, reasons: string[]): Recommendation {
  return {
    topicId: e.signal.id,
    rank,
    priority: e.priority,
    level: classifyPriority(e.priority),
    factors: e.factors,
    kind: e.kind,
    locked: e.locked,
    missingPrerequisites: e.missing,
    inCycle: e.inCycle,
    weak: e.weak,
    assessed: e.signal.latestScore !== null,
    reasons,
  };
}

export interface RankingResult {
  /** Unlocked recommendations in rank order (what the student should do next). */
  recommendations: Recommendation[];
  /** Topics that need work but are blocked by prerequisites. */
  locked: Recommendation[];
  cycleTopicIds: string[];
}

/** Scores, validates and ranks every topic that still needs learning or revision. */
export function rankRecommendations(signals: TopicSignal[], config: EngineConfig): RankingResult {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const cycles = detectCircularDependencies(signals);
  const dependents = countDependents(signals);

  const evaluated = signals
    .map((s) => evaluate(s, config, byId, cycles))
    .filter((e): e is Evaluated => e !== null)
    .sort(compareEvaluated);

  const all = evaluated.map((e, i) => toRecommendation(e, i + 1, explain(e, config, byId, dependents)));
  return {
    recommendations: all.filter((r) => !r.locked),
    locked: all.filter((r) => r.locked),
    cycleTopicIds: [...cycles],
  };
}

// ---------------------------------------------------------------------------
// Learning path generation
// ---------------------------------------------------------------------------

export interface LearningPathStep {
  topicId: string;
  position: number;
  priority: number;
  level: PriorityLevel;
  factors: PriorityFactors;
  estimatedMinutes: number;
  cumulativeMinutes: number;
  /** True when the topic can be started right now. */
  availableNow: boolean;
  /** Prerequisites that must be completed earlier in the path. */
  waitingFor: string[];
  weak: boolean;
  status: TopicStatus;
  /** True if the topic could not be ordered because of a prerequisite cycle. */
  blockedByCycle: boolean;
  reasons: string[];
}

/**
 * Generates an ordered learning sequence over all incomplete topics.
 * A topic only appears after every not-yet-mastered prerequisite; among the
 * topics available at each step, the highest-ranked (per PBWPS) is chosen.
 */
export function generateLearningPath(signals: TopicSignal[], config: EngineConfig): LearningPathStep[] {
  const byId = new Map(signals.map((s) => [s.id, s]));
  const cycles = detectCircularDependencies(signals);
  const dependents = countDependents(signals);

  const pending = signals.filter((s) => s.status !== 'completed');
  const evaluated = new Map<string, Evaluated>();
  for (const s of pending) {
    const e = evaluate(s, config, byId, cycles)!;
    evaluated.set(s.id, e);
  }

  // Graph over pending topics; mastered prerequisites impose no ordering constraint.
  const nodes = pending.map((s) => ({
    id: s.id,
    prerequisites: validatePrerequisites(s, byId, config.prerequisiteMastery).missing,
    e: evaluated.get(s.id)!,
  }));
  // Within the path, compare as if unlocked so that ordering is driven by priority.
  const compare = (a: (typeof nodes)[number], b: (typeof nodes)[number]) =>
    compareEvaluated({ ...a.e, locked: false }, { ...b.e, locked: false });
  const { order, blocked } = prioritizedTopologicalOrder(nodes, compare);

  let cumulative = 0;
  const steps: LearningPathStep[] = [];
  const emit = (id: string, blockedByCycle: boolean) => {
    const e = evaluated.get(id)!;
    cumulative += e.signal.estimatedMinutes;
    steps.push({
      topicId: id,
      position: steps.length + 1,
      priority: e.priority,
      level: classifyPriority(e.priority),
      factors: e.factors,
      estimatedMinutes: e.signal.estimatedMinutes,
      cumulativeMinutes: cumulative,
      availableNow: !e.locked,
      waitingFor: e.missing,
      weak: e.weak,
      status: e.signal.status,
      blockedByCycle,
      reasons: explain(e, config, byId, dependents),
    });
  };
  order.forEach((id) => emit(id, false));
  blocked.forEach((id) => emit(id, true));
  return steps;
}
