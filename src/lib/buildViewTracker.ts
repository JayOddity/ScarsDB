// In-memory build view tracker
// Views naturally decay on serverless cold starts - fine for ranking

interface ViewEntry {
  timestamps: number[];
}

const views = new Map<string, ViewEntry>();
const WINDOW = 7 * 24 * 60 * 60 * 1000; // 7 days

export function recordBuildView(buildCode: string) {
  const now = Date.now();
  const entry = views.get(buildCode);
  if (entry) {
    entry.timestamps.push(now);
  } else {
    views.set(buildCode, { timestamps: [now] });
  }
}

export function getBuildViewCounts(): Map<string, number> {
  const now = Date.now();
  const cutoff = now - WINDOW;
  const counts = new Map<string, number>();

  for (const [code, entry] of views) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length > 0) {
      counts.set(code, entry.timestamps.length);
    } else {
      views.delete(code);
    }
  }

  return counts;
}

export function getBuildViewCount(buildCode: string): number {
  const now = Date.now();
  const cutoff = now - WINDOW;
  const entry = views.get(buildCode);
  if (!entry) return 0;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  return entry.timestamps.length;
}
