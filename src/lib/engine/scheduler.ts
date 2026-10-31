// Deterministic study-schedule generator.
//
// Tasks (already ordered by the PBWPS learning path) are split into sessions of
// at most `maxSessionMinutes` and packed greedily, in order, into the student's
// study days, respecting a daily capacity and the examination deadline.
// Completed sessions are preserved; their minutes are deducted from the work
// still required, so regenerating never loses tracked progress.

import type { RecommendationKind, ScheduleConflict, ScheduleSettings, StudySchedule, StudySession } from '@/types';
import { addDays, daysBetween, parseISODate } from '@/lib/date';

export interface ScheduleTask {
  topicId: string;
  topicName: string;
  minutes: number;
  priority: number;
  kind: RecommendationKind;
}

export interface ScheduleInput {
  tasks: ScheduleTask[];
  settings: ScheduleSettings;
  /** First day that may receive sessions (ISO date). */
  startDate: string;
  /** Previous schedule, whose completed sessions are kept. */
  previous?: StudySchedule | null;
  generatedAt?: string;
}

/** Without an exam date the plan covers at most this many days. */
export const DEFAULT_HORIZON_DAYS = 90;
const MIN_SESSION_MINUTES = 15;

/**
 * Merges learning-path tasks (whose order must be preserved for prerequisites)
 * with revision tasks, always taking whichever head has the higher priority.
 */
export function mergeTasksByPriority(pathTasks: ScheduleTask[], reviewTasks: ScheduleTask[]): ScheduleTask[] {
  const reviews = [...reviewTasks].sort((a, b) => b.priority - a.priority);
  const merged: ScheduleTask[] = [];
  let i = 0;
  let j = 0;
  while (i < pathTasks.length || j < reviews.length) {
    if (j >= reviews.length || (i < pathTasks.length && pathTasks[i].priority >= reviews[j].priority)) merged.push(pathTasks[i++]);
    else merged.push(reviews[j++]);
  }
  return merged;
}

export function generateSchedule(input: ScheduleInput): StudySchedule {
  const { settings, startDate } = input;
  const conflicts: ScheduleConflict[] = [];
  const kept = (input.previous?.sessions ?? []).filter((s) => s.status === 'completed');
  const missedFrom = new Map<string, string>();
  for (const s of input.previous?.sessions ?? []) {
    if (s.status === 'missed' && (!missedFrom.has(s.topicId) || s.date < missedFrom.get(s.topicId)!)) missedFrom.set(s.topicId, s.date);
  }
  const doneMinutes = new Map<string, number>();
  for (const s of kept) doneMinutes.set(`${s.kind}:${s.topicId}`, (doneMinutes.get(`${s.kind}:${s.topicId}`) ?? 0) + s.minutes);

  const capacity = Math.round(Math.max(0, settings.dailyHours) * 60);
  const maxSession = Math.max(MIN_SESSION_MINUTES, settings.maxSessionMinutes);
  const studyDays = new Set(settings.studyDays.filter((d) => d >= 0 && d <= 6));

  const result = (sessions: StudySession[], unscheduled: string[]): StudySchedule => ({
    id: `schedule-${input.generatedAt ?? startDate}`,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    startDate,
    settings,
    // Stable sort by date keeps learning-path order within each day.
    sessions: [...kept, ...sessions].sort((a, b) => a.date.localeCompare(b.date)),
    conflicts,
    unscheduledTopicIds: unscheduled,
  });

  const pending = input.tasks
    .map((t) => ({ ...t, remaining: t.minutes - (doneMinutes.get(`${t.kind}:${t.topicId}`) ?? 0) }))
    .filter((t) => t.remaining > 0);

  if (studyDays.size === 0 || capacity < MIN_SESSION_MINUTES) {
    conflicts.push({
      type: 'no-study-days',
      message:
        studyDays.size === 0
          ? 'No study days are selected, so no sessions can be scheduled.'
          : `Daily study time must be at least ${MIN_SESSION_MINUTES} minutes.`,
    });
    return result([], pending.map((t) => t.topicId));
  }

  let lastDay = addDays(startDate, DEFAULT_HORIZON_DAYS - 1);
  const hasExam = Boolean(settings.examDate);
  if (hasExam) {
    if (settings.examDate <= startDate) {
      conflicts.push({ type: 'past-deadline', message: 'The examination date is today or in the past — sessions are planned without a deadline.' });
    } else {
      lastDay = addDays(settings.examDate, -1); // study up to the day before the exam
    }
  }
  const deadlineActive = hasExam && settings.examDate > startDate;

  const sessions: StudySession[] = [];
  const used = new Map<string, number>();
  let cursor = startDate;
  const advanceToStudyDay = () => {
    while (cursor <= lastDay && (!studyDays.has(parseISODate(cursor).getDay()) || (used.get(cursor) ?? 0) + MIN_SESSION_MINUTES > capacity)) {
      cursor = addDays(cursor, 1);
    }
  };

  const unscheduled: string[] = [];
  let shortfall = 0;
  for (const task of pending) {
    let remaining = task.remaining;
    let part = 0;
    while (remaining > 0) {
      advanceToStudyDay();
      if (cursor > lastDay) break;
      const free = capacity - (used.get(cursor) ?? 0);
      const minutes = Math.min(remaining, maxSession, free);
      part += 1;
      sessions.push({
        id: `ses-${cursor}-${task.kind}-${task.topicId}-${part}`,
        date: cursor,
        topicId: task.topicId,
        minutes,
        kind: task.kind,
        status: 'planned',
        ...(part === 1 && missedFrom.has(task.topicId) ? { rescheduledFrom: missedFrom.get(task.topicId) } : {}),
      });
      used.set(cursor, (used.get(cursor) ?? 0) + minutes);
      remaining -= minutes;
    }
    if (remaining > 0) {
      shortfall += remaining;
      unscheduled.push(task.topicId);
      if (deadlineActive) {
        conflicts.push({
          type: 'after-deadline',
          topicId: task.topicId,
          message: `${task.topicName} needs ${remaining} more minutes that do not fit before the exam.`,
        });
      }
    }
  }

  if (shortfall > 0) {
    const window = deadlineActive ? `before the exam (${daysBetween(startDate, settings.examDate)} days away)` : `within the ${DEFAULT_HORIZON_DAYS}-day planning horizon`;
    conflicts.unshift({
      type: 'over-capacity',
      message: `${Math.round(shortfall / 6) / 10} hours of study do not fit ${window}. Increase daily hours, add study days or move the exam date.`,
    });
  }
  return result(sessions, unscheduled);
}

/** Marks planned sessions dated before `today` as missed. Returns the same object when nothing changes. */
export function markMissedSessions(schedule: StudySchedule, today: string): StudySchedule {
  let changed = false;
  const sessions = schedule.sessions.map((s) => {
    if (s.status === 'planned' && s.date < today) {
      changed = true;
      return { ...s, status: 'missed' as const };
    }
    return s;
  });
  return changed ? { ...schedule, sessions } : schedule;
}

export interface DailyTarget {
  date: string;
  minutes: number;
  completedMinutes: number;
  sessions: StudySession[];
}

export function groupSessionsByDay(sessions: StudySession[]): DailyTarget[] {
  const days = new Map<string, DailyTarget>();
  for (const s of sessions) {
    const day = days.get(s.date) ?? { date: s.date, minutes: 0, completedMinutes: 0, sessions: [] };
    day.minutes += s.minutes;
    if (s.status === 'completed') day.completedMinutes += s.minutes;
    day.sessions.push(s);
    days.set(s.date, day);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}
