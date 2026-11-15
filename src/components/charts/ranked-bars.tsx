import { niceCeil } from "@/lib/scale";

export interface RankedBar {
  id: string;
  label: string;
  value: number;
  /** Secondary text shown beside the bar - counts, utilisation, days. */
  meta?: string;
}

/**
 * Ranked horizontal bars, one series in one colour. Plain HTML: the row is the
 * mark, the value is direct-labelled, the track is a hairline wash. No value
 * ramp - bar length already encodes magnitude.
 */
export function RankedBars({
  bars,
  formatValue,
  color = "var(--series-1)",
}: {
  bars: RankedBar[];
  formatValue: (value: number) => string;
  color?: string;
}) {
  const max = niceCeil(Math.max(...bars.map((bar) => bar.value), 1));

  return (
    <ul className="flex flex-col gap-3">
      {bars.map((bar) => (
        <li key={bar.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3">
          <p className="truncate text-[12px] text-ink">{bar.label}</p>
          <p className="text-[12px] font-medium tnum text-ink">{formatValue(bar.value)}</p>
          <div className="col-span-2 mt-1.5 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${Math.max((bar.value / max) * 100, 1.5)}%`, background: color }}
              />
            </div>
            {bar.meta ? (
              <span className="w-[116px] shrink-0 text-right text-[10.5px] text-ink-muted">
                {bar.meta}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
