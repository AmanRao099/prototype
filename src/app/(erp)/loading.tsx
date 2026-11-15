/**
 * Route-level skeleton. Mirrors the common page shape - header, figure strip,
 * two panels - so a slow API swap does not blank the screen.
 */
export default function Loading() {
  return (
    <div className="flex animate-[none] flex-col gap-4" aria-busy aria-label="Loading">
      <div className="flex items-end justify-between gap-4">
        <div className="w-full max-w-sm">
          <div className="skeleton h-5 w-44" />
          <div className="skeleton mt-2 h-3 w-72" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-[30px] w-24 rounded-lg" />
          <div className="skeleton h-[30px] w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-[18px] border border-hairline bg-surface md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border-hairline px-4 py-3.5 not-first:border-l">
            <div className="skeleton h-2.5 w-20" />
            <div className="skeleton mt-3 h-5 w-28" />
            <div className="skeleton mt-3 h-2.5 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="rounded-[18px] border border-hairline bg-surface p-5 xl:col-span-2">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton mt-4 h-[220px] w-full rounded-lg" />
        </div>
        <div className="rounded-[18px] border border-hairline bg-surface p-5">
          <div className="skeleton h-3 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-3 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
