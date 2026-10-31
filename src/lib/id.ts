let counter = 0;

/** Collision-resistant local id; deterministic prefix keeps ids readable. */
export function createId(prefix: string): string {
  counter = (counter + 1) % 1_000_000;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}${random}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}
