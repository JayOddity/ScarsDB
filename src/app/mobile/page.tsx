import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scars of Honor Mobile - Is It on Mobile? Android & iOS | ScarsHQ',
  description: 'Is Scars of Honor available on mobile? Everything we know about Android, iOS, and console versions of Scars of Honor.',
  openGraph: {
    title: 'Scars of Honor Mobile - Is It on Android & iOS?',
    description: 'Is Scars of Honor available on mobile? Everything we know about Android, iOS, and console versions.',
    url: '/mobile',
    siteName: 'ScarsHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scars of Honor Mobile - Is It on Android & iOS?',
    description: 'Is Scars of Honor available on mobile? Everything we know about Android, iOS, and console versions.',
  },
  alternates: {
    canonical: '/mobile',
  },
};

export default function MobilePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-16 pb-8 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/5 to-void-black" />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-4">
            Scars of Honor on Mobile
          </h1>
          <p className="text-xl text-text-secondary">
            Is Scars of Honor available on mobile devices?
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>

        <div className="bg-card-bg border border-honor-gold/20 rounded-lg p-8 mb-8">
          <h2 className="font-heading text-xl text-honor-gold mb-4">Short Answer: Not Yet</h2>
          <p className="text-text-secondary mb-4">
            Scars of Honor is currently being developed for <strong className="text-text-primary">PC (Steam)</strong> only.
            There is no official mobile version for Android or iOS at this time.
          </p>
          <p className="text-text-secondary">
            The developers have not announced plans for a mobile port, but have expressed interest in bringing
            the game to additional platforms in the future.
          </p>
        </div>

        <h2 className="font-heading text-2xl text-honor-gold mb-6">Platform Status</h2>
        <div className="space-y-4 mb-12">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">PC (Steam)</h3>
              <p className="text-xs text-text-muted">Windows</p>
            </div>
            <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-3 py-1 rounded-full">Confirmed</span>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">PlayStation 5</h3>
              <p className="text-xs text-text-muted">Console</p>
            </div>
            <span className="text-xs font-semibold text-text-muted bg-dark-surface px-3 py-1 rounded-full">Not Announced</span>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Xbox Series X|S</h3>
              <p className="text-xs text-text-muted">Console</p>
            </div>
            <span className="text-xs font-semibold text-text-muted bg-dark-surface px-3 py-1 rounded-full">Not Announced</span>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Android</h3>
              <p className="text-xs text-text-muted">Mobile</p>
            </div>
            <span className="text-xs font-semibold text-text-muted bg-dark-surface px-3 py-1 rounded-full">Not Announced</span>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">iOS</h3>
              <p className="text-xs text-text-muted">Mobile</p>
            </div>
            <span className="text-xs font-semibold text-text-muted bg-dark-surface px-3 py-1 rounded-full">Not Announced</span>
          </div>
        </div>

        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>

        <h2 className="font-heading text-2xl text-honor-gold mb-6">How to Play Now</h2>
        <p className="text-text-secondary mb-6">
          The only way to play Scars of Honor is on PC through Steam. The next opportunity is the
          Spring 2026 Playtest.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://store.steampowered.com/app/4253010/Scars_of_Honor/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors text-center"
          >
            Wishlist on Steam
          </a>
          <Link
            href="/system-requirements"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors text-center"
          >
            System Requirements
          </Link>
        </div>
      </section>
    </div>
  );
}
