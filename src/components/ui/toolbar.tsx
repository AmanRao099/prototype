"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

export interface FilterSpec {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

/**
 * One filter row above a register: free-text search on the left, dimension
 * filters next to it, actions on the right.
 */
export function Toolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  filters = [],
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterSpec[];
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2.5">
      <label className="relative min-w-[200px] flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-hairline bg-plane py-1.5 pr-2 pl-8 text-[12px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
        />
      </label>

      {filters.map((filter) => (
        <label key={filter.id} className="flex items-center gap-1.5">
          <span className="sr-only">{filter.label}</span>
          <select
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            className="rounded-lg border border-hairline bg-plane px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function ResultCount({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <p className="text-[11px] text-ink-muted tnum">
      {shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}
    </p>
  );
}
