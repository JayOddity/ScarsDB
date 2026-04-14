import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { classes, allRaces } from '@/data/classes';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export function generateStaticParams() {
  return classes.map((cls) => ({ slug: cls.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const cls = classes.find((c) => c.slug === slug);
    if (!cls) return { title: 'Not Found' };
    return {
      title: `${cls.name} Class Guide - ScarsHQ`,
      description: cls.description,
      alternates: { canonical: `/classes/${cls.slug}` },
    };
  });
}

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cls = classes.find((c) => c.slug === slug);
  if (!cls) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Classes', url: '/classes' },
          { name: cls.name, url: `/classes/${cls.slug}` },
        ]}
      />
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span>/</span>
        <Link href="/classes" className="hover:text-honor-gold transition-colors">Classes</Link>
        <span>/</span>
        <span className="text-text-primary">{cls.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img src={cls.icon} alt={cls.name} className="w-20 h-20" />
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name}</h1>
          <span className="text-sm px-3 py-1 rounded bg-honor-gold/10 text-honor-gold font-medium">
            {cls.subtitle}
          </span>
        </div>
      </div>

      {/* Description */}
      <section className="mb-10">
        <p className="text-text-secondary leading-relaxed">{cls.description}</p>
      </section>

      {/* Subclasses / Paths */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Paths</h2>
        <div className="flex flex-wrap gap-3">
          {cls.subclasses.map((sub) => (
            <div key={sub.name} className="bg-card-bg border border-border-subtle rounded-lg px-5 py-3">
              <span className="font-heading text-lg text-text-primary">{sub.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Available Races */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Available Races</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allRaces.filter((r) => r.availableClasses.includes(cls.slug)).map((race) => {
            const isOrder = race.faction === 'sacred-order';
            return (
              <Link
                key={race.slug}
                href={`/races/${race.slug}`}
                className={`bg-card-bg border rounded-lg px-4 py-3 flex items-center gap-3 transition-colors hover:translate-y-[-1px] ${isOrder ? 'border-honor-gold/15 hover:border-honor-gold/40' : 'border-scar-red/15 hover:border-scar-red/40'}`}
              >
                <Image src={race.banner} alt={race.name} width={32} height={32} className="object-contain" />
                <div>
                  <span className={`font-heading text-sm ${isOrder ? 'text-honor-gold' : 'text-scar-red-light'}`}>{race.name}</span>
                  <span className="block text-[10px] text-text-muted">{isOrder ? 'Sacred Order' : 'Domination'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Source */}
      <p className="text-xs text-text-muted mb-10">
        Source: <a href="https://www.scarsofhonor.com/classes" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">scarsofhonor.com/classes</a>
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/talents/${cls.slug}`}
          className="px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors text-center"
        >
          Open Talent Calculator
        </Link>
        <Link
          href="/classes"
          className="px-6 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-center"
        >
          Explore All Classes
        </Link>
      </div>
    </div>
  );
}
