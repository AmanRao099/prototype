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
 * One filter row above a register: search on the left, dimension filters next
 * to it, counts and actions on the right. Sits on the inset surface so the
 * table below reads as the content.
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
    <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-3">
      <label className="relative w-full sm:w-auto sm:min-w-[220px] sm:flex-1">
        <span className="sr-only">{searchPlaceholder}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="field field-pill w-full pr-3 pl-10"
        />
      </label>

      {filters.length > 0 ? (
        <div className="no-scrollbar -mx-1 flex w-full gap-2 overflow-x-auto px-1 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0">
          {filters.map((filter) => (
            <label key={filter.id} className="flex shrink-0 items-center">
              <span className="sr-only">{filter.label}</span>
              <select
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
                className="field field-pill select-field max-w-[62vw] pl-3.5 sm:max-w-none"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {children ? (
        <div className="flex w-full items-center gap-2 sm:w-auto sm:pl-1">{children}</div>
      ) : null}
    </div>
  );
}

export function ResultCount({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <p className="text-[12px] tnum text-ink-muted">
      {shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}
    </p>
  );
}
