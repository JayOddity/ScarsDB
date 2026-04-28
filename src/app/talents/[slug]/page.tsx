import Link from 'next/link';
import { notFound } from 'next/navigation';
import { classes } from '@/data/classes';

export function generateStaticParams() {
  return classes.map((cls) => ({ slug: cls.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const cls = classes.find((c) => c.slug === slug);
    if (!cls) return { title: 'Not Found' };
    return {
      title: `${cls.name} Talent Calculator (Coming Soon) - ScarsHQ`,
      description: `The ${cls.name} talent calculator is being rebuilt. Check back closer to launch.`,
      alternates: { canonical: `/talents/${cls.slug}` },
    };
  });
}

export default async function TalentClassWipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cls = classes.find((c) => c.slug === slug);
  if (!cls) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-16 text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <img src={cls.icon} alt={cls.name} className="w-12 h-12" />
        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name} Talents — Coming Soon</h1>
      </div>
      <p className="text-text-secondary mb-3">
        We&apos;re rebuilding the talent calculator from scratch using first-party game data. While that work is underway, this page is offline.
      </p>
      <p className="text-text-muted text-sm mb-8">
        Read about the {cls.name} class while you wait.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link href={`/classes/${cls.slug}`} className="px-4 py-2 border border-honor-gold-dim rounded text-sm text-honor-gold hover:bg-honor-gold/10 transition-colors">
          {cls.name} class page
        </Link>
        <Link href="/talents" className="px-4 py-2 border border-border-subtle rounded text-sm text-text-secondary hover:border-honor-gold-dim hover:text-honor-gold transition-colors">
          All classes
        </Link>
      </div>
    </div>
  );
}
