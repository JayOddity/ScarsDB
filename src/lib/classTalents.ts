import fs from 'node:fs';
import path from 'node:path';

export const PLAYABLE_CLASS_SLUGS = ['druid', 'mage', 'paladin', 'ranger'] as const;
export type PlayableClassSlug = typeof PLAYABLE_CLASS_SLUGS[number];

export interface ClassAbility {
  name: string;
  description: string;
  iconUrl?: string;
}

export interface ClassTreeAbilities {
  active: ClassAbility[];
  start: ClassAbility[];
}

const stripHtml = (s: string | undefined): string =>
  (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export function isPlayableSlug(slug: string): slug is PlayableClassSlug {
  return (PLAYABLE_CLASS_SLUGS as readonly string[]).includes(slug);
}

export function loadClassAbilities(slug: string): ClassTreeAbilities {
  const file = path.join(process.cwd(), 'public/data/talents', `${slug}.json`);
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    nodes: Array<{ nodeType?: string; name?: string; description?: string; iconUrl?: string }>;
  };
  const toAbility = (n: { name?: string; description?: string; iconUrl?: string }): ClassAbility => ({
    name: stripHtml(n.name),
    description: stripHtml(n.description),
    iconUrl: n.iconUrl,
  });
  return {
    active: raw.nodes.filter((n) => n.nodeType === 'active').map(toAbility),
    start: raw.nodes.filter((n) => n.nodeType === 'start').map(toAbility),
  };
}
