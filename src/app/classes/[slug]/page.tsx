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
      title: `${cls.name} Class Guide — ScarsDB`,
      description: cls.description,
    };
  });
}

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cls = classes.find((c) => c.slug === slug);
  if (!cls) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
        <span className="text-5xl">{cls.icon}</span>
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-honor-gold">{cls.name}</h1>
          <span className="text-sm px-3 py-1 rounded bg-honor-gold/10 text-honor-gold font-medium">
            {cls.role}
          </span>
        </div>
      </div>

      {/* Lore */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-3">Lore & Backstory</h2>
        <p className="text-text-secondary leading-relaxed">{cls.lore}</p>
      </section>

      {/* Role */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-3">Role in Aragon</h2>
        <p className="text-text-secondary leading-relaxed">{cls.description}</p>
      </section>

      {/* Strengths & Weaknesses */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Strengths & Weaknesses</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
            <h3 className="text-sm font-semibold text-green-400 mb-3 uppercase tracking-wider">Strengths</h3>
            <ul className="space-y-2">
              {cls.strengths.map((s, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">+</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5">
            <h3 className="text-sm font-semibold text-scar-red-light mb-3 uppercase tracking-wider">Weaknesses</h3>
            <ul className="space-y-2">
              {cls.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-scar-red-light mt-0.5">-</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Subclasses / Paths */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Playstyles & Paths</h2>
        <div className="space-y-4">
          {cls.subclasses.map((sub) => (
            <div key={sub.name} className="bg-card-bg border border-border-subtle rounded-lg p-5">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading text-lg text-text-primary">{sub.name}</h3>
                <div className="flex gap-1">
                  {sub.roles.map((role) => (
                    <span key={role} className="text-xs px-2 py-0.5 rounded bg-honor-gold/10 text-honor-gold">
                      {role}
                    </span>
                  ))}
                  {sub.damageTypes.map((dt) => (
                    <span key={dt} className="text-xs px-2 py-0.5 rounded bg-scar-red/10 text-scar-red-light">
                      {dt}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-text-secondary">{sub.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Beginner Tips</h2>
        <ol className="space-y-3">
          {cls.tips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm text-text-secondary">
              <span className="flex-shrink-0 w-6 h-6 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="pt-0.5">{tip}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/talents`}
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
