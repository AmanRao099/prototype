"use client";

import { cn } from "@/lib/utils";

export interface TabSpec {
  id: string;
  label: string;
  count?: number;
}

/** Local view switch inside a screen (cash book / bank book, VAT boxes / codes). */
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
    <div role="tablist" className={cn("flex flex-wrap items-center gap-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            active === tab.id
              ? "bg-accent-wash text-accent"
              : "text-ink-secondary hover:bg-surface-2 hover:text-ink",
          )}
        >
          {tab.label}
          {tab.count !== undefined ? (
            <span className="ml-1.5 tnum text-ink-muted">{tab.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
