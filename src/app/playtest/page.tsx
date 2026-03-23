'use client';

import { useState } from 'react';
import Link from 'next/link';

const features = [
  {
    title: 'Classes & Races',
    description: '4 playable races (Humans, Dwarves, Undead, Infernal Demons) and 4 classes (Paladin, Mage, Ranger, Druid) with full talent trees.',
    icon: '⚔️',
  },
  {
    title: 'Combat & Crafting',
    description: 'Hybrid tab-target + skillshot combat system, full respec support, gathering minigames, and crafting professions.',
    icon: '🔨',
  },
  {
    title: 'Dungeons (2nd Drop)',
    description: '"The Crypt of the Fallen" with bonus/penalty modifiers that change how you approach each run.',
    icon: '🏰',
  },
  {
    title: 'PvP (3rd Drop)',
    description: 'Open world PvP, Mourning Pass 5v5 battleground, and Thallan\'s Ring arena (1v1v1, 2v2v2).',
    icon: '⚡',
  },
];

const faqs = [
  {
    q: 'When is the playtest?',
    a: 'April 30 to May 11, 2026. Content will be released in three drops during this period.',
  },
  {
    q: 'How do I get access?',
    a: 'Wishlist Scars of Honor on Steam. No key needed — wishlisting grants access when the playtest goes live.',
  },
  {
    q: 'Is it free to play?',
    a: 'Yes! Scars of Honor is a truly free-to-play MMORPG with cosmetics-only in-game store.',
  },
  {
    q: 'What classes can I play?',
    a: 'The playtest features Paladin, Mage, Ranger, and Druid. Each has full talent trees with 240+ nodes.',
  },
  {
    q: 'What content is available?',
    a: 'Content releases in 3 drops: Drop 1 = Classes, races, and open world. Drop 2 = Dungeons. Drop 3 = PvP.',
  },
  {
    q: 'Can I keep my progress?',
    a: 'Playtest progress will not carry over to launch. This is purely for testing and feedback.',
  },
  {
    q: 'Where do I report bugs?',
    a: 'Join the official Discord server and use the bug-report channels. The dev team actively monitors feedback.',
  },
];

export default function PlaytestPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/5 to-void-black" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Spring 2026 Playtest
          </h1>
          <p className="text-2xl text-parchment font-heading mb-2">April 30 — May 11, 2026</p>
          <p className="text-text-secondary mb-8">
            Experience Scars of Honor before launch. Four classes, four races, dungeons, PvP, and full talent trees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Wishlist to Play
            </a>
            <a
              href="https://discord.com/invite/jDSuQVgwHF"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">What to Expect</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="font-heading text-lg text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Get Ready */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">Get Ready</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 text-center">
            <div className="w-10 h-10 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
            <h3 className="font-heading text-sm text-text-primary mb-2">Wishlist on Steam</h3>
            <p className="text-xs text-text-muted">Add Scars of Honor to your Steam wishlist for playtest access.</p>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 text-center">
            <div className="w-10 h-10 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
            <h3 className="font-heading text-sm text-text-primary mb-2">Join the Community</h3>
            <p className="text-xs text-text-muted">Connect with other players on Discord to find groups and share builds.</p>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 text-center">
            <div className="w-10 h-10 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
            <h3 className="font-heading text-sm text-text-primary mb-2">Plan Your Build</h3>
            <p className="text-xs text-text-muted">
              Use our <Link href="/talents" className="text-honor-gold hover:text-honor-gold-light">Talent Calculator</Link> to theorycraft before launch.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card-bg border border-border-subtle rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-dark-surface/50 transition-colors"
              >
                <span className="text-sm text-text-primary font-medium">{faq.q}</span>
                <span className="text-honor-gold text-lg ml-4 flex-shrink-0">
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-text-secondary">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
