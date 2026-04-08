// In-memory item view tracker
// Views naturally decay on serverless cold starts, which is fine for "trending" data

interface ViewEntry {
  count: number;
  timestamps: number[]; // keep only last 24h of timestamps
}

const views = new Map<string, ViewEntry>();
let cachedPopular: { id: string; name: string; count: number }[] = [];
let cachedAt = 0;
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours
const WINDOW = 24 * 60 * 60 * 1000; // 24 hours

export function recordView(itemId: string) {
  const now = Date.now();
  const entry = views.get(itemId);
  if (entry) {
    entry.timestamps.push(now);
    entry.count++;
  } else {
    views.set(itemId, { count: 1, timestamps: [now] });
  }
}

export function getPopularIds(limit = 10): string[] {
  const now = Date.now();
  const cutoff = now - WINDOW;
  const scored: { id: string; count: number }[] = [];

  for (const [id, entry] of views) {
    // Prune old timestamps
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    entry.count = entry.timestamps.length;
    if (entry.count > 0) {
      scored.push({ id, count: entry.count });
    } else {
      views.delete(id);
    }
  }

  scored.sort((a, b) => b.count - a.count);
  return scored.slice(0, limit).map((s) => s.id);
}

export function getCachedPopular() {
  return { items: cachedPopular, cachedAt };
}

export function setCachedPopular(items: { id: string; name: string; count: number }[], time: number) {
  cachedPopular = items;
  cachedAt = time;
}

export function isCacheStale(): boolean {
  return Date.now() - cachedAt > CACHE_TTL;
}
