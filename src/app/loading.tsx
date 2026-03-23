export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-border-subtle rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-honor-gold rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-text-muted text-sm font-heading">Loading...</p>
    </div>
  );
}
