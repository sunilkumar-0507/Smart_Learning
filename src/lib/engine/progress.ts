// Progress tracking: streaks, daily activity and weekly summaries.

import type { LearningActivity } from '@/types';
import { addDays, parseISODate, toISODate } from '@/lib/date';

const activityDay = (a: LearningActivity) => toISODate(new Date(a.timestamp));

/**
 * Consecutive calendar days with at least one activity, ending today —
 * or yesterday, so a streak is not lost before the day's study has happened.
 */
export function calculateStreak(activities: LearningActivity[], today: string): number {
  const days = new Set(activities.map(activityDay));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function totalLearningMinutes(activities: LearningActivity[]): number {
  return activities.reduce((s, a) => s + Math.max(0, a.minutes), 0);
}

export interface DailyActivity {
  date: string;
  label: string;
  minutes: number;
  count: number;
}

export function computeDailyActivity(activities: LearningActivity[], days: number, today: string): DailyActivity[] {
  const buckets = new Map<string, DailyActivity>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    buckets.set(date, { date, label: parseISODate(date).toLocaleDateString(undefined, { weekday: 'short' }), minutes: 0, count: 0 });
  }
  for (const a of activities) {
    const bucket = buckets.get(activityDay(a));
    if (bucket) {
      bucket.minutes += a.minutes;
      bucket.count += 1;
    }
  }
  return [...buckets.values()];
}

export interface WeeklyProgress {
  weekStart: string;
  label: string;
  minutes: number;
  topicsCompleted: number;
  assessments: number;
}

/** Weeks start on Monday. */
export function startOfWeek(iso: string): string {
  const day = parseISODate(iso).getDay();
  return addDays(iso, -((day + 6) % 7));
}

export function computeWeeklyProgress(activities: LearningActivity[], weeks: number, today: string): WeeklyProgress[] {
  const current = startOfWeek(today);
  const buckets = new Map<string, WeeklyProgress>();
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekStart = addDays(current, -7 * i);
    buckets.set(weekStart, {
      weekStart,
      label: parseISODate(weekStart).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      minutes: 0,
      topicsCompleted: 0,
      assessments: 0,
    });
  }
  for (const a of activities) {
    const bucket = buckets.get(startOfWeek(activityDay(a)));
    if (!bucket) continue;
    bucket.minutes += a.minutes;
    if (a.type === 'topic-completed') bucket.topicsCompleted += 1;
    if (a.type === 'assessment') bucket.assessments += 1;
  }
  return [...buckets.values()];
}
