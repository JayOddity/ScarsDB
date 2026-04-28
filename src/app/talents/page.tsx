import Link from 'next/link';

export const metadata = {
  title: 'Talent Calculator (Coming Soon) - ScarsHQ',
  description: 'The ScarsHQ talent calculator is being rebuilt. Check back closer to launch for class-by-class talent trees and shareable builds.',
  alternates: { canonical: '/talents' },
};

export default function TalentsWipPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-16 text-center">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">Talent Calculator — Coming Soon</h1>
      <p className="text-text-secondary mb-3">
        We&apos;re rebuilding the talent calculator from scratch using first-party game data. While that work is underway, this page is offline.
      </p>
      <p className="text-text-muted text-sm mb-8">
        Builds, gear planning, and the rest of the site are unaffected.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link href="/" className="px-4 py-2 border border-border-subtle rounded text-sm text-text-secondary hover:border-honor-gold-dim hover:text-honor-gold transition-colors">
          Back to home
        </Link>
        <Link href="/classes" className="px-4 py-2 border border-honor-gold-dim rounded text-sm text-honor-gold hover:bg-honor-gold/10 transition-colors">
          Browse classes
        </Link>
      </div>
    </div>
  );
}
