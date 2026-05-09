import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { classes, allRaces } from '@/data/classes';
import { professions } from '@/data/professions';

const now = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://scarshq.com';

  // Static pages with priorities
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/character`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/classes`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/races`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/talents`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/database`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/database/spells`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/database/quests`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/gear`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/builds`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/builds/pvp`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/builds/pve`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/builds/leveling`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/builds/beginner`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/builds/best`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/builds/tier-list`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/professions`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/mounts`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/factions`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/scars`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pve`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/pvp`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/community`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/download`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/gameplay`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/free-to-play`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/mobile`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/system-requirements`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/playtest`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/scars-of-honor-release-date`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/map`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  // Dynamic class pages
  const classPages: MetadataRoute.Sitemap = classes.map((cls) => ({
    url: `${base}/classes/${cls.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic race pages
  const racePages: MetadataRoute.Sitemap = allRaces.map((race) => ({
    url: `${base}/races/${race.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Talent calculator per class
  const talentPages: MetadataRoute.Sitemap = classes.map((cls) => ({
    url: `${base}/talents/${cls.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Per profession pages
  const professionPages: MetadataRoute.Sitemap = professions.map((prof) => ({
    url: `${base}/professions/${prof.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Quest detail pages from datamined JSON
  let questPages: MetadataRoute.Sitemap = [];
  try {
    const questsFile = path.join(process.cwd(), 'public', 'data', 'playtest-quests.json');
    const raw = JSON.parse(fs.readFileSync(questsFile, 'utf8')) as { quests: Array<{ slug: string }> };
    questPages = raw.quests.map((q) => ({
      url: `${base}/database/quests/${q.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // file not present in this build — skip
  }

  return [...staticPages, ...classPages, ...racePages, ...talentPages, ...professionPages, ...questPages];
}
