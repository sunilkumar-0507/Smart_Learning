// Centralised, versioned LocalStorage persistence with schema migration.

import type { AppData } from '@/types';
import { STORAGE_VERSION } from '@/data/seed';
import { validateAppData } from './validation';

export const STORAGE_KEY = 'smart-learning-path:data';

type RawData = Record<string, unknown> & { version?: number };

/**
 * Migration steps keyed by the version they upgrade FROM.
 * v1 (initial prototype) had no resource tracking and fewer engine settings.
 */
const MIGRATIONS: Record<number, (data: RawData) => RawData> = {
  1: (data) => ({
    ...data,
    version: 2,
    completedResourceIds: Array.isArray(data.completedResourceIds) ? data.completedResourceIds : [],
    schedule: data.schedule ?? null,
  }),
};

export class StorageError extends Error {}

export function migrate(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) return raw;
  let data = { ...(raw as RawData) };
  let version = typeof data.version === 'number' ? data.version : 1;
  if (version > STORAGE_VERSION) {
    throw new StorageError(`Data was created by a newer version of the app (v${version}); this build supports up to v${STORAGE_VERSION}.`);
  }
  while (version < STORAGE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new StorageError(`No migration available from storage version ${version}.`);
    data = step(data);
    version = data.version as number;
  }
  return data;
}

export type LoadResult = { status: 'empty' } | { status: 'ok'; data: AppData } | { status: 'error'; message: string };

export function loadData(storage: Storage = window.localStorage): LoadResult {
  let text: string | null;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'error', message: 'Browser storage is not available.' };
  }
  if (!text) return { status: 'empty' };
  try {
    const result = validateAppData(migrate(JSON.parse(text)));
    if (!result.ok) return { status: 'error', message: `Stored data is invalid: ${result.errors[0]}` };
    return { status: 'ok', data: result.data };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Stored data could not be read.' };
  }
}

/** Returns an error message, or null on success. */
export function saveData(data: AppData, storage: Storage = window.localStorage): string | null {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return null;
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      return 'Browser storage is full. Export your data and remove unused custom content.';
    }
    return 'Your progress could not be saved to browser storage.';
  }
}

export function clearData(storage: Storage = window.localStorage): void {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
