import Link from 'next/link';
import type { Metadata } from 'next';
import PlaytestCountdown from '@/components/PlaytestCountdown';

export const metadata: Metadata = {
  title: 'Scars of Honor Release Date: Early Access & Alpha Roadmap 2026 | ScarsHQ',
  description: 'When is the Scars of Honor release date? Early Access is expected around Q1 2027. Next playtest: April 30 to May 11, 2026. Get the latest roadmap updates here.',
  openGraph: {
    title: 'Scars of Honor Release Date: Early Access & Alpha Roadmap 2026',
    description: 'When is the Scars of Honor release date? Early Access is expected around Q1 2027. Next playtest: April 30 to May 11, 2026. Get the latest roadmap updates here.',
    url: '/scars-of-honor-release-date',
    siteName: 'ScarsHQ',
    type: 'website',
    images: [
      {
        url: '/images/og-release-date.jpg',
        width: 1200,
        height: 630,
        alt: 'Scars of Honor Release Date — Playtest April 30 2026, Early Access estimated Q1 2027',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Release Date: Early Access & Alpha Roadmap 2026',
    description: 'When is the Scars of Honor release date? Early Access is estimated around Q1 2027. Next playtest: April 30 to May 11, 2026.',
    images: ['/images/og-release-date.jpg'],
  },
  alternates: {
    canonical: '/scars-of-honor-release-date',
  },
};

const timeline = [
  {
    date: 'October 2024',
    title: 'First Public Playtest',
    description: 'Initial playtest giving players their first hands on experience with the game.',
    status: 'completed' as const,
  },
  {
    date: 'April 30 - May 11, 2026',
    title: 'Public Technical Alpha',
    description: 'Public Technical Alpha on Steam. 4 races (Human, Dwarf, Infernal Demon, Undead), 4 classes (Paladin, Ranger, Mage, Druid), dungeons, and PvP across 3 content drops.',
    status: 'upcoming' as const,
  },
  {
    date: 'Estimated Q1 2027',
    title: 'Early Access Launch',
    description: 'Scars of Honor is expected to release in Early Access around Q1 2027, as stated by Beastburst CEO Armegon on his Twitch channel. This date is subject to possible change.',
    status: 'future' as const,
  },
  {
    date: 'TBA',
    title: 'Full Release',
    description: 'The full release date for Scars of Honor is currently unknown. More details are expected after the Early Access launch.',
    status: 'future' as const,
  },
];

const knownFacts = [
  {
    question: 'Has a release date been announced?',
    answer: 'Scars of Honor is expected to release in Early Access around Q1 2027, as per Beastburst CEO Armegon\'s statement on his Twitch channel. This date is subject to possible change. The full release date is currently unknown.',
  },
  {
    question: 'Is it free to play?',
    answer: 'Yes. Scars of Honor will be a free to play MMORPG with a cosmetics only in game store. No pay to win mechanics.',
  },
  {
    question: 'What platforms will it launch on?',
    answer: 'PC (Steam) is the confirmed launch platform. A mobile version is potentially possible after release but is not a priority for the team.',
  },
  {
    question: 'Can I play it right now?',
    answer: 'Not currently. The next opportunity to play is the April 30th Playtest running until May 11. Request access on Steam where it says "Join the Scars of Honor Playtest".',
  },
  {
    question: 'What are the system requirements?',
    answer: 'Minimum system requirements are listed on the Steam page but are subject to possible change as development continues.',
  },
  {
    question: 'Will there be more playtests?',
    answer: 'Likely yes. The developers have been running regular playtests and incorporating feedback. More testing phases are expected before the full launch.',
  },
];

const statusStyles = {
  completed: { dot: 'bg-green-500', line: 'border-green-500/30', label: 'Completed', labelColor: 'text-green-400' },
  upcoming: { dot: 'bg-honor-gold', line: 'border-honor-gold/30', label: 'Upcoming', labelColor: 'text-honor-gold' },
  future: { dot: 'bg-text-muted', line: 'border-border-subtle', label: 'TBA', labelColor: 'text-text-muted' },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Scars of Honor',
    description: 'A free to play fantasy MMORPG where player choice, skill based combat, and meaningful progression shape your legend.',
    gamePlatform: 'PC',
    applicationCategory: 'Game',
    genre: 'MMORPG',
    operatingSystem: 'Windows',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/PreOrder',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beastburst Entertainment',
    },
    url: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: knownFacts.map((fact) => ({
      '@type': 'Question',
      name: fact.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: fact.answer,
      },
    })),
  },
];

export default function ReleaseDatePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative pt-16 pb-8 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/5 to-void-black" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Scars of Honor Release Date
          </h1>
          <p className="text-xl text-text-secondary mb-2">
            When is Scars of Honor coming out?
          </p>
          <p className="text-text-muted">
            Scars of Honor is expected to launch in Early Access around Q1 2027. The next chance to play is the
            <Link href="/playtest" className="text-honor-gold hover:text-honor-gold-light"> public Technical Alpha</Link> on Steam,
            running April 30 - May 11, 2026. Sign up for the test on their{' '}
            <a href="https://store.steampowered.com/app/4253010/Scars_of_Honor/" target="_blank" rel="noopener noreferrer" className="text-honor-gold hover:text-honor-gold-light">Steam page</a> now.
          </p>
        </div>
      </section>

      {/* Release Overview Table — targets Featured Snippet */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-3">
        <table className="w-full text-sm border border-border-subtle rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-card-bg text-text-muted text-left">
              <th className="px-4 py-3 font-semibold">Phase</th>
              <th className="px-4 py-3 font-semibold">Estimated Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-text-secondary">
            <tr className="border-t border-border-subtle">
              <td className="px-4 py-3">Pre-Alpha</td>
              <td className="px-4 py-3">2024 – 2025</td>
              <td className="px-4 py-3"><span className="text-green-400">Completed</span></td>
            </tr>
            <tr className="border-t border-border-subtle">
              <td className="px-4 py-3">Public Technical Alpha</td>
              <td className="px-4 py-3">April 30 – May 11, 2026</td>
              <td className="px-4 py-3"><span className="text-honor-gold">Upcoming</span></td>
            </tr>
            <tr className="border-t border-border-subtle">
              <td className="px-4 py-3">Early Access</td>
              <td className="px-4 py-3">Estimated Q1 2027</td>
              <td className="px-4 py-3"><span className="text-text-muted">Upcoming</span></td>
            </tr>
            <tr className="border-t border-border-subtle">
              <td className="px-4 py-3">Full Launch</td>
              <td className="px-4 py-3">TBA</td>
              <td className="px-4 py-3"><span className="text-text-muted">TBA</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Playtest Countdown */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <PlaytestCountdown />
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-10">Development Timeline</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border-subtle" />

          <div className="space-y-8">
            {timeline.map((event, i) => {
              const style = statusStyles[event.status];
              return (
                <div key={i} className="relative flex gap-5">
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${style.dot} flex items-center justify-center`}
                      style={event.status === 'upcoming' ? { boxShadow: '0 0 12px rgba(212,175,55,0.4)' } : undefined}
                    >
                      {event.status === 'completed' && (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {event.status === 'upcoming' && (
                        <svg className="w-5 h-5 text-void-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
                          <circle cx="12" cy="12" r="9" strokeWidth={2} />
                        </svg>
                      )}
                      {event.status === 'future' && (
                        <span className="text-white text-sm font-bold">?</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-card-bg border ${style.line} rounded-lg p-5 pb-4`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-text-muted">{event.date}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.labelColor}`}>
                        {style.label}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg text-text-primary mb-1">{event.title}</h3>
                    <p className="text-sm text-text-secondary">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What We Know */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-8">What We Know</h2>
        <div className="space-y-4">
          {knownFacts.map((fact, i) => (
            <div key={i} className="bg-card-bg border border-border-subtle rounded-lg p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-2">{fact.question}</h3>
              <p className="text-sm text-text-secondary">{fact.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold mb-4">Get Ready for Launch</h2>
        <p className="text-text-secondary mb-8 max-w-xl mx-auto">
          While we wait for the official release date, start planning your character with our tools.
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
          <Link
            href="/talents"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            Plan Your Build
          </Link>
          <Link
            href="/playtest"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            Playtest Info
          </Link>
        </div>
      </section>
    </div>
  );
}
