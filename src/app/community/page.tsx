import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scars of Honor Community - Reddit, Discord & More | ScarsHQ',
  description: 'Join the Scars of Honor community. Official Discord, Reddit, YouTube, Twitter, and fan communities.',
  openGraph: {
    title: 'Scars of Honor Community - Reddit, Discord & More',
    description: 'Join the Scars of Honor community. Official Discord, Reddit, YouTube, Twitter, and fan communities.',
    url: '/community',
    siteName: 'ScarsHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Community - Reddit, Discord & More',
    description: 'Join the Scars of Honor community. Official Discord, Reddit, YouTube, Twitter, and fan communities.',
  },
  alternates: {
    canonical: '/community',
  },
};

const communities = [
  {
    name: 'Official Discord',
    description: 'The main community hub. Chat with players, find groups, get dev updates, and report bugs.',
    url: 'https://discord.com/invite/jDSuQVgwHF',
    members: 'Most Active',
    color: '#5865F2',
    tag: 'Official',
  },
  {
    name: 'Reddit - r/ScarsOfHonor',
    description: 'Community discussions, memes, build sharing, news, and speculation.',
    url: 'https://www.reddit.com/r/ScarsOfHonor/',
    members: 'Growing',
    color: '#FF4500',
    tag: 'Community',
  },
  {
    name: 'Steam Community',
    description: 'Steam forums, guides, screenshots, and workshop content.',
    url: 'https://store.steampowered.com/app/4253010/Scars_of_Honor/',
    members: 'All Players',
    color: '#1b2838',
    tag: 'Official',
  },
  {
    name: 'YouTube',
    description: 'Official trailers, gameplay reveals, dev diaries, and content creator videos.',
    url: 'https://www.youtube.com/@scarsofhonor',
    members: 'Videos',
    color: '#FF0000',
    tag: 'Official',
  },
  {
    name: 'Twitter / X',
    description: 'Quick updates, announcements, and community highlights from the dev team.',
    url: 'https://x.com/scars_of_honor',
    members: 'News',
    color: '#1DA1F2',
    tag: 'Official',
  },
];

const resources = [
  {
    name: 'ScarsHQ (This Site)',
    description: 'Item database, talent calculator, gear planner, crafting simulator, and build sharing tools.',
    url: '/',
    tag: 'Fan Site',
  },
  {
    name: 'Scars of Honor Wiki',
    description: 'Community wiki with lore, class guides, and game mechanics documentation.',
    url: 'https://scars-of-honor.fandom.com/',
    tag: 'Wiki',
  },
];

export default function CommunityPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-16 pb-8 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/5 to-void-black" />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Scars of Honor Community
          </h1>
          <p className="text-xl text-text-secondary">
            Find your people. Join the conversation.
          </p>
        </div>
      </section>

      {/* Community Hubs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-10">Community Hubs</h2>
        <div className="space-y-4">
          {communities.map((c) => (
            <a
              key={c.name}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <h3 className="font-heading text-lg text-text-primary">{c.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-dark-surface px-2 py-0.5 rounded">
                    {c.tag}
                  </span>
                  <span className="text-xs text-honor-gold">&rarr;</span>
                </div>
              </div>
              <p className="text-sm text-text-secondary">{c.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Fan Resources */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold text-center mb-10">Fan Resources</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {resources.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target={r.url.startsWith('/') ? undefined : '_blank'}
              rel={r.url.startsWith('/') ? undefined : 'noopener noreferrer'}
              className="bg-card-bg border border-border-subtle rounded-lg p-5 hover:border-honor-gold-dim transition-colors glow-gold-hover"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading text-sm text-text-primary">{r.name}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-honor-gold bg-honor-gold/10 px-2 py-0.5 rounded">
                  {r.tag}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{r.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-honor-gold mb-4">Ready to Play?</h2>
        <p className="text-text-secondary mb-8">
          The next playtest runs April 30 - May 11, 2026. Request access on the Steam page.
        </p>
        <a
          href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
        >
          Wishlist on Steam
        </a>
      </section>
    </div>
  );
}
