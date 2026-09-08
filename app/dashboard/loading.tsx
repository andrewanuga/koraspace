export default function DashboardLoading() {
  return (
    <div
      className="mx-auto w-full max-w-[1600px] space-y-6"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Welcome / header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="skeleton-shimmer h-9 w-64 rounded-lg sm:w-80" />
          <div className="skeleton-shimmer h-4 w-48 rounded-md sm:w-72" />
        </div>

        <div className="flex items-center gap-3">
          <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
          <div className="skeleton-shimmer h-10 w-10 rounded-xl sm:hidden" />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-4 sm:p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="skeleton-shimmer h-3 w-20 rounded" />
                <div className="skeleton-shimmer h-8 w-24 rounded-md" />
                <div className="skeleton-shimmer h-3 w-16 rounded" />
              </div>

              <div className="skeleton-shimmer h-9 w-9 rounded-xl" />
            </div>
          </div>
        ))}
      </section>

      {/* Main dashboard content */}
      <section className="grid gap-5 xl:grid-cols-12">
        {/* Left large content */}
        <div className="space-y-5 xl:col-span-8">
          {/* Performance / analytics */}
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="skeleton-shimmer h-5 w-44 rounded-md" />
                <div className="skeleton-shimmer h-3 w-28 rounded" />
              </div>

              <div className="skeleton-shimmer h-7 w-16 rounded-full" />
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-2">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="skeleton-shimmer h-8 w-20 rounded-full"
                />
              ))}
            </div>

            {/* Fake chart */}
            <div className="relative h-[240px] overflow-hidden rounded-xl border border-[var(--stroke)]/60">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-px w-full bg-[var(--stroke)]/50"
                  />
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="absolute bottom-8 left-[8%] right-[8%]">
                <div className="skeleton-chart h-24 w-full rounded-t-[2rem]" />
              </div>

              {/* Labels */}
              <div className="absolute bottom-3 left-[8%] right-[8%] flex justify-between">
                {[0, 1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="skeleton-shimmer h-2.5 w-8 rounded"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Scheduled content */}
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="skeleton-shimmer h-5 w-48 rounded-md" />
              <div className="skeleton-shimmer h-4 w-14 rounded" />
            </div>

            <div className="space-y-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-b border-[var(--stroke)]/60 pb-4 last:border-0 last:pb-0"
                >
                  <div className="skeleton-shimmer h-11 w-11 shrink-0 rounded-xl" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="skeleton-shimmer h-3.5 w-[70%] rounded" />
                    <div className="skeleton-shimmer h-3 w-[45%] rounded" />
                  </div>

                  <div className="hidden sm:block">
                    <div className="skeleton-shimmer h-7 w-20 rounded-full" />
                  </div>

                  <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <aside className="space-y-5 xl:col-span-4">
          {/* AI recommendations */}
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="skeleton-shimmer h-5 w-40 rounded-md" />
              <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
            </div>

            <div className="space-y-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex gap-3">
                  <div className="skeleton-shimmer h-9 w-9 shrink-0 rounded-xl" />

                  <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-3.5 w-full rounded" />
                    <div className="skeleton-shimmer h-3 w-[65%] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 sm:p-6">
            <div className="mb-5 skeleton-shimmer h-5 w-28 rounded-md" />

            <div className="space-y-3">
              <div className="skeleton-pink h-12 w-full rounded-xl" />

              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="skeleton-shimmer h-12 w-full rounded-xl"
                />
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)] p-5 sm:p-6">
            <div className="mb-5 flex justify-between">
              <div className="skeleton-shimmer h-5 w-28 rounded-md" />
              <div className="skeleton-shimmer h-4 w-12 rounded" />
            </div>

            <div className="space-y-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="skeleton-shimmer h-9 w-9 rounded-xl" />

                  <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-3.5 w-24 rounded" />
                    <div className="skeleton-shimmer h-3 w-16 rounded" />
                  </div>

                  <div className="skeleton-shimmer h-5 w-5 rounded" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}