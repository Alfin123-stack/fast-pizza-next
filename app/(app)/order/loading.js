// Skeleton shown while a page streams in. Respects reduced motion (see globals.css).
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="space-y-6">
        <div className="h-12 w-2/3 max-w-sm animate-pulse rounded-input bg-flour" />
        <div className="h-5 w-1/2 max-w-xs animate-pulse rounded-input bg-flour" />
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-card bg-flour" />
          ))}
        </div>
      </div>
    </div>
  );
}
