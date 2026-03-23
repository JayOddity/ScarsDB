export default function ItemsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-10 w-64 bg-card-bg rounded animate-pulse mb-2" />
      <div className="h-5 w-96 bg-card-bg rounded animate-pulse mb-8" />

      {/* Filter skeleton */}
      <div className="bg-card-bg border border-border-subtle rounded-lg p-4 mb-6">
        <div className="h-10 bg-dark-surface rounded-lg animate-pulse mb-3" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-dark-surface rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-14 bg-card-bg border border-border-subtle rounded animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
        ))}
      </div>
    </div>
  );
}
