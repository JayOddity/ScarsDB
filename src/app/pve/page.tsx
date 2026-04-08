import Link from 'next/link';

export const metadata = {
  title: 'PvE Content - Dungeons, Questing & Bosses | ScarsHQ',
  description: 'PvE in Scars of Honor — procedural dungeons, open world questing, boss encounters, and group content.',
};

const pveModes = [
  {
    title: 'Procedural Dungeons',
    description:
      'Dungeons change between runs. The developers have said layouts and encounters will vary so you cannot just memorize one route and repeat it.',
  },
  {
    title: 'Open World Questing',
    description:
      'The world of Aragon has zones with their own storylines, enemies, and exploration. Questing takes you across both faction territories.',
  },
  {
    title: 'Boss Encounters',
    description:
      'Dungeons have boss fights. Details on mechanics are still coming, but group coordination is expected to be a big part of it.',
  },
  {
    title: 'Group Content',
    description:
      'Dungeons and bosses are designed for groups. Solo questing and exploration exist, but the main PvE content is meant to be played together.',
  },
];

export default function PvePage() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-3 w-3 rotate-45 bg-honor-gold" />
          <p className="text-xs uppercase tracking-[0.22em] text-honor-gold">PvE</p>
        </div>
        <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4 max-w-3xl">
          Procedural dungeons, questing, bosses, and group content.
        </h1>
        <p className="text-text-secondary leading-8 max-w-3xl">
          PvE in Scars of Honor is built around dungeons that change between runs,
          open world questing across Aragon, and group content designed for parties.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {pveModes.map((mode) => (
            <div
              key={mode.title}
              className="rounded-2xl border border-border-subtle bg-card-bg p-6 hover:border-honor-gold-dim transition-colors"
            >
              <h2 className="font-heading text-xl text-honor-gold mb-3">{mode.title}</h2>
              <p className="text-sm text-text-secondary leading-7">{mode.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-honor-gold/20 bg-card-bg px-6 py-10 md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(200,168,78,0.14),_transparent_48%)]" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
              Get ready for dungeons
            </h2>
            <p className="text-sm md:text-base text-text-muted mb-6 leading-7">
              Plan your talents and gear before you queue up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/talents"
                className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
              >
                Plan Your Build
              </Link>
              <Link
                href="/pvp"
                className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
              >
                See PvP Content
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
