import type { Metadata } from 'next';

import { notFound } from 'next/navigation';
import { classes } from '@/data/classes';
import FilteredBuildList from '@/components/FilteredBuildList';

const classMap = new Map(classes.map((c) => [c.slug, c]));

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return classes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cls = classMap.get(slug);
  if (!cls) return { title: 'Leveling Builds - ScarsHQ' };
  return {
    title: `${cls.name} Leveling Build - Scars of Honor ${cls.name} Leveling Guide | ScarsHQ`,
    description: `The fastest ${cls.name} leveling builds for Scars of Honor. Efficient talent setups to reach endgame quickly.`,
  };
}

export default async function ClassLevelingPage({ params }: PageProps) {
  const { slug } = await params;
  const cls = classMap.get(slug);
  if (!cls) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <div className="flex items-center gap-4 mb-4">
        <img src={cls.icon} alt={cls.name} className="w-12 h-12" />
        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name} Leveling Build</h1>
      </div>
      <p className="text-text-secondary mb-8 max-w-3xl">
        The best {cls.name} talent builds for fast leveling. These builds prioritize AoE damage,
        sustain, and kill speed to get your {cls.name} to endgame as efficiently as possible. Don&apos;t
        worry about being locked in — you can respec your talents at any time once you hit the level cap.
      </p>

      <FilteredBuildList initialTag="leveling" initialClass={slug} defaultSort="top" />
    </div>
  );
}
