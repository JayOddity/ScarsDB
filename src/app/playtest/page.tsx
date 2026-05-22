import Link from 'next/link';
import type { Metadata } from 'next';
import PlaytestCountdown from '@/components/PlaytestCountdown';

export const metadata: Metadata = {
  title: 'Scars of Honor Playtest: Spring 2026 Recap and What Is Next | ScarsHQ',
  description: 'The Scars of Honor Spring 2026 playtest ran April 30 to May 11. Here is what was in it: 4 classes, 6 races, world bosses, and PvP, plus how to catch the next test.',
  openGraph: {
    title: 'Scars of Honor Playtest — Spring 2026 Recap',
    description: 'The Spring 2026 Technical Alpha ran April 30 to May 11. 4 classes, 6 races, world bosses, PvP across 3 waves. What happened and how to get into the next one.',
    url: '/playtest',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/og-playtest.jpg',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor Spring 2026 playtest recap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Playtest — Spring 2026 Recap',
    description: 'The Spring 2026 Technical Alpha ran April 30 to May 11. 4 classes, 6 races, world bosses, PvP. How to catch the next test.',
  },
  alternates: {
    canonical: '/playtest',
  },
};

const features = [
  {
    title: 'Classes & Races',
    description: '6 of 8 races were playable: Human, Dwarf, Bearan for Sacred Order; Infernal Demon, Undead, Gronthar for Domination. Sun Elf and Orc come later. 4 classes this test: Druid, Mage, Paladin, Ranger.',
  },
  {
    title: 'World & Progression',
    description: 'Ondall\'s Fall region, character progression, combat leveling, Talents, and the Scar System.',
  },
  {
    title: 'World Bosses (Wave 2)',
    description: 'World bosses including "The Lord of Shadows" plus faction bosses in main cities. Resource gathering and crafting went live too.',
  },
  {
    title: 'PvP & Arenas (Waves 2 and 3)',
    description: 'Battlegrounds opened in Wave 2. Arena modes followed in Wave 3.',
  },
];

const faqs = [
  {
    q: 'When was the playtest?',
    a: 'The Spring 2026 Technical Alpha ran April 30 to May 11, 2026. Content rolled out in three waves over the event. No date has been announced for the next test yet.',
  },
  {
    q: 'How do I get into the next one?',
    a: 'Access ran through the Scars of Honor Steam page during the test. For the next one, wishlist the game on Steam and watch the official Discord, since that is where new test windows get announced.',
  },
  {
    q: 'Is it free to play?',
    a: 'Yes. Scars of Honor is planned as a free to play MMORPG with a cosmetics focused in game store.',
  },
  {
    q: 'What classes and races could I play?',
    a: 'Six of the eight races were playable: Human, Dwarf, and Bearan on the Sacred Order side; Infernal Demon, Undead, and Gronthar on the Domination side. Sun Elf and Orc were held back but will be in the final game. Four classes were in: Druid, Mage, Paladin, and Ranger. The other six (Assassin, Mystic, Necromancer, Pirate, Priest, Warrior) were not yet available.',
  },
  {
    q: 'What content was available?',
    a: 'Wave 1 brought core systems: combat, leveling, Talents, the Scar System, gathering, crafting, and exploration of Ondall\'s Fall. Wave 2 added world bosses (including The Lord of Shadows), faction bosses in main cities, and PvP battlegrounds. Wave 3 added arena modes.',
  },
  {
    q: 'Were dungeons in the playtest?',
    a: 'No. The developers confirmed dungeons would not be in this time while they keep refining the system for quality and replayability.',
  },
  {
    q: 'Did progress carry over?',
    a: 'No. Playtest progress did not carry over to launch. It was purely for testing and feedback.',
  },
  {
    q: 'Where do I report bugs?',
    a: 'Join the official Discord server and use the bug report channels. The dev team actively monitors feedback.',
  },
];

export default function PlaytestPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-10 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/10 via-honor-gold/5 to-void-black" />
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/steam-screenshot-1.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-void-black" />
        <div className="relative max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-honor-gold/70 mb-4">Steam Technical Alpha</p>
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Spring 2026 Playtest
          </h1>
          <p className="text-2xl text-parchment font-heading mb-2">April 30 - May 11, 2026 · Concluded</p>
          <p className="text-text-secondary max-w-3xl mx-auto mb-5">
            Four classes were playable (Druid, Mage, Paladin, Ranger) and six of the eight races. Bearan and Gronthar were in for the first time; Sun Elf and Orc were held back for the final game. Ondall&apos;s Fall opened for exploration, with world bosses and PvP rolling in across three content waves. Dungeons sat this one out. No date has been set for the next test, so wishlist on Steam to hear when it opens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Wishlist on Steam
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
          <p className="text-xs text-text-muted mt-5">
            Source: <Link href="/news/steam/1830797770242763" className="text-honor-gold hover:text-honor-gold-light transition-colors">Official Playtest Announcement (Apr 27, 2026)</Link>
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-2">
        <PlaytestCountdown />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-card-bg border border-honor-gold/20 rounded-2xl p-6 md:p-8">
            <h2 className="font-heading text-2xl text-honor-gold mb-4">What Happened</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              The Spring 2026 test window ran from April 30 to May 11, 2026 on Steam. The developers framed it as a technical alpha, so the goal was testing and feedback rather than a polished launch build.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-subtle bg-dark-surface/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Window</p>
                <p className="font-heading text-lg text-text-primary mb-1">April 30 - May 11</p>
                <p className="text-xs text-text-muted">2026 public playtest</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-dark-surface/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Platform</p>
                <p className="font-heading text-lg text-text-primary mb-1">PC via Steam</p>
                <p className="text-xs text-text-muted">Access managed through Steam</p>
              </div>
              <div className="rounded-xl border border-border-subtle bg-dark-surface/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Access</p>
                <p className="font-heading text-lg text-text-primary mb-1">Wave based</p>
                <p className="text-xs text-text-muted">Watch Steam and Discord for updates</p>
              </div>
            </div>
          </div>

          <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8">
            <h2 className="font-heading text-2xl text-honor-gold mb-4">Catch the Next One</h2>
            <div className="space-y-4 text-sm text-text-secondary">
              <p>Wishlist on Steam and keep the official Discord open. New test windows get announced there first.</p>
              <p>These tests are for validation and early feedback, not a finished MMO. Expect rough edges when the next one opens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-3">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">What Was in the Test</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
              <h3 className="font-heading text-lg text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Playtest Races & Classes */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-3">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">Playtest Races & Classes</h2>
        <p className="text-text-muted text-sm text-center mb-6">Six playable races and four classes (Druid, Mage, Paladin, Ranger). The remaining six classes were not in this test.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <h3 className="font-heading text-lg text-honor-gold-light mb-3">Races</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Playable that test (6)</p>
            <ul className="text-sm text-text-primary space-y-1.5 mb-4">
              <li>Human</li>
              <li>Dwarf</li>
              <li>Bearan <span className="text-honor-gold/70 text-xs">new</span></li>
              <li>Infernal Demon</li>
              <li>Undead</li>
              <li>Gronthar <span className="text-honor-gold/70 text-xs">new</span></li>
            </ul>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Held back for final game (2)</p>
            <ul className="text-sm text-text-muted space-y-1.5">
              <li>Sun Elf</li>
              <li>Orc</li>
            </ul>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
            <h3 className="font-heading text-lg text-honor-gold-light mb-3">Classes</h3>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Playable that test (4)</p>
            <ul className="text-sm text-text-primary grid grid-cols-2 gap-y-1.5 gap-x-4 mb-4">
              <li><Link href="/classes/druid" className="hover:text-honor-gold-light transition-colors">Druid</Link></li>
              <li><Link href="/classes/mage" className="hover:text-honor-gold-light transition-colors">Mage</Link></li>
              <li><Link href="/classes/paladin" className="hover:text-honor-gold-light transition-colors">Paladin</Link></li>
              <li><Link href="/classes/ranger" className="hover:text-honor-gold-light transition-colors">Ranger</Link></li>
            </ul>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted mb-2">Not in that test (6)</p>
            <ul className="text-sm text-text-muted grid grid-cols-2 gap-y-1.5 gap-x-4">
              <li>Warrior</li>
              <li>Priest</li>
              <li>Assassin</li>
              <li>Necromancer</li>
              <li>Pirate</li>
              <li>Mystic</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Get Ready */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-3">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">Get Ready for the Next One</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 text-center">
            <div className="w-10 h-10 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
            <h3 className="font-heading text-sm text-text-primary mb-2">Wishlist on Steam</h3>
            <p className="text-xs text-text-muted">Open the Steam page and wishlist the game so the next test window lands in your notifications.</p>
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-3">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-card-bg border border-border-subtle rounded-lg overflow-hidden px-5 py-4">
              <h3 className="text-base text-honor-gold-light font-heading mb-1">{faq.q}</h3>
              <p className="text-sm text-text-secondary">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
