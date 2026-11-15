import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SummaryItem {
  label: string;
  value: string;
  caption?: string;
  tone?: "default" | "good" | "critical" | "muted";
  icon?: ReactNode;
}

const TONE: Record<NonNullable<SummaryItem["tone"]>, string> = {
  default: "text-ink",
  good: "text-delta-up",
  critical: "text-delta-down",
  muted: "text-ink-secondary",
};

/**
 * Compact figure row above a register. Smaller than a dashboard KPI tile: these
 * summarise the list below rather than tracking a metric over time.
 */
export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-4 py-3">
          <p className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-muted">
            {item.icon}
            {item.label}
          </p>
          <p className={cn("mt-1.5 text-[17px] leading-none font-semibold tnum", TONE[item.tone ?? "default"])}>
            {item.value}
          </p>
          {item.caption ? (
            <p className="mt-1.5 truncate text-[10.5px] text-ink-muted">{item.caption}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
