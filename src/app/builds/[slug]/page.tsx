import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import { classes } from '@/data/classes';
import FilteredBuildList from '@/components/FilteredBuildList';
import BuildTagPills from '@/components/BuildTagPills';

const classMap = new Map(classes.map((c) => [c.slug, c]));

// Class-specific flavor text
const classDescriptions: Record<string, string> = {
  warrior: 'Warriors excel at frontline combat with heavy armor and devastating melee attacks. Whether you build for tanking or DPS, the Warrior talent tree rewards aggressive play and smart cooldown management.',
  paladin: 'Paladins blend holy magic with martial prowess. Versatile enough to tank, heal, or deal damage, Paladin builds often focus on one role while keeping utility from the others.',
  mage: 'Mages unleash devastating arcane, fire, and frost magic from range. Glass cannons by nature, the best Mage builds balance raw damage output with enough survivability to stay alive.',
  priest: 'Priests are the primary healers of Aragon, but their talent tree also supports powerful damage over time and shadow magic builds. Heal your allies or melt your enemies.',
  ranger: 'Rangers combine ranged physical attacks with pet companions. Build for sustained bow damage, burst shots, or lean into your pet for a summoner style playstyle.',
  druid: 'Druids shapeshift between forms, each with unique abilities. The most flexible class in the game — build for bear tanking, cat DPS, or caster healing depending on what your group needs.',
  assassin: 'Assassins strike from the shadows with burst damage and stealth mechanics. High risk, high reward — the best Assassin builds maximize opener damage and have an escape plan.',
  necromancer: 'Necromancers command undead minions and wield dark magic. Build for summoner style gameplay with an army of minions, or focus on DoTs and life drain for solo sustain.',
  pirate: 'Pirates are swashbuckling hybrid fighters with unique dual wield and pistol mechanics. Versatile and unpredictable, Pirate builds reward creativity and aggressive positioning.',
  mystic: 'Mystics channel elemental forces with unique combo based mechanics. Master the element weaving system to unlock devastating combo finishers.',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return classes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cls = classMap.get(slug);
  if (!cls) return { title: 'Builds - ScarsHQ' };
  return {
    title: `${cls.name} Builds - Scars of Honor ${cls.name} Talent Builds | ScarsHQ`,
    description: `Top ${cls.name} builds for Scars of Honor. PvP, PvE, leveling, and beginner talent builds rated by the community.`,
    alternates: { canonical: `/builds/${cls.slug}` },
  };
}

export default async function ClassBuildsPage({ params }: PageProps) {
  const { slug } = await params;
  const cls = classMap.get(slug);
  if (!cls) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <div className="flex items-center gap-4 mb-4">
        <img src={cls.icon} alt={cls.name} className="w-12 h-12" />
        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name} Builds</h1>
      </div>
      <p className="text-text-secondary mb-8 max-w-3xl">
        {classDescriptions[slug] || `Browse the best ${cls.name} builds created by the ScarsHQ community.`}
      </p>

      <BuildTagPills />
      <FilteredBuildList initialClass={slug} defaultSort="top" layout="grid" />
    </div>
  );
}
