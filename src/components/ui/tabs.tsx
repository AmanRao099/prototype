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
        "inline-flex items-center gap-0.5 rounded-[10px] border border-hairline bg-control-track p-0.5",
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
              "rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors",
              selected
                ? "bg-control-active text-ink shadow-panel"
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
