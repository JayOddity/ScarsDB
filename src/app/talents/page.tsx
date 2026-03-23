import Link from 'next/link';
import { classes } from '@/data/classes';

export const metadata = {
  title: 'Talent Calculator — ScarsDB',
  description: 'Pick a class to build & share your talent tree. 240+ interconnected nodes per class.',
};

export default function TalentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Talent Calculator</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Pick a class to build &amp; share your talent tree. Each class has 240+ interconnected
          nodes with three distinct paths. No subclasses — your choices define your role.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {classes.map((cls) => (
          <Link
            key={cls.slug}
            href={`/talents/${cls.slug}`}
            className="group flex flex-col items-center gap-3 p-6 bg-card-bg border border-border-subtle rounded-lg hover:border-honor-gold-dim transition-all glow-gold-hover"
          >
            <span className="text-5xl group-hover:scale-110 transition-transform">{cls.icon}</span>
            <h2 className="font-heading text-lg text-text-primary group-hover:text-honor-gold transition-colors">
              {cls.name}
            </h2>
            <span className="text-xs text-text-muted">{cls.role}</span>
            <div className="flex gap-1 flex-wrap justify-center">
              {cls.subclasses.map((sub) => (
                <span key={sub.name} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-surface text-text-muted">
                  {sub.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
