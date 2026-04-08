export type BuildType = 'talent' | 'full';

export interface SavedBuild {
  id: string;
  name: string;
  classSlug: string;
  type: BuildType;
  allocation: string;       // talent node allocation string
  totalPoints: number;
  cloudCode?: string;        // if shared via cloud
  createdAt: string;         // ISO date
  updatedAt: string;         // ISO date
  // Future: skills, gear, etc.
}

const STORAGE_KEY = 'scarshq-saved-builds';

export function getSavedBuilds(): SavedBuild[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveBuild(build: Omit<SavedBuild, 'id' | 'createdAt' | 'updatedAt'>): SavedBuild {
  const builds = getSavedBuilds();
  const now = new Date().toISOString();
  const entry: SavedBuild = {
    ...build,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  builds.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
  return entry;
}

export function deleteBuild(id: string): void {
  const builds = getSavedBuilds().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
}

export function updateBuild(id: string, updates: Partial<Pick<SavedBuild, 'name' | 'allocation' | 'totalPoints' | 'cloudCode'>>): void {
  const builds = getSavedBuilds();
  const idx = builds.findIndex((b) => b.id === id);
  if (idx === -1) return;
  Object.assign(builds[idx], updates, { updatedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
}
