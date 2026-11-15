"use client";

import type { CSSProperties } from "react";
import { clamp } from "@/lib/scale";

export interface TooltipRow {
  name: string;
  value: string;
  color?: string;
}

/**
 * Hover layer shared by the charts. Positioned in container percentages so it
 * tracks the mark at any width, and flipped away from the right edge.
 */
export function ChartTooltip({
  title,
  rows,
  xPct,
  yPct = 0,
  visible,
}: {
  title: string;
  rows: TooltipRow[];
  xPct: number;
  yPct?: number;
  visible: boolean;
}) {
  if (!visible) return null;

  const flip = xPct > 62;
  const style: CSSProperties = {
    left: `${clamp(xPct, 0, 100)}%`,
    top: `${clamp(yPct, 0, 100)}%`,
    transform: `translate(${flip ? "-100%" : "0"}, 0) translate(${flip ? -10 : 10}px, -4px)`,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute z-20 min-w-[148px] rounded-lg border border-hairline-strong bg-surface p-2.5 shadow-[0_6px_18px_rgba(11,11,11,0.12)]"
      style={style}
    >
      <p className="mb-1.5 text-[11px] font-semibold text-ink">{title}</p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-ink-secondary">
              {row.color ? (
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ background: row.color }}
                />
              ) : null}
              {row.name}
            </span>
            <span className="font-medium tnum text-ink">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
