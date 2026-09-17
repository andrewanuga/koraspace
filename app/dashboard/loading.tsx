export default function DashboardLoading() {
  return (
    <main
      className="mx-auto w-full max-w-[1440px] space-y-6 pb-12"
      aria-busy="true"
      aria-label="Loading workspace..."
    >
      {/* Hero Header Skeleton */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400/40 animate-pulse" />
            <div className="skeleton-shimmer h-3 w-28 rounded-full" />
          </div>
          <div className="skeleton-shimmer h-9 w-64 rounded-xl sm:w-80" />
          <div className="skeleton-shimmer h-4 w-48 rounded-lg sm:w-72" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="skeleton-shimmer h-9 w-24 rounded-xl" />
          <div className="skeleton-shimmer h-9 w-28 rounded-xl" />
          <div className="skeleton-shimmer h-9 w-32 rounded-xl" />
        </div>
      </section>

      {/* KPI Cards Skeleton (4 columns) */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
              <div className="skeleton-shimmer h-5 w-14 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton-shimmer h-3 w-16 rounded" />
              <div className="skeleton-shimmer h-7 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </section>

      {/* 3-Column Insights Row */}
      <section className="grid gap-4 xl:grid-cols-3">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 space-y-4 min-h-[260px]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="skeleton-shimmer h-4 w-36 rounded-md" />
                <div className="skeleton-shimmer h-3 w-24 rounded" />
              </div>
              <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="skeleton-shimmer h-12 w-full rounded-xl" />
              <div className="skeleton-shimmer h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </section>

      {/* Schedule + Quick Actions Row */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.75fr)]">
        {/* Scheduled Posts Skeleton */}
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--stroke)] pb-4">
            <div className="space-y-1.5">
              <div className="skeleton-shimmer h-4 w-44 rounded-md" />
              <div className="skeleton-shimmer h-3 w-28 rounded" />
            </div>
            <div className="skeleton-shimmer h-4 w-20 rounded" />
          </div>

          <div className="space-y-3 pt-1">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-[var(--stroke)]/50 last:border-0">
                <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="skeleton-shimmer h-3.5 w-3/4 rounded" />
                  <div className="skeleton-shimmer h-2.5 w-1/3 rounded" />
                </div>
                <div className="skeleton-shimmer h-6 w-16 rounded-lg hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 space-y-3">
          <div className="space-y-1.5 mb-2">
            <div className="skeleton-shimmer h-4 w-28 rounded-md" />
            <div className="skeleton-shimmer h-3 w-20 rounded" />
          </div>

          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="skeleton-shimmer h-11 w-full rounded-xl" />
          ))}
        </div>
      </section>
    </main>
  );
}
