// Runtime validation of persisted / imported application data.

import type { AppData, AppSettings } from '@/types';
import { defaultSettings } from '@/data/seed';

export type ValidationResult = { ok: true; data: AppData } | { ok: false; errors: string[] };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function check(errors: string[], condition: boolean, message: string) {
  if (!condition && errors.length < 25) errors.push(message);
}

/** Fills missing settings with defaults so older or partial files still load. */
export function mergeSettings(value: unknown): AppSettings {
  const d = defaultSettings();
  if (!isObject(value)) return d;
  const engine = isObject(value.engine) ? value.engine : {};
  const weights = isObject(engine.weights) ? engine.weights : {};
  const thresholds = isObject(value.thresholds) ? value.thresholds : {};
  const schedule = isObject(value.schedule) ? value.schedule : {};
  const num = (v: unknown, fallback: number) => (isNumber(v) ? v : fallback);
  return {
    engine: {
      weights: {
        gap: num(weights.gap, d.engine.weights.gap),
        difficulty: num(weights.difficulty, d.engine.weights.difficulty),
        importance: num(weights.importance, d.engine.weights.importance),
        revision: num(weights.revision, d.engine.weights.revision),
      },
      defaultUnassessedGap: num(engine.defaultUnassessedGap, d.engine.defaultUnassessedGap),
      prerequisiteMastery: num(engine.prerequisiteMastery, d.engine.prerequisiteMastery),
      revisionStabilityDays: num(engine.revisionStabilityDays, d.engine.revisionStabilityDays),
      reviewThreshold: num(engine.reviewThreshold, d.engine.reviewThreshold),
    },
    thresholds: {
      developing: num(thresholds.developing, d.thresholds.developing),
      good: num(thresholds.good, d.thresholds.good),
      excellent: num(thresholds.excellent, d.thresholds.excellent),
    },
    schedule: {
      dailyHours: num(schedule.dailyHours, d.schedule.dailyHours),
      studyDays: Array.isArray(schedule.studyDays) ? schedule.studyDays.filter((x): x is number => isNumber(x) && x >= 0 && x <= 6) : d.schedule.studyDays,
      examDate: isString(schedule.examDate) ? schedule.examDate : d.schedule.examDate,
      maxSessionMinutes: num(schedule.maxSessionMinutes, d.schedule.maxSessionMinutes),
    },
  };
}

export function validateAppData(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return { ok: false, errors: ['Data must be a JSON object.'] };

  check(errors, isNumber(value.version), 'Missing numeric "version".');
  check(errors, value.profile === null || isObject(value.profile), '"profile" must be an object or null.');
  if (isObject(value.profile)) {
    check(errors, isString(value.profile.id) && isString(value.profile.name), 'Profile must have an id and a name.');
  }

  const arrays = ['subjects', 'topics', 'resources', 'results', 'activities', 'completedResourceIds'] as const;
  for (const key of arrays) check(errors, Array.isArray(value[key]), `"${key}" must be an array.`);
  check(errors, isObject(value.progress), '"progress" must be an object.');
  if (errors.length > 0) return { ok: false, errors };

  const subjects = value.subjects as unknown[];
  const subjectIds = new Set<string>();
  subjects.forEach((s, i) => {
    check(errors, isObject(s) && isString(s.id) && isString(s.name), `Subject #${i + 1} needs an id and a name.`);
    if (isObject(s) && isString(s.id)) {
      check(errors, !subjectIds.has(s.id), `Duplicate subject id "${s.id}".`);
      subjectIds.add(s.id);
    }
  });

  const topicIds = new Set<string>();
  (value.topics as unknown[]).forEach((t, i) => {
    const label = `Topic #${i + 1}`;
    if (!isObject(t)) return check(errors, false, `${label} must be an object.`);
    check(errors, isString(t.id) && isString(t.name), `${label} needs an id and a name.`);
    check(errors, isString(t.subjectId) && subjectIds.has(t.subjectId), `${label} references an unknown subject.`);
    check(errors, isNumber(t.difficulty) && t.difficulty >= 1 && t.difficulty <= 5, `${label} difficulty must be 1–5.`);
    check(errors, isNumber(t.importance) && t.importance >= 0 && t.importance <= 100, `${label} importance must be 0–100.`);
    check(errors, isNumber(t.estimatedMinutes) && t.estimatedMinutes > 0, `${label} needs a positive estimated time.`);
    check(errors, Array.isArray(t.prerequisites) && t.prerequisites.every(isString), `${label} prerequisites must be a list of ids.`);
    check(errors, Array.isArray(t.questions), `${label} questions must be an array.`);
    if (Array.isArray(t.questions)) {
      t.questions.forEach((q, qi) => {
        check(
          errors,
          isObject(q) && isString(q.id) && isString(q.text) && Array.isArray(q.options) && q.options.length === 4 && isNumber(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3,
          `${label}, question #${qi + 1} must have text, four options and a correct index 0–3.`,
        );
      });
    }
    if (isString(t.id)) topicIds.add(t.id);
  });

  (value.results as unknown[]).forEach((r, i) => {
    check(
      errors,
      isObject(r) && isString(r.id) && isString(r.topicId) && isNumber(r.score) && r.score >= 0 && r.score <= 100 && isString(r.completedAt),
      `Assessment result #${i + 1} is invalid (needs id, topicId, score 0–100 and completedAt).`,
    );
  });
  (value.activities as unknown[]).forEach((a, i) => {
    check(errors, isObject(a) && isString(a.id) && isString(a.type) && isString(a.timestamp) && isNumber(a.minutes), `Activity #${i + 1} is invalid.`);
  });

  if (errors.length > 0) return { ok: false, errors };
  const data = { ...(value as unknown as AppData), settings: mergeSettings(value.settings), schedule: isObject(value.schedule) ? (value.schedule as unknown as AppData['schedule']) : null };
  // Drop results that point to deleted topics so analytics stay consistent.
  data.results = data.results.filter((r) => topicIds.has(r.topicId));
  return { ok: true, data };
}
