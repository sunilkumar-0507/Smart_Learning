import { describe, expect, it } from 'vitest';
import { generateSchedule, groupSessionsByDay, markMissedSessions, mergeTasksByPriority, type ScheduleTask } from './scheduler';
import { calculateStreak, computeWeeklyProgress, startOfWeek } from './progress';
import { parseISODate } from '@/lib/date';
import type { LearningActivity, ScheduleSettings } from '@/types';

// 2026-03-02 is a Monday.
const START = '2026-03-02';
const settings: ScheduleSettings = { dailyHours: 2, studyDays: [1, 2, 3, 4, 5], examDate: '', maxSessionMinutes: 60 };
const task = (topicId: string, minutes: number, priority = 50, kind: 'learn' | 'review' = 'learn'): ScheduleTask => ({ topicId, topicName: topicId, minutes, priority, kind });

describe('schedule generation', () => {
  it('splits tasks into sessions within daily capacity and study days only', () => {
    const s = generateSchedule({ tasks: [task('a', 150), task('b', 120)], settings, startDate: START, generatedAt: 'fixed' });
    const days = groupSessionsByDay(s.sessions);
    expect(days.every((d) => d.minutes <= 120)).toBe(true);
    expect(s.sessions.every((x) => x.minutes <= 60)).toBe(true);
    expect(s.sessions.every((x) => [1, 2, 3, 4, 5].includes(parseISODate(x.date).getDay()))).toBe(true);
    expect(s.sessions.reduce((m, x) => m + x.minutes, 0)).toBe(270);
    expect(s.conflicts).toEqual([]);
    // Order is preserved: all of "a" is scheduled before "b" starts.
    const lastA = Math.max(...s.sessions.filter((x) => x.topicId === 'a').map((x) => s.sessions.indexOf(x)));
    const firstB = Math.min(...s.sessions.filter((x) => x.topicId === 'b').map((x) => s.sessions.indexOf(x)));
    expect(lastA).toBeLessThan(firstB);
  });

  it('keeps learning-path order within a single day', () => {
    const s = generateSchedule({ tasks: [task('zeta', 30), task('alpha', 30)], settings, startDate: START, generatedAt: 'x' });
    expect(s.sessions.map((x) => x.topicId)).toEqual(['zeta', 'alpha']);
    expect(s.sessions[0].date).toBe(s.sessions[1].date);
  });

  it('is deterministic', () => {
    const input = { tasks: [task('a', 200), task('b', 45)], settings, startDate: START, generatedAt: 'fixed' };
    expect(generateSchedule(input)).toEqual(generateSchedule(input));
  });

  it('skips weekends when they are not study days', () => {
    const s = generateSchedule({ tasks: [task('a', 600)], settings, startDate: '2026-03-07', generatedAt: 'x' }); // Saturday
    expect(s.sessions[0].date).toBe('2026-03-09'); // next Monday
  });

  it('detects an exam deadline conflict when work does not fit', () => {
    const s = generateSchedule({ tasks: [task('a', 120), task('b', 240)], settings: { ...settings, examDate: '2026-03-04' }, startDate: START, generatedAt: 'x' });
    // Only Mon + Tue (2 × 120 min) are available before Wednesday's exam.
    expect(s.sessions.every((x) => x.date < '2026-03-04')).toBe(true);
    expect(s.conflicts.map((c) => c.type)).toContain('over-capacity');
    expect(s.conflicts.some((c) => c.type === 'after-deadline' && c.topicId === 'b')).toBe(true);
    expect(s.unscheduledTopicIds).toEqual(['b']);
  });

  it('reports a conflict when no study days are selected', () => {
    const s = generateSchedule({ tasks: [task('a', 60)], settings: { ...settings, studyDays: [] }, startDate: START, generatedAt: 'x' });
    expect(s.sessions).toHaveLength(0);
    expect(s.conflicts[0].type).toBe('no-study-days');
  });

  it('flags an exam date in the past', () => {
    const s = generateSchedule({ tasks: [task('a', 60)], settings: { ...settings, examDate: '2026-01-01' }, startDate: START, generatedAt: 'x' });
    expect(s.conflicts[0].type).toBe('past-deadline');
    expect(s.sessions).toHaveLength(1);
  });

  it('regenerates when availability changes', () => {
    const tasks = [task('a', 240)];
    const two = generateSchedule({ tasks, settings, startDate: START, generatedAt: 'x' });
    const four = generateSchedule({ tasks, settings: { ...settings, dailyHours: 4 }, startDate: START, generatedAt: 'x' });
    expect(new Set(two.sessions.map((x) => x.date)).size).toBe(2);
    expect(new Set(four.sessions.map((x) => x.date)).size).toBe(1);
  });

  it('keeps completed sessions and reschedules missed work', () => {
    const first = generateSchedule({ tasks: [task('a', 120), task('b', 60)], settings: { ...settings, dailyHours: 1 }, startDate: START, generatedAt: 'x' });
    const done = { ...first, sessions: first.sessions.map((x, i) => (i === 0 ? { ...x, status: 'completed' as const } : x)) };
    const missed = markMissedSessions(done, '2026-03-04');
    expect(missed.sessions[1].status).toBe('missed');
    expect(missed.sessions[2].status).toBe('planned');
    expect(markMissedSessions(missed, '2026-03-04')).toBe(missed);

    const next = generateSchedule({ tasks: [task('a', 120), task('b', 60)], settings: { ...settings, dailyHours: 1 }, startDate: '2026-03-04', previous: missed, generatedAt: 'y' });
    expect(next.sessions.filter((x) => x.status === 'completed')).toHaveLength(1);
    const futureA = next.sessions.filter((x) => x.topicId === 'a' && x.status === 'planned');
    expect(futureA.reduce((m, x) => m + x.minutes, 0)).toBe(60);
    expect(futureA[0].rescheduledFrom).toBe('2026-03-03');
    expect(futureA[0].date).toBe('2026-03-04');
  });

  it('merges review tasks by priority without reordering the learning path', () => {
    const merged = mergeTasksByPriority([task('p1', 10, 50), task('p2', 10, 90)], [task('r1', 10, 70, 'review'), task('r2', 10, 20, 'review')]);
    expect(merged.map((t) => t.topicId)).toEqual(['r1', 'p1', 'p2', 'r2']);
  });
});

describe('progress tracking', () => {
  const act = (iso: string): LearningActivity => ({ id: iso, type: 'study-session', minutes: 30, timestamp: new Date(`${iso}T12:00:00`).toISOString(), description: '' });
  it('counts consecutive active days', () => {
    expect(calculateStreak([act('2026-03-01'), act('2026-03-02'), act('2026-03-03')], '2026-03-03')).toBe(3);
    expect(calculateStreak([act('2026-03-01'), act('2026-03-02')], '2026-03-03')).toBe(2);
    expect(calculateStreak([act('2026-03-01')], '2026-03-03')).toBe(0);
    expect(calculateStreak([], '2026-03-03')).toBe(0);
  });
  it('groups activity by Monday-based weeks', () => {
    expect(startOfWeek('2026-03-08')).toBe('2026-03-02');
    const weeks = computeWeeklyProgress([act('2026-03-03'), act('2026-03-04'), act('2026-02-24')], 2, '2026-03-05');
    expect(weeks.map((w) => w.minutes)).toEqual([30, 60]);
  });
});
