import { devPosts } from '@/data/devTracker';

export const metadata = {
  title: 'Dev Tracker — ScarsDB',
  description: 'Verified developer quotes and updates from Beast Burst Entertainment.',
};

export default function TrackerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-2">Community & Dev Tracker</h1>
      <p className="text-text-secondary mb-8">
        Verified updates from Beast Burst Entertainment developers. All quotes sourced from official channels.
      </p>

      <div className="space-y-4">
        {devPosts.map((post) => (
          <article
            key={post.id}
            className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-semibold px-2 py-1 rounded"
                style={{ backgroundColor: post.categoryColor + '20', color: post.categoryColor }}
              >
                {post.category}
              </span>
              <span className="text-xs text-text-muted">{post.date}</span>
            </div>

            <blockquote className="text-text-secondary leading-relaxed mb-4 text-sm border-l-2 border-honor-gold-dim pl-4">
              &ldquo;{post.quote}&rdquo;
            </blockquote>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-surface rounded-full flex items-center justify-center text-sm text-honor-gold font-bold">
                  BB
                </div>
                <div>
                  <p className="text-sm text-text-primary font-medium">{post.author}</p>
                  <p className="text-xs text-text-muted">{post.title}</p>
                </div>
              </div>
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-text-muted hover:text-honor-gold transition-colors"
              >
                {post.source} ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
