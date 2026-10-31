// JSON backup / restore and CSV reporting.

import type { AppData } from '@/types';
import { latestResultsByTopic } from '@/lib/engine/signals';
import { migrate } from './storage';
import { validateAppData, type ValidationResult } from './validation';

export const EXPORT_FORMAT = 'smart-learning-path-backup';

export function serializeExport(data: AppData, exportedAt: Date = new Date()): string {
  return JSON.stringify({ format: EXPORT_FORMAT, exportedAt: exportedAt.toISOString(), data }, null, 2);
}

/** Accepts either a backup envelope or a raw AppData object. */
export function parseImport(text: string): ValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['The file is not valid JSON.'] };
  }
  const payload =
    typeof parsed === 'object' && parsed !== null && 'format' in parsed
      ? (parsed as { format: unknown; data?: unknown }).format === EXPORT_FORMAT
        ? (parsed as { data?: unknown }).data
        : undefined
      : parsed;
  if (payload === undefined) return { ok: false, errors: ['The file is not a Smart Learning Path backup.'] };
  try {
    return validateAppData(migrate(payload));
  } catch (err) {
    return { ok: false, errors: [err instanceof Error ? err.message : 'The backup could not be migrated.'] };
  }
}

export function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  return [header, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\r\n');
}

/** One row per topic: curriculum metadata, status and performance. */
export function topicsToCsv(data: AppData): string {
  const subjectName = new Map(data.subjects.map((s) => [s.id, s.name]));
  const topicName = new Map(data.topics.map((t) => [t.id, t.name]));
  const latest = latestResultsByTopic(data.results);
  const rows = data.topics.map((t) => {
    const attempts = data.results.filter((r) => r.topicId === t.id);
    return [
      subjectName.get(t.subjectId),
      t.name,
      t.difficulty,
      t.importance,
      t.estimatedMinutes,
      t.prerequisites.map((p) => topicName.get(p) ?? p).join('; '),
      data.progress[t.id]?.status ?? 'not-started',
      attempts.length,
      latest.get(t.id)?.score ?? '',
      attempts.length ? Math.max(...attempts.map((r) => r.score)) : '',
    ];
  });
  return toCsv(
    ['Subject', 'Topic', 'Difficulty (1-5)', 'Importance', 'Estimated minutes', 'Prerequisites', 'Status', 'Attempts', 'Latest score', 'Best score'],
    rows,
  );
}

/** One row per assessment attempt, oldest first. */
export function resultsToCsv(data: AppData): string {
  const subjectName = new Map(data.subjects.map((s) => [s.id, s.name]));
  const topicName = new Map(data.topics.map((t) => [t.id, t.name]));
  const rows = [...data.results]
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .map((r) => [r.completedAt, subjectName.get(r.subjectId) ?? r.subjectId, topicName.get(r.topicId) ?? r.topicId, r.score, r.correctCount, r.totalQuestions, r.durationSeconds]);
  return toCsv(['Completed at', 'Subject', 'Topic', 'Score (%)', 'Correct', 'Questions', 'Duration (s)'], rows);
}

/** Triggers a browser download of a text file. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
