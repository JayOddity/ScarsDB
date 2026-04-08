import { notFound } from 'next/navigation';
import { classes } from '@/data/classes';
import TalentTree from '@/components/TalentTree';

export function generateStaticParams() {
  return classes.map((cls) => ({ slug: cls.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const cls = classes.find((c) => c.slug === slug);
    if (!cls) return { title: 'Not Found' };
    return {
      title: `${cls.name} Talent Calculator - ScarsHQ`,
      description: `Build your ${cls.name} talent tree. 240+ nodes across ${cls.subclasses.map((s) => s.name).join(', ')} paths.`,
    };
  });
}

export default async function TalentPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const cls = classes.find((c) => c.slug === slug);
  if (!cls) notFound();
  const tab = typeof sp.tab === 'string' ? sp.tab : undefined;

  return <TalentTree gameClass={cls} initialTab={tab} />;
}
