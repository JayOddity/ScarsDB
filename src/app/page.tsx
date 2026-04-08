import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity';
import { getSteamNews } from '@/lib/steamNews';
import PopularItems from '@/components/PopularItems';
import NewsletterSignup from '@/components/NewsletterSignup';
import PlaytestCountdown from '@/components/PlaytestCountdown';

export const metadata: Metadata = {
  title: 'ScarsHQ - Scars of Honor Database & Tools',
  description: 'Talent calculator, item database, class guides, and community tools for Scars of Honor MMORPG. 10 classes, 240+ talent nodes, 1600+ items.',
  alternates: { canonical: '/' },
};

interface SanityNews {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  featuredImage?: { asset: { _ref: string } };
  publishedAt?: string;
}

interface FeedItem {
  id: string;
  title: string;
  excerpt?: string;
  date: string;
  source: 'sanity' | 'steam';
  href: string;
  image?: string;
}

export const revalidate = 300; // revalidate every 5 minutes

// Rotating fallback images from Steam store screenshots so cards without images aren't all identical
const STEAM_FALLBACK_IMAGES = [
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/aaa1fdfd5dd8340a52e24bb77189df6d2b1b17b1/header.jpg',
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/fbca4c46c3bf3fb7437c5214aac988e9d0895662/ss_fbca4c46c3bf3fb7437c5214aac988e9d0895662.600x338.jpg',
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/af3af98dd1a4fb53e77e88dc7b3d0b693e1f321d/ss_af3af98dd1a4fb53e77e88dc7b3d0b693e1f321d.600x338.jpg',
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/0b141852523822bf7e1855bc288f4609b6751d79/ss_0b141852523822bf7e1855bc288f4609b6751d79.600x338.jpg',
];

// Extract best thumbnail from Steam post: YouTube > Steam clan image > game screenshot
function getSteamImage(contents: string, index: number = 0): string {
  // YouTube from [previewyoutube] tag
  const yt = contents.match(/\[previewyoutube="?([\w-]+)/);
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;

  // YouTube from embed URL
  const ytEmbed = contents.match(/youtube\.com\/embed\/([\w-]+)/);
  if (ytEmbed) return `https://img.youtube.com/vi/${ytEmbed[1]}/hqdefault.jpg`;

  // YouTube from watch URL
  const ytWatch = contents.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return `https://img.youtube.com/vi/${ytWatch[1]}/hqdefault.jpg`;

  // youtu.be short links
  const ytShort = contents.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return `https://img.youtube.com/vi/${ytShort[1]}/hqdefault.jpg`;

  // First Steam clan image
  const steamImg = contents.match(/\{STEAM_CLAN_IMAGE\}\/([^\s"\]]+)/);
  if (steamImg) return `https://clan.akamai.steamstatic.com/images/${steamImg[1]}`;

  // Fallback to rotating game screenshots
  return STEAM_FALLBACK_IMAGES[index % STEAM_FALLBACK_IMAGES.length];
}

// Strip Steam BBCode for excerpt
function stripSteamMarkup(text: string): string {
  return text
    .replace(/\[previewyoutube[^\]]*\]\s*\[\/previewyoutube\]/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\{STEAM_CLAN_IMAGE\}[^\s"]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function HomePage() {
  const [sanityNews, steamNews] = await Promise.all([
    sanityClient.fetch<SanityNews[]>(
      `*[_type == "newsPost"] | order(publishedAt desc) [0...20] {
        _id, title, slug, excerpt, featuredImage, publishedAt
      }`,
    ),
    getSteamNews(),
  ]);

  // Merge into unified feed
  const feed: FeedItem[] = [];

  for (const post of sanityNews) {
    feed.push({
      id: post._id,
      title: post.title,
      excerpt: post.excerpt,
      date: post.publishedAt || '',
      source: 'sanity',
      href: `/news/${post.slug.current}`,
      image: post.featuredImage?.asset ? urlFor(post.featuredImage).width(224).height(160).url() : undefined,
    });
  }

  steamNews.forEach((item, i) => {
    feed.push({
      id: `steam-${item.gid}`,
      title: item.title,
      excerpt: stripSteamMarkup(item.contents).slice(0, 200),
      date: new Date(item.date * 1000).toISOString(),
      source: 'steam',
      href: item.url,
      image: getSteamImage(item.contents, i),
    });
  });

  // Sort newest first
  feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Playtest Countdown */}
      <PlaytestCountdown />

      {/* Things to check out */}
      <section className="mb-12">
        <h2 className="font-heading text-xl text-honor-gold mb-4">Things to Check Out</h2>
        <div className="grid grid-cols-3 gap-4">
          <Link href="/#news" className="group relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-honor-gold-dim transition-colors">
            <Image src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/aaa1fdfd5dd8340a52e24bb77189df6d2b1b17b1/header.jpg" alt="News" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-heading text-2xl text-white">News</span>
          </Link>
          <Link href="/classes" className="group relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-honor-gold-dim transition-colors">
            <Image src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/af3af98dd1a4fb53e77e88dc7b3d0b693e1f321d/ss_af3af98dd1a4fb53e77e88dc7b3d0b693e1f321d.600x338.jpg" alt="Classes" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-heading text-2xl text-white">Classes</span>
          </Link>
          <Link href="/talents" className="group relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-honor-gold-dim transition-colors">
            <Image src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/0b141852523822bf7e1855bc288f4609b6751d79/ss_0b141852523822bf7e1855bc288f4609b6751d79.600x338.jpg" alt="Talent Calculator" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-heading text-2xl text-white">Talent Calculator</span>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Link href="/scars-of-honor-release-date" className="group relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-honor-gold-dim transition-colors">
            <Image src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/fbca4c46c3bf3fb7437c5214aac988e9d0895662/ss_fbca4c46c3bf3fb7437c5214aac988e9d0895662.600x338.jpg" alt="Release Date" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-heading text-2xl text-white">Release Date</span>
          </Link>
          <Link href="/gameplay" className="group relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-honor-gold-dim transition-colors">
            <Image src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/0b141852523822bf7e1855bc288f4609b6751d79/ss_0b141852523822bf7e1855bc288f4609b6751d79.600x338.jpg" alt="Gameplay" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-heading text-2xl text-white">Gameplay</span>
          </Link>
          <a href="https://store.steampowered.com/app/4253010/Scars_of_Honor/" target="_blank" rel="noopener noreferrer" className="group relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-honor-gold-dim transition-colors">
            <Image src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/4253010/aaa1fdfd5dd8340a52e24bb77189df6d2b1b17b1/header.jpg" alt="Steam" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-black/70" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Image src="/Icons/steam-logo.svg" alt="" width={48} height={48} className="opacity-90 mb-2" />
              <span className="font-heading text-lg text-white">Steam Page</span>
            </div>
          </a>
        </div>
      </section>

      {/* News feed */}
      <section id="news" className="mb-12 scroll-mt-20">
        <h1 className="font-heading text-2xl text-honor-gold mb-6">Latest News</h1>

        {feed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feed.slice(0, 9).map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col bg-card-bg border border-border-subtle rounded-lg overflow-hidden hover:border-honor-gold-dim transition-colors glow-gold-hover group"
                >
                  {item.image ? (
                    <div className="w-full aspect-video bg-dark-surface overflow-hidden relative">
                      <Image src={item.image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                  ) : (
                    <div className="w-full aspect-video bg-dark-surface flex items-center justify-center">
                      <span className="text-2xl text-text-muted">📰</span>
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-sm font-medium text-text-primary group-hover:text-honor-gold transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="text-xs text-text-muted line-clamp-2 mb-3 flex-1">{item.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 mt-auto">
                      {item.date && (
                        <span className="text-[11px] text-text-muted">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.source === 'steam'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-honor-gold/10 text-honor-gold'
                      }`}>
                        {item.source === 'steam' ? 'Steam' : 'ScarsHQ'}
                      </span>
                    </div>
                  </div>
                </Link>
            ))}
          </div>
        ) : (
          <div className="bg-card-bg border border-border-subtle rounded-lg p-8 text-center">
            <p className="text-text-muted">No news available right now.</p>
          </div>
        )}
      </section>

      {/* Popular Items */}
      <section className="mb-12">
        <PopularItems />
      </section>

      {/* Newsletter */}
      <section>
        <NewsletterSignup />
      </section>
    </div>
  );
}
