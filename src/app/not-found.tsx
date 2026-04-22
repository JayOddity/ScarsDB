import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <h1 className="font-heading text-6xl text-honor-gold mb-4">404</h1>
        <div className="diamond-divider mb-6">
          <span className="diamond" />
        </div>
        <h2 className="font-heading text-2xl text-text-primary mb-2">Lost in the Wilds of Aragon</h2>
        <p className="text-text-secondary mb-8 max-w-md">
          The page you seek has been claimed by the void. Perhaps it was never forged,
          or maybe it crumbled like the ruins of the old world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/database"
            className="px-6 py-3 border border-border-subtle text-text-secondary font-heading rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            Browse Items
          </Link>
          <Link
            href="/classes"
            className="px-6 py-3 border border-border-subtle text-text-secondary font-heading rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            Explore Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
