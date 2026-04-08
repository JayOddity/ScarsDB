import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div>
      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm text-text-muted">
          <li>
            <Link href="/" className="hover:text-honor-gold transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="text-text-secondary">{title}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-honor-gold/5 to-void-black" />
        <div className="relative max-w-6xl mx-auto">
          <h1 className="font-heading text-3xl md:text-5xl text-honor-gold mb-6">
            {title}
          </h1>
          <span className="inline-block px-4 py-1.5 bg-honor-gold/10 border border-honor-gold/30 text-honor-gold text-sm font-heading rounded-full mb-6">
            Coming Soon
          </span>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
      </section>

      {/* Placeholder Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="diamond-divider mb-8">
          <span className="diamond" />
        </div>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-honor-gold/10 text-honor-gold rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
            🚧
          </div>
          <h2 className="font-heading text-xl text-text-primary mb-3">Under Construction</h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            This section is currently being built. Check back soon for updates, or follow our progress on Discord.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 border border-border-subtle text-text-secondary font-heading text-sm rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
            >
              Back to Home
            </Link>
            <a
              href="https://discord.com/invite/jDSuQVgwHF"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-honor-gold text-void-black font-heading text-sm font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
            >
              Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
