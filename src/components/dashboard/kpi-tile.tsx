import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { formatMoneyCompact, formatMoneyWhole, formatPercent } from "@/lib/format";
import type { Kpi } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Stat tile. The number is the chart; the sparkline only shows shape.
 * A delta is coloured only when the metric declares a direction
 * (`riseIsGood`), and the arrow icon plus the sign carry it without colour.
 */
export function KpiTile({ kpi, comparisonLabel }: { kpi: Kpi; comparisonLabel: string }) {
  const delta = kpi.deltaPct;
  const hasDirection = typeof delta === "number" && typeof kpi.riseIsGood === "boolean";
  const isFavourable = hasDirection ? delta > 0 === kpi.riseIsGood : undefined;
  const DeltaIcon = delta === undefined ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
          {kpi.label}
        </p>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate text-[26px] leading-none font-semibold tracking-tight text-ink"
            title={formatMoneyWhole(kpi.value)}
          >
            {formatMoneyCompact(kpi.value)}
          </p>
          {delta !== undefined ? (
            <p className="mt-2 flex items-center gap-1.5 text-[11px]">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium tnum",
                  isFavourable === undefined
                    ? "text-ink-secondary"
                    : isFavourable
                      ? "text-delta-up"
                      : "text-delta-down",
                )}
              >
                <DeltaIcon className="size-3" aria-hidden />
                {formatPercent(delta)}
              </span>
              <span className="truncate text-ink-muted">{comparisonLabel}</span>
            </p>
          ) : null}
        </div>
        {kpi.trend ? (
          <Sparkline
            values={kpi.trend}
            stroke={
              isFavourable === false ? "var(--series-2)" : "var(--series-1)"
            }
          />
        ) : null}
      </div>

      {kpi.caption ? (
        <p className="mt-3 truncate border-t border-hairline pt-2.5 text-[11px] text-ink-secondary">
          {kpi.caption}
        </p>
      ) : null}
    </>
  );

  const shell =
    "flex min-w-0 flex-col rounded-xl border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(11,11,11,0.04)]";

  if (!kpi.href) return <div className={shell}>{body}</div>;

  return (
    <Link
      href={kpi.href}
      className={cn(shell, "transition-colors hover:border-hairline-strong hover:bg-surface-2/40")}
    >
      {body}
    </Link>
  );
}
