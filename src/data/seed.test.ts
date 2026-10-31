import { describe, expect, it } from 'vitest';
import { buildCurriculum, createDemoData, CURRICULUM } from './seed';
import { detectCircularDependencies } from '@/lib/engine/graph';
import { validateAppData } from '@/lib/storage/validation';

describe('sample data', () => {
  const { subjects, topics, resources } = buildCurriculum();

  it('contains at least five subjects with at least ten topics each', () => {
    expect(subjects.length).toBeGreaterThanOrEqual(5);
    for (const s of subjects) expect(topics.filter((t) => t.subjectId === s.id).length).toBeGreaterThanOrEqual(10);
  });

  it('includes the required default subjects', () => {
    expect(subjects.map((s) => s.name)).toEqual(['Web Development', 'Programming Fundamentals', 'Database Management', 'Data Structures', 'Computer Networks']);
  });

  it('gives every topic at least five well-formed questions', () => {
    for (const t of topics) {
      expect(t.questions.length, t.id).toBeGreaterThanOrEqual(5);
      for (const q of t.questions) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size, q.id).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThanOrEqual(3);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it('uses unique ids and valid, acyclic prerequisites', () => {
    const ids = new Set(topics.map((t) => t.id));
    expect(ids.size).toBe(topics.length);
    for (const t of topics) for (const p of t.prerequisites) expect(ids.has(p), `${t.id} → ${p}`).toBe(true);
    expect(detectCircularDependencies(topics).size).toBe(0);
    expect(topics.filter((t) => t.prerequisites.length > 0).length).toBeGreaterThan(30);
  });

  it('provides all five resource types for every topic', () => {
    for (const t of topics) {
      const types = new Set(resources.filter((r) => r.topicId === t.id).map((r) => r.type));
      expect([...types].sort()).toEqual(['code', 'exercise', 'notes', 'quiz', 'text']);
    }
    expect(CURRICULUM.every((s) => s.topics.every((t) => t.code.snippet.length > 20 && t.exercise.length > 20))).toBe(true);
  });

  it('builds a valid, reproducible demo dataset with history', () => {
    const now = new Date('2026-03-01T15:00:00');
    const demo = createDemoData(now);
    const again = createDemoData(now);
    expect(demo).toEqual(again);
    expect(validateAppData(demo).ok).toBe(true);
    expect(demo.profile?.name).toBeTruthy();
    expect(demo.results.length).toBeGreaterThan(20);
    expect(demo.activities.length).toBeGreaterThan(20);
    expect(Object.values(demo.progress).some((p) => p.status === 'completed')).toBe(true);
    expect(demo.activities.every((a) => new Date(a.timestamp) <= now)).toBe(true);
  });
});
