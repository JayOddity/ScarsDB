export default function ClassesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-10 w-64 bg-card-bg rounded animate-pulse mb-4" />
      <div className="h-5 w-full max-w-xl bg-card-bg rounded animate-pulse mb-8" />

      <div className="flex flex-wrap gap-2 mb-12">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-card-bg border border-border-subtle rounded-lg animate-pulse" />
        ))}
      </div>

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card-bg border border-border-subtle rounded-lg p-8 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="h-8 w-48 bg-dark-surface rounded mb-4" />
            <div className="h-4 w-full bg-dark-surface rounded mb-6" />
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-24 bg-dark-surface/50 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
