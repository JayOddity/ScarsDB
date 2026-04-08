import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const STEAM_APP_ID = '4253010';
const STEAM_NEWS_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${STEAM_APP_ID}&count=30&maxlength=0&format=json`;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BACKUP_DIR = join(process.cwd(), 'tmp');
const BACKUP_FILE = join(BACKUP_DIR, 'steam-news-backup.json');

export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
}

let cached: SteamNewsItem[] = [];
let cachedAt = 0;

async function saveBackup(items: SteamNewsItem[]) {
  try {
    await mkdir(BACKUP_DIR, { recursive: true });
    await writeFile(BACKUP_FILE, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // non-critical, don't crash
  }
}

async function loadBackup(): Promise<SteamNewsItem[]> {
  try {
    const raw = await readFile(BACKUP_FILE, 'utf-8');
    const data = JSON.parse(raw);
    // Only use backup if it's less than 2 days old
    if (Date.now() - data.savedAt < 2 * 24 * 60 * 60 * 1000) {
      return data.items || [];
    }
  } catch {
    // no backup available
  }
  return [];
}

export async function getSteamNews(): Promise<SteamNewsItem[]> {
  const now = Date.now();
  if (cached.length > 0 && now - cachedAt < CACHE_TTL) {
    return cached;
  }

  try {
    const res = await fetch(STEAM_NEWS_URL);
    if (!res.ok) throw new Error(`Steam API ${res.status}`);
    const data = await res.json();
    const items: SteamNewsItem[] = data?.appnews?.newsitems || [];
    cached = items;
    cachedAt = now;
    saveBackup(items); // fire and forget
    return items;
  } catch {
    // Try in-memory cache first, then disk backup
    if (cached.length > 0) return cached;
    const backup = await loadBackup();
    if (backup.length > 0) {
      cached = backup;
      cachedAt = now;
    }
    return cached;
  }
}

export async function getSteamPost(id: string): Promise<SteamNewsItem | null> {
  const items = await getSteamNews();
  return items.find((item) => item.gid === id) || null;
}
