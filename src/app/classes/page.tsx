import Link from 'next/link';
import { classes } from '@/data/classes';

export const metadata = {
  title: 'Classes — ScarsDB',
  description: 'All 10 playable classes in Scars of Honor. No fixed subclasses — your talent tree defines your role.',
};

export default function ClassesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Classes of Aragon</h1>
      <p className="text-text-secondary max-w-3xl mb-8">
        Scars of Honor features 10 playable classes with no fixed subclasses. Instead, each class
        has a massive talent tree with 240+ interconnected nodes. Your choices define your role
        and playstyle entirely.
      </p>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2 mb-12">
        {classes.map((cls) => (
          <Link
            key={cls.slug}
            href={`/classes/${cls.slug}`}
            className="flex items-center gap-2 px-3 py-2 bg-card-bg border border-border-subtle rounded-lg hover:border-honor-gold-dim transition-colors text-sm"
          >
            <span>{cls.icon}</span>
            <span className="text-text-primary">{cls.name}</span>
          </Link>
        ))}
      </div>

      {/* Class cards */}
      <div className="space-y-8">
        {classes.map((cls) => (
          <div
            key={cls.slug}
            id={cls.slug}
            className="bg-card-bg border border-border-subtle rounded-lg p-6 md:p-8 hover:border-honor-gold-dim transition-colors glow-gold-hover"
          >
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl">{cls.icon}</span>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-heading text-2xl text-text-primary">{cls.name}</h2>
                  <span className="text-xs px-2 py-1 rounded bg-honor-gold/10 text-honor-gold font-medium">
                    {cls.role}
                  </span>
                </div>
                <p className="text-text-secondary text-sm">{cls.description}</p>
              </div>
            </div>

            {/* Subclasses */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {cls.subclasses.map((sub) => (
                <div key={sub.name} className="bg-dark-surface/50 rounded-lg p-4">
                  <h3 className="font-heading text-sm text-honor-gold mb-1">{sub.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {sub.roles.map((role) => (
                      <span key={role} className="text-[10px] px-1.5 py-0.5 rounded bg-honor-gold/10 text-honor-gold">
                        {role}
                      </span>
                    ))}
                    {sub.damageTypes.map((dt) => (
                      <span key={dt} className="text-[10px] px-1.5 py-0.5 rounded bg-scar-red/10 text-scar-red-light">
                        {dt}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">{sub.description}</p>
                </div>
              ))}
            </div>

            <Link
              href={`/classes/${cls.slug}`}
              className="text-sm text-honor-gold hover:text-honor-gold-light transition-colors"
            >
              Read full guide →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
