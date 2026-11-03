// Placeholder shaped like the real menu: toolbar, then cards (grid) or rows (list). Pulses stop under reduced motion (globals.css).
export default function MenuSkeleton({ view = "grid", count }) {
  const n = count ?? (view === "list" ? 6 : 9);
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading the menu…</span>
      <div aria-hidden="true">
        {view === "list" ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-card bg-flour p-3">
                <div className="size-20 shrink-0 animate-pulse rounded-input bg-oven-dark/10" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-1/2 animate-pulse rounded-input bg-oven-dark/10" />
                  <div className="h-3 w-3/4 animate-pulse rounded-input bg-oven-dark/10" />
                </div>
                <div className="h-9 w-20 animate-pulse rounded-pill bg-oven-dark/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="flex max-w-sm flex-col overflow-hidden rounded-card bg-flour">
                <div className="h-48 animate-pulse bg-oven-dark/10" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-5 w-1/3 animate-pulse rounded-input bg-oven-dark/10" />
                  <div className="h-4 w-2/3 animate-pulse rounded-input bg-oven-dark/10" />
                  <div className="h-3 w-1/4 animate-pulse rounded-input bg-oven-dark/10" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
