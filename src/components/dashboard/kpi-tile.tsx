import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { formatMoneyCompact, formatMoneyWhole, formatPercent } from "@/lib/format";
import type { Kpi } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Stat tile. The number is the chart; the sparkline only carries shape.
 * A delta is coloured only when the metric declares a direction
 * (`riseIsGood`); the arrow and the sign carry it without colour.
 */
export function KpiTile({ kpi, comparisonLabel }: { kpi: Kpi; comparisonLabel: string }) {
  const delta = kpi.deltaPct;
  const hasDirection = typeof delta === "number" && typeof kpi.riseIsGood === "boolean";
  const isFavourable = hasDirection ? delta > 0 === kpi.riseIsGood : undefined;
  const DeltaIcon = delta !== undefined && delta < 0 ? ArrowDownRight : ArrowUpRight;

  const body = (
    <>
      <p className="t-eyebrow truncate">{kpi.label}</p>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="t-figure truncate tnum" title={formatMoneyWhole(kpi.value)}>
            {formatMoneyCompact(kpi.value)}
          </p>
          {delta !== undefined ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-[11px]">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tnum",
                  isFavourable === undefined
                    ? "bg-surface-2 text-ink-secondary"
                    : isFavourable
                      ? "bg-good/10 text-delta-up"
                      : "bg-critical/10 text-delta-down",
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
            stroke={isFavourable === false ? "var(--series-2)" : "var(--series-1)"}
          />
        ) : null}
      </div>

      {kpi.caption ? (
        <p className="t-caption mt-3.5 truncate border-t border-hairline pt-2.5">{kpi.caption}</p>
      ) : null}
    </>
  );

  const shell =
    "flex min-w-0 flex-col rounded-[18px] border border-hairline bg-surface p-5";

  if (!kpi.href) return <div className={shell}>{body}</div>;

  return (
    <Link
      href={kpi.href}
      className={cn(shell, "transition-colors hover:border-hairline-strong hover:bg-surface-raised")}
    >
      {body}
    </Link>
  );
}
