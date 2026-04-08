import Link from 'next/link';

export const metadata = {
  title: 'PvP Content - Open World, Battlegrounds & Arenas | ScarsHQ',
  description: 'PvP in Scars of Honor — open world faction warfare, the Mourning Pass 5v5 battleground, and Thallan\'s Ring three-way arenas.',
  alternates: { canonical: '/pvp' },
};

const pvpModes = [
  {
    title: 'Open World PvP',
    tag: 'Faction war',
    description:
      'The Sacred Order and the Domination are at war. Open world PvP tied to the faction conflict has been discussed by the developers but details are limited.',
  },
  {
    title: 'Mourning Pass',
    tag: '5v5 Battleground',
    description:
      'A structured 5v5 battleground. Details on objectives and scoring are still to come.',
  },
  {
    title: "Thallan's Ring",
    tag: 'Arena',
    description:
      'Thallan\'s Ring runs 1v1v1 and 2v2v2 formats — three sides fighting at once instead of the usual two team setup.',
  },
];

export default function PvpPage() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-3 w-3 rotate-45 bg-scar-red" />
          <p className="text-xs uppercase tracking-[0.22em] text-scar-red-light">PvP</p>
        </div>
        <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4 max-w-3xl">
          A 5v5 battleground, three way arenas, and faction warfare.
        </h1>
        <p className="text-text-secondary leading-8 max-w-3xl">
          Confirmed PvP modes include the Mourning Pass 5v5 battleground and Thallan's Ring
          arenas with 1v1v1 and 2v2v2 formats. Open world PvP has been discussed but not fully detailed.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid gap-5">
          {pvpModes.map((mode) => (
            <div
              key={mode.title}
              className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8 hover:border-honor-gold-dim transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-scar-red-light mb-3">{mode.tag}</p>
              <h2 className="font-heading text-2xl text-honor-gold mb-3">{mode.title}</h2>
              <p className="text-text-secondary leading-7 max-w-3xl">{mode.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-scar-red/20 bg-card-bg px-6 py-10 md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(196,58,58,0.12),_transparent_46%)]" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">
              Plan a PvP build
            </h2>
            <p className="text-sm md:text-base text-text-muted mb-6 leading-7">
              Figure out your talents and gear before you queue up.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/talents"
                className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
              >
                Plan Your Build
              </Link>
              <Link
                href="/pve"
                className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
              >
                See PvE Content
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
