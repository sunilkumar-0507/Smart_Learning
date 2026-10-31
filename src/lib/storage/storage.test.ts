import { describe, expect, it } from 'vitest';
import { createDemoData, createEmptyData, STORAGE_VERSION } from '@/data/seed';
import { escapeCsv, parseImport, resultsToCsv, serializeExport, topicsToCsv } from './exportImport';
import { loadData, migrate, saveData, STORAGE_KEY, StorageError } from './storage';
import { validateAppData } from './validation';

const NOW = new Date('2026-03-01T12:00:00');

describe('data export and import', () => {
  it('round-trips a full backup', () => {
    const data = createDemoData(NOW);
    const parsed = parseImport(serializeExport(data, NOW));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data).toEqual(data);
  });

  it('accepts a raw AppData object as well as the backup envelope', () => {
    const data = createDemoData(NOW);
    const parsed = parseImport(JSON.stringify(data));
    expect(parsed.ok).toBe(true);
  });

  it('rejects text that is not JSON', () => {
    expect(parseImport('not json {')).toEqual({ ok: false, errors: ['The file is not valid JSON.'] });
  });

  it('rejects JSON from a different application', () => {
    const r = parseImport(JSON.stringify({ format: 'something-else', data: {} }));
    expect(r.ok).toBe(false);
  });

  it('rejects structurally invalid data with useful messages', () => {
    const data = createDemoData(NOW) as unknown as Record<string, unknown>;
    const broken = { ...data, topics: [{ id: 'x', name: 'X', subjectId: 'nope', difficulty: 9, importance: 50, estimatedMinutes: 10, prerequisites: [], questions: [{ id: 'q', text: 'Q', options: ['a'], correctIndex: 0 }] }] };
    const r = parseImport(JSON.stringify(broken));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.join(' ')).toMatch(/unknown subject/);
      expect(r.errors.join(' ')).toMatch(/difficulty/);
      expect(r.errors.join(' ')).toMatch(/four options/);
    }
    expect(validateAppData(null).ok).toBe(false);
    expect(validateAppData({ version: 2 }).ok).toBe(false);
  });

  it('rejects scores outside 0–100', () => {
    const data = createDemoData(NOW);
    data.results[0] = { ...data.results[0], score: 140 };
    expect(parseImport(JSON.stringify(data)).ok).toBe(false);
  });

  it('fills missing settings with defaults', () => {
    const data = createEmptyData() as unknown as Record<string, unknown>;
    delete data.settings;
    const r = validateAppData(data);
    expect(r.ok && r.data.settings.engine.weights.gap).toBe(0.4);
  });

  it('exports CSV with correct escaping', () => {
    expect(escapeCsv('plain')).toBe('plain');
    expect(escapeCsv('a,b')).toBe('"a,b"');
    expect(escapeCsv('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsv(null)).toBe('');
    const data = createDemoData(NOW);
    const topics = topicsToCsv(data).split('\r\n');
    expect(topics[0]).toMatch(/^Subject,Topic,/);
    expect(topics).toHaveLength(data.topics.length + 1);
    expect(resultsToCsv(data).split('\r\n')).toHaveLength(data.results.length + 1);
  });
});

describe('versioned storage', () => {
  it('saves and loads data from LocalStorage', () => {
    expect(loadData()).toEqual({ status: 'empty' });
    const data = createDemoData(NOW);
    expect(saveData(data)).toBeNull();
    const loaded = loadData();
    expect(loaded.status).toBe('ok');
    if (loaded.status === 'ok') expect(loaded.data.results).toHaveLength(data.results.length);
  });

  it('reports corrupted stored data instead of crashing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');
    expect(loadData().status).toBe('error');
  });

  it('migrates version 1 data to the current version', () => {
    const v1 = createEmptyData() as unknown as Record<string, unknown>;
    v1.version = 1;
    delete v1.completedResourceIds;
    delete v1.schedule;
    const migrated = migrate(v1) as Record<string, unknown>;
    expect(migrated.version).toBe(STORAGE_VERSION);
    expect(migrated.completedResourceIds).toEqual([]);
    expect(migrated.schedule).toBeNull();
    expect(validateAppData(migrated).ok).toBe(true);
  });

  it('refuses data from a newer, unknown version', () => {
    expect(() => migrate({ ...createEmptyData(), version: STORAGE_VERSION + 1 })).toThrow(StorageError);
  });
});
