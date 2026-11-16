"use client";

import { cn } from "@/lib/utils";

export interface TabSpec {
  id: string;
  label: string;
  count?: number;
}

/**
 * Segmented control for switching views inside a screen. The track carries the
 * grouping; the selected segment lifts onto the panel surface.
 */
export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabSpec[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "no-scrollbar inline-flex w-fit max-w-full items-center gap-1 self-start overflow-x-auto rounded-full bg-control-track p-[3px]",
        className,
      )}
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-medium whitespace-nowrap sm:py-1.5",
              selected
                ? "bg-control-active text-ink"
                : "text-ink-muted hover:text-ink-secondary",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className={cn("ml-1.5 tnum", selected ? "text-ink-muted" : "text-ink-muted/70")}>
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
