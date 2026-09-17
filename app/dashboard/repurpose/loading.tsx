export default function RepurposeLoading() {
  return (
    <div className="mx-auto max-w-[1600px] animate-pulse space-y-8 pb-12">
      {/* Hero Skeleton */}
      <div className="h-56 rounded-[28px] border border-[var(--stroke)] bg-[var(--panel-fill)]" />

      {/* Main Grid Skeleton */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="h-[420px] rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)]" />
          <div className="h-[300px] rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)]" />
        </div>

        <div className="space-y-6">
          <div className="h-[520px] rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)]" />
          <div className="h-[200px] rounded-2xl border border-[var(--stroke)] bg-[var(--panel-fill)]" />
        </div>
      </div>
    </div>
  );
}
