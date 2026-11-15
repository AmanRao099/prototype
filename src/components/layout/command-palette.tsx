"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { NavIcon } from "@/components/layout/icon";
import { PhaseBadge } from "@/components/ui/badge";
import { ALL_NAV_ITEMS, ALL_SECTIONS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Section title for an item, used as the secondary line in results. */
const SECTION_OF = new Map<string, string>(
  ALL_SECTIONS.flatMap((section) => section.items.map((item) => [item.href, section.title] as const)),
);

function score(item: NavItem, needle: string): number {
  const label = item.label.toLowerCase();
  const moduleName = item.moduleName.toLowerCase();
  if (label.startsWith(needle)) return 0;
  if (moduleName.startsWith(needle)) return 1;
  if (label.includes(needle)) return 2;
  if (moduleName.includes(needle)) return 3;
  if ((item.keywords ?? "").includes(needle)) return 4;
  // Deliberately not searching the full feature text: nearly every module
  // mentions "VAT" or "stock" somewhere, which drowns the real match.
  return -1;
}

/**
 * Jump-to-module palette. One keystroke reaches any of the 29 modules, which is
 * what lets the sidebar stay short instead of listing everything at once.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const needle = query.trim().toLowerCase();
  const results = needle
    ? ALL_NAV_ITEMS.map((item) => ({ item, rank: score(item, needle) }))
        .filter((entry) => entry.rank >= 0)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 8)
        .map((entry) => entry.item)
    : ALL_NAV_ITEMS.slice(0, 8);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  function go(item: NavItem) {
    onClose();
    setQuery("");
    setActive(0);
    router.push(item.href);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Go to module"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-hairline-strong bg-surface shadow-raised"
      >
        <div className="flex items-center gap-2 border-b border-hairline px-3">
          <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((current) => Math.min(current + 1, results.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((current) => Math.max(current - 1, 0));
              }
              if (event.key === "Enter" && results[active]) go(results[active]);
            }}
            placeholder="Go to module, report or setting"
            className="h-11 w-full bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="hidden rounded border border-hairline px-1.5 py-0.5 text-[10px] text-ink-muted sm:block">
            Esc
          </kbd>
        </div>

        <ul className="max-h-[340px] overflow-y-auto py-1.5">
          {results.map((item, index) => (
            <li key={item.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => go(item)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left",
                  index === active ? "bg-surface-2" : "",
                )}
              >
                <NavIcon name={item.icon} className="size-4 shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-ink">{item.label}</span>
                  <span className="block truncate text-[10.5px] text-ink-muted">
                    {SECTION_OF.get(item.href) ?? "Overview"} · {item.moduleName}
                  </span>
                </span>
                {item.phase !== "mvp" ? <PhaseBadge phase={item.phase} compact /> : null}
                {index === active ? (
                  <CornerDownLeft className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                ) : null}
              </button>
            </li>
          ))}
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-[12px] text-ink-muted">
              No module matches “{query}”.
            </li>
          ) : null}
        </ul>

        <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-3 py-2 text-[10.5px] text-ink-muted">
          <span>Arrow keys to move, Enter to open</span>
          <span>{ALL_NAV_ITEMS.length} modules</span>
        </div>
      </div>
    </div>
  );
}
