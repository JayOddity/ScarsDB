import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Is Scars of Honor Free to Play? Monetization Model Explained | ScarsHQ',
  description: 'Scars of Honor is a free to play MMORPG with no box price, no subscription, and no pay to win. The in game store sells cosmetics only. Full monetization breakdown.',
  openGraph: {
    title: 'Is Scars of Honor Free to Play? Full Monetization Breakdown',
    description: 'No box price. No subscription. No pay to win. Scars of Honor is free to play with a cosmetics only store.',
    url: '/free-to-play',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/og-free-to-play.jpg',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor — free to play MMORPG with cosmetics only monetization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is Scars of Honor Free to Play?',
    description: 'No box price. No subscription. No pay to win. Cosmetics only store. Full breakdown inside.',
    images: ['/images/og-free-to-play.jpg'],
  },
  alternates: {
    canonical: '/free-to-play',
  },
};

const headlineStats = [
  { label: 'Box Price', value: '$0', tone: 'text-honor-gold' },
  { label: 'Subscription', value: 'None', tone: 'text-text-primary' },
  { label: 'Pay To Win?', value: 'No.', tone: 'text-emerald-300' },
];

const includedForFree = [
  'Full access to the game with no purchase required.',
  'All progression earned through gameplay, not purchases.',
  'All currently announced classes, dungeons, PvE zones, and PvP modes are included.',
];

const paidItems = [
  'Cosmetic outfits, skins, and appearance changes.',
  'Mount skins and visual customization.',
  'Other cosmetic items with no effect on player power.',
];

const principles = [
  {
    title: 'Fair Progression',
    description:
      'Gear, stats, and combat power come from playing the game, not from the store.',
  },
  {
    title: 'Low Entry Barrier',
    description:
      'No upfront cost means anyone can try the game without risk, which matters for a new MMO building its community.',
  },
  {
    title: 'Cosmetics Fund the Game',
    description:
      'Revenue comes from optional cosmetics. No loot boxes, no stat boosts, no gear for sale.',
  },
];

const faqs = [
  {
    question: 'Will there be a battle pass?',
    answer:
      'A battle pass is being considered but not confirmed. If added, the developers have said it would contain cosmetic rewards only.',
  },
  {
    question: 'Can I buy experience boosts, gear, or stronger stats?',
    answer:
      'No. The store is cosmetics only. There are no experience boosts, gear upgrades, or anything that gives a gameplay advantage.',
  },
  {
    question: 'Is there a subscription?',
    answer:
      'No. The game is free to play with no subscription fee.',
  },
  {
    question: 'Where is this confirmed?',
    answer:
      'The official Steam page lists the game as free to play with cosmetics only monetization. The developers have also confirmed no pay to win in community discussions.',
  },
];

export default function FreeToPlayPage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pt-16 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,168,78,0.18),_transparent_38%),linear-gradient(180deg,rgba(18,18,26,0.6)_0%,rgba(10,10,15,1)_72%)]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-honor-gold/20 bg-honor-gold/10 px-4 py-1 text-[11px] uppercase tracking-[0.22em] text-honor-gold mb-6">
            Monetization Breakdown
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
            <div>
              <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
                Scars of Honor Is Free to Play Without Selling Power
              </h1>
              <p className="text-lg md:text-xl text-text-secondary max-w-3xl mb-4">
                No box price. No subscription. No announced pay to win systems.
                The current plan is a free to play MMORPG funded by cosmetics.
              </p>
              <p className="text-text-muted max-w-2xl mb-8 leading-8">
                If you are checking whether Scars of Honor locks core progression behind cash,
                the answer right now is no. The official messaging points to optional cosmetics
                and convenience, while combat power stays tied to gameplay.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
                >
                  View on Steam
                </a>
                <Link
                  href="/download"
                  className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
                >
                  How to Play
                </Link>
              </div>
            </div>

            <div className="bg-card-bg/90 border border-honor-gold/20 rounded-2xl p-6 glow-gold">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-4">At a glance</p>
              <div className="grid gap-4 mb-6">
                {headlineStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border-subtle bg-dark-surface/60 px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-2">{stat.label}</p>
                    <p className={`font-heading text-2xl ${stat.tone}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-honor-gold/15 bg-honor-gold/5 p-4">
                <p className="text-sm text-text-secondary leading-7">
                  Scars of Honor is built around the idea that a free MMO should not
                  undermine its own progression by selling power.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border-subtle bg-card-bg p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-3 w-3 rotate-45 bg-emerald-400" />
              <h2 className="font-heading text-2xl text-text-primary">What You Get for Free</h2>
            </div>
            <div className="space-y-3">
              {includedForFree.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border-subtle/70 bg-dark-surface/40 px-4 py-4 text-sm text-text-secondary leading-7"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-honor-gold/20 bg-card-bg p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-3 w-3 gem-bullet" />
              <h2 className="font-heading text-2xl text-honor-gold">What the Store Sells</h2>
            </div>
            <div className="space-y-3">
              {paidItems.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-honor-gold/10 bg-honor-gold/5 px-4 py-4 text-sm text-text-secondary leading-7"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="rounded-2xl border border-border-subtle bg-card-bg p-6 md:p-8">
          <div className="max-w-3xl mb-8">
            <h2 className="font-heading text-2xl text-honor-gold mb-3">Why This Model Matters</h2>
            <p className="text-text-secondary leading-8">
              Free to play only works if the store does not distort the game.
              For MMO players, the real question is whether paying gives an advantage
              in progression, PvP, or endgame power. Here it does not.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-xl border border-border-subtle bg-dark-surface/50 p-5 hover:border-honor-gold-dim transition-colors glow-gold-hover"
              >
                <h3 className="font-heading text-lg text-text-primary mb-3">{principle.title}</h3>
                <p className="text-sm text-text-secondary leading-7">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="rounded-2xl border border-border-subtle bg-card-bg p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">Source check</p>
            <h2 className="font-heading text-2xl text-honor-gold mb-4">What Is Actually Confirmed</h2>
            <p className="text-sm text-text-secondary leading-7 mb-4">
              The strongest public source is the{' '}
              <a
                href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-honor-gold hover:text-honor-gold-light transition-colors"
              >
                official Steam page
              </a>
              , which lists the game as free to play with monetization focused on cosmetics
              and convenience. Player power is earned through gameplay.
            </p>
            <p className="text-sm text-text-muted leading-7">
              The developers have reinforced this across community channels. Exact store
              details may evolve before launch, but the no pay to win stance is clear.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl text-honor-gold mb-4">Common Questions</h2>
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-card-bg border border-border-subtle rounded-xl p-5 hover:border-honor-gold-dim transition-colors"
                >
                  <h3 className="text-base font-semibold text-text-primary mb-2">{faq.question}</h3>
                  <p className="text-sm text-text-secondary leading-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-honor-gold/20 bg-card-bg px-6 py-10 md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(200,168,78,0.14),_transparent_48%)]" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl text-honor-gold mb-3">Try It Yourself</h2>
            <p className="text-sm md:text-base text-text-muted mb-6 leading-7">
              Scars of Honor is available to wishlist on Steam now. The next playtest runs
              April 30 to May 11, 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
              >
                Wishlist on Steam
              </a>
              <Link
                href="/playtest"
                className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
              >
                View Playtest Info
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
