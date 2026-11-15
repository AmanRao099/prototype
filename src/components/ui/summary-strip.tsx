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
 * Compact figure row above a register. Lighter than a dashboard KPI tile:
 * these summarise the list below rather than tracking a metric over time.
 */
export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-hairline bg-surface shadow-panel md:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "px-4 py-3.5",
            index % 2 === 1 && "border-l border-hairline",
            index >= 2 && "border-t border-hairline md:border-t-0",
            index >= 1 && "md:border-l md:border-hairline",
          )}
        >
          <p className="t-eyebrow flex items-center gap-1.5">
            {item.icon}
            {item.label}
          </p>
          <p className={cn("t-figure-sm mt-2 tnum", TONE[item.tone ?? "default"])}>{item.value}</p>
          {item.caption ? <p className="t-caption mt-1.5 truncate">{item.caption}</p> : null}
        </div>
      ))}
    </div>
  );
}
