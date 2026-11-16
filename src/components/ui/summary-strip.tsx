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
 * Figures that summarise the list below. Deliberately not a card: it sits on
 * the page plane with hairline dividers, so the panels underneath stay the
 * heaviest thing on the screen.
 */
export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-y-6 rounded-[18px] border border-hairline bg-surface py-4 sm:px-1 sm:py-5 md:grid-cols-4 md:gap-y-0">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "px-4 sm:px-5",
            index % 2 === 1 && "border-l border-hairline md:border-l",
            index >= 2 && "md:border-l",
            index === 2 && "md:pl-4",
          )}
        >
          <p className="t-eyebrow flex items-center gap-1.5">
            {item.icon}
            {item.label}
          </p>
          <p className={cn("t-figure-sm mt-2.5 truncate tnum", TONE[item.tone ?? "default"])}>
            {item.value}
          </p>
          {item.caption ? <p className="t-caption mt-1.5 truncate">{item.caption}</p> : null}
        </div>
      ))}
    </div>
  );
}
