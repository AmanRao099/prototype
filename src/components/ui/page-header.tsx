"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Info, MoreHorizontal } from "lucide-react";
import { PhaseBadge } from "@/components/ui/badge";
import { PHASE_LABEL, findNavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * One header for every screen.
 *
 * The long feature list from the scope workbook used to sit under each title as
 * a 140-character sentence nobody reads twice. It now lives behind a "Scope"
 * disclosure, together with the delivery phase, which the header reads from the
 * module registry rather than from per-page props.
 */
export function PageHeader({
  title,
  subtitle,
  note,
  actions,
  secondaryActions,
}: {
  title: string;
  /** One short line. Keep it under about 60 characters. */
  subtitle?: string;
  /** Delivery caveat for this module, shown inside the scope disclosure. */
  note?: string;
  /** The primary action, shown as a button. */
  actions?: ReactNode;
  /** Everything else, folded into an overflow menu. */
  secondaryActions?: Array<{ label: string; icon?: ReactNode }>;
}) {
  const pathname = usePathname();
  const match = findNavItem(pathname);
  const item = match?.item;
  const [scopeOpen, setScopeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="t-page-title">{title}</h1>
            {item && item.phase !== "mvp" ? <PhaseBadge phase={item.phase} /> : null}
          </div>
          {subtitle ? <p className="t-caption mt-1">{subtitle}</p> : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {item || note ? (
            <button
              type="button"
              onClick={() => setScopeOpen((open) => !open)}
              aria-expanded={scopeOpen}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium sm:h-[34px]",
                scopeOpen ? "bg-surface-2 text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Info className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Scope</span>
            </button>
          ) : null}

          {secondaryActions && secondaryActions.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label="More actions"
                className="grid size-10 place-items-center rounded-full border border-hairline text-ink-secondary hover:bg-surface-2 hover:text-ink sm:size-[34px]"
              >
                <MoreHorizontal className="size-4" aria-hidden />
              </button>
              {menuOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                    aria-hidden
                  />
                  <ul className="absolute right-0 z-30 mt-1.5 w-[min(80vw,230px)] overflow-hidden rounded-[14px] border border-hairline bg-surface p-1 shadow-raised">
                    {secondaryActions.map((action) => (
                      <li key={action.label}>
                        <button
                          type="button"
                          onClick={() => setMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[12.5px] text-ink-secondary hover:bg-surface-2 hover:text-ink"
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}

          {actions}
        </div>
      </div>

      {scopeOpen && item ? (
        <div className="rounded-[18px] border border-hairline bg-surface px-4 py-4 sm:px-5">
          <p className="t-eyebrow">
            {item.moduleName} · {PHASE_LABEL[item.phase]}
          </p>
          <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
            {item.features
              .split(";")
              .map((feature) => feature.trim())
              .filter(Boolean)
              .map((feature) => (
                <li key={feature} className="flex gap-2 text-[12.5px] text-ink-secondary">
                  <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-axis" />
                  {feature}
                </li>
              ))}
          </ul>
          {note ? (
            <p className="mt-3 border-t border-hairline pt-3 text-[12.5px] text-ink-secondary">
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

export function ActionButton({
  children,
  icon,
  variant = "secondary",
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium sm:h-[34px]",
        variant === "primary" && "bg-accent text-on-accent hover:bg-accent-hover",
        variant === "secondary" &&
          "border border-hairline bg-surface text-ink-secondary hover:border-hairline-strong hover:text-ink",
        variant === "ghost" && "px-3 text-accent hover:bg-accent-wash",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

