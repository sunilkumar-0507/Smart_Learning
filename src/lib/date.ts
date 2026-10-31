// Date helpers that work on local calendar days (YYYY-MM-DD).

export const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / DAY_MS);
}

/** Fractional days elapsed between two timestamps. */
export function elapsedDays(fromTimestamp: string, now: Date): number {
  return Math.max(0, (now.getTime() - new Date(fromTimestamp).getTime()) / DAY_MS);
}

export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  const date = iso.length <= 10 ? parseISODate(iso) : new Date(iso);
  return date.toLocaleDateString(undefined, options);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
