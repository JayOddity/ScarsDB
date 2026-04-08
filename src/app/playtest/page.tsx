import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import PlaytestCountdown from '@/components/PlaytestCountdown';

export const metadata: Metadata = {
  title: 'Scars of Honor Playtest: April 30 – May 11, 2026 | Dates & Access | ScarsHQ',
  description: 'Scars of Honor playtest runs April 30 to May 11, 2026 on Steam. 4 classes and 4 races confirmed. Request access via Steam. Dungeons and PvP dropping mid test.',
  openGraph: {
    title: 'Scars of Honor Playtest: April 30 – May 11, 2026',
    description: 'Free Steam playtest with 4 classes, dungeons, and PvP. Request access now. Content drops in 3 stages over 12 days.',
    url: '/playtest',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/og-playtest.jpg',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor playtest — April 30 to May 11, 2026',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Playtest: April 30 – May 11, 2026',
    description: 'Free Steam playtest. 4 classes, dungeons, PvP. Request access on Steam now.',
  },
  alternates: {
    canonical: '/playtest',
  },
};

const features = [
  {
    title: 'Classes & Races',
    description: '4 classes (Paladin, Ranger, Mage, Druid) and 4 races (Human, Dwarf, Infernal Demon, Undead) confirmed for the test.',
  },
  {
    title: 'Combat & Crafting',
    description: 'Combat, respec support, gathering minigames, and crafting professions.',
  },
  {
    title: 'Dungeons (2nd Drop)',
    description: '"The Crypt of the Fallen" — a procedural dungeon that changes between runs.',
  },
  {
    title: 'PvP (3rd Drop)',
    description: 'Open world PvP, Mourning Pass 5v5 battleground, and Thallan\'s Ring arena (1v1v1, 2v2v2).',
  },
];

const faqs = [
  {
    q: 'When is the playtest?',
    a: 'April 30 to May 11, 2026. Content will be released in three drops during this period.',
  },
  {
    q: 'How do I get access?',
    a: 'Request access through the Scars of Honor Steam page and keep an eye on official updates. Access may be granted in waves.',
  },
  {
    q: 'Is it free to play?',
    a: 'Yes. Scars of Honor is planned as a free to play MMORPG with a cosmetics focused in game store.',
  },
  {
    q: 'What classes and races can I play?',
    a: 'The playtest features 4 classes (Paladin, Mage, Ranger, Druid) and 4 races (Human, Dwarf, Infernal Demon, Undead).',
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
          style={{ backgroundImage: "url('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/fbca4c46c3bf3fb7437c5214aac988e9d0895662/ss_fbca4c46c3bf3fb7437c5214aac988e9d0895662.600x338.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-void-black" />
        <div className="relative max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-honor-gold/70 mb-4">Steam Technical Alpha</p>
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Spring 2026 Playtest
          </h1>
          <p className="text-2xl text-parchment font-heading mb-2">April 30 - May 11, 2026</p>
          <p className="text-text-secondary max-w-3xl mx-auto mb-5">
            Experience Scars of Honor before launch. This public test is built around early combat, classes, races, world exploration, dungeons, and PvP as the event rolls out in stages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Request Access on Steam
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
            Source: <a href="https://steamcommunity.com/app/4253010/?curator_clanid=4777282" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light transition-colors">Steam Community updates</a>
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-2">
        <PlaytestCountdown />
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-card-bg border border-honor-gold/20 rounded-2xl p-6 md:p-8">
            <h2 className="font-heading text-2xl text-honor-gold mb-4">What Is Confirmed</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              The current announced test window runs from April 30 to May 11, 2026 on Steam. The developers have framed this as a technical alpha, so the goal is testing and feedback rather than a polished launch build.
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
            <h2 className="font-heading text-2xl text-honor-gold mb-4">Best Prep</h2>
            <div className="space-y-4 text-sm text-text-secondary">
              <p>Request access on Steam first, then keep the official Discord open for timing, announcements, and bug reporting.</p>
              <p>If you are expecting a finished MMO experience, adjust expectations. This test is for validation, iteration, and early feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-3">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">What to Expect</h2>
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
        <p className="text-text-muted text-sm text-center mb-3">4 classes (Paladin, Ranger, Mage, Druid) and 4 races (Human, Dwarf, Infernal Demon, Undead) are confirmed for the playtest.</p>
        <div className="rounded-xl overflow-hidden border border-border-subtle">
          <Image
            src="/Icons/playtest-races-classes.webp"
            alt="Playtest races and classes - Human, Dwarf, Infernal Demon, and Undead with the planned test class lineup"
            width={1920}
            height={1080}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Get Ready */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-3">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-3">Get Ready</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 text-center">
            <div className="w-10 h-10 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
            <h3 className="font-heading text-sm text-text-primary mb-2">Request Access</h3>
            <p className="text-xs text-text-muted">Open the Steam page, request access, and wishlist the game so you do not miss updates.</p>
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
