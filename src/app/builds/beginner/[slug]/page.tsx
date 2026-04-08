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
  if (!cls) return { title: 'Beginner Guides - ScarsHQ' };
  return {
    title: `${cls.name} Beginner Guide - Scars of Honor ${cls.name} New Player Build | ScarsHQ`,
    description: `Beginner friendly ${cls.name} builds for Scars of Honor. Simple, effective talent setups for new players learning the ${cls.name}.`,
  };
}

export default async function ClassBeginnerPage({ params }: PageProps) {
  const { slug } = await params;
  const cls = classMap.get(slug);
  if (!cls) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-base-reset">
      <div className="flex items-center gap-4 mb-4">
        <img src={cls.icon} alt={cls.name} className="w-12 h-12" />
        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name} Beginner Guide</h1>
      </div>
      <p className="text-text-secondary mb-8 max-w-3xl">
        New to the {cls.name}? These builds are designed for first-time players. They use straightforward
        talent paths that don&apos;t require complex rotations or split-second timing. Focus on learning
        the {cls.name}&apos;s core mechanics — you can optimize later once you&apos;re comfortable with the class.
      </p>

      <FilteredBuildList initialTag="beginner" initialClass={slug} defaultSort="top" />
    </div>
  );
}
