export function nowMs(): number {
  return Date.now();
}

export function toMs(value: string): number {
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function isOlderThan(timestamp: string, maxAgeMs: number): boolean {
  const time = toMs(timestamp);
  if (!time) return true;
  return nowMs() - time > maxAgeMs;
}

export function sortNewestFirst<T extends { publishedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => toMs(b.publishedAt) - toMs(a.publishedAt));
}

export function keepWithinAge<T extends { publishedAt: string }>(
  items: T[],
  maxAgeMs: number,
): T[] {
  return items.filter((item) => !isOlderThan(item.publishedAt, maxAgeMs));
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const output: T[] = [];

  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    output.push(item);
  }

  return output;
}
