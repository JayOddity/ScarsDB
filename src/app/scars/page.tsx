import Link from 'next/link';

export const metadata = {
  title: 'The Scars System - ScarsHQ',
  description: 'Learn about the Scars system - a permanent progression mechanic that defines your character in Scars of Honor.',
};

const aspects = [
  {
    title: 'Permanent Progression',
    description: 'Scars are lasting marks on your character that persist forever. Unlike gear that can be swapped or talent points that can be respecced, Scars represent permanent choices that define who your character becomes over time.',
  },
  {
    title: 'Earned Through Achievement',
    description: 'Scars are not bought or randomly dropped. They are earned by reaching gameplay milestones, conquering challenges, and accomplishing feats across PvE, PvP, and the open world. Your Scars tell the story of what you have survived.',
  },
  {
    title: 'Meaningful Choices',
    description: 'Each Scar presents a meaningful decision that shapes your character. These choices go beyond raw power - they influence how your character interacts with the world, offering customization that talent trees alone cannot provide.',
  },
  {
    title: 'Beyond Talent Trees',
    description: 'While talent trees define your combat role and abilities, Scars add another layer of identity. They provide unique bonuses, unlock special interactions, and set your character apart from others of the same class and build.',
  },
];

export default function ScarsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">The Scars System</span>
      </nav>

      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">
        The Scars System
      </h1>
      <p className="text-text-secondary mb-12 max-w-6xl">
        At the heart of Scars of Honor lies its namesake system - Scars. A permanent
        progression mechanic that goes beyond levels and gear, Scars are the defining feature
        that makes every character truly unique. Your choices leave lasting marks that shape
        your journey through Aragon.
      </p>

      {/* Core Aspects */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-honor-gold rotate-45" />
          <h2 className="font-heading text-2xl text-honor-gold">How Scars Work</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {aspects.map((aspect) => (
            <div key={aspect.title} className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-honor-gold rotate-45 shrink-0" />
                <h3 className="font-heading text-lg text-text-primary">{aspect.title}</h3>
              </div>
              <p className="text-sm text-text-secondary">{aspect.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* How It Fits */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-honor-gold rotate-45" />
          <h2 className="font-heading text-2xl text-honor-gold">Your Character, Your Story</h2>
        </div>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
          <p className="text-sm text-text-secondary mb-4">
            In most MMOs, two players of the same class with the same gear are functionally
            identical. In Scars of Honor, the Scars system ensures that is never the case.
            Two Warriors might share the same talent build and equipment, but their Scars -
            earned through different journeys, different choices, and different achievements -
            make them fundamentally different characters.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            Scars work alongside the talent tree system, not in competition with it. Your talent
            tree defines your combat role and abilities. Your Scars define your character&apos;s
            history and identity. Together, they create a level of customization that gives
            every player a reason to forge their own path.
          </p>
          <p className="text-sm text-text-secondary">
            Whether you earned your Scars through dungeon mastery, PvP dominance, exploration
            milestones, or crafting achievements - they are yours permanently, and they tell
            the world exactly who you are.
          </p>
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Disclaimer */}
      <section className="mb-12">
        <div className="bg-card-bg border border-honor-gold/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-honor-gold text-lg mt-0.5">⚠</span>
            <div>
              <h3 className="font-heading text-sm text-honor-gold mb-2">Subject to Change</h3>
              <p className="text-sm text-text-secondary">
                The Scars system is still in active development. Specific mechanics, rewards,
                and interactions may change before launch. The information on this page reflects
                what has been shared publicly by the development team. We will update this page
                as more details are revealed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <p className="text-text-secondary mb-4">Explore more about building your character.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/talents"
            className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Talent Calculator
          </Link>
          <Link
            href="/classes"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            View Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
