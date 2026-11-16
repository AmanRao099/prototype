"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Check, ChevronDown, ChevronRight, Lock, Menu, Plus, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { findNavItem } from "@/lib/nav";
import type { Company, SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const QUICK_CREATE = [
  { label: "Sales invoice", href: "/accounting/sales-invoicing" },
  { label: "Purchase invoice", href: "/accounting/purchase-invoicing" },
  { label: "Receipt", href: "/accounting/cash-bank" },
  { label: "Payment", href: "/accounting/cash-bank" },
  { label: "Goods receipt", href: "/inventory/stock-inward" },
  { label: "Stock issue", href: "/inventory/stock-outward" },
];

/**
 * The bar carried eight separate controls, two of them raw selects. Company,
 * branch and financial year are one posting context, so they share one chip,
 * and document creation is one menu instead of a single hard-coded button.
 */
export function Topbar({
  company,
  user,
  alertCount,
  onOpenMobileNav,
  onOpenSearch,
}: {
  company: Company;
  user: SessionUser;
  alertCount: number;
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const match = findNavItem(pathname);
  const hubTitle =
    pathname === "/modules" ? "All modules" : pathname === "/settings" ? "Settings" : undefined;

  const [branchId, setBranchId] = useState(company.branches[0]?.id ?? "");
  const activeFy = company.financialYears.find((year) => year.isActive) ?? company.financialYears[0];
  const [fyId, setFyId] = useState(activeFy?.id ?? "");
  const [contextOpen, setContextOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const branch = company.branches.find((entry) => entry.id === branchId);
  const financialYear = company.financialYears.find((year) => year.id === fyId);

  return (
    <header className="frosted sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-hairline px-4 sm:h-[60px] sm:gap-3 sm:px-8">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="grid size-10 shrink-0 place-items-center rounded-full border border-hairline text-ink-secondary hover:bg-surface-2 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-[13px] sm:gap-2">
          {match?.section ? (
            <>
              <li className="hidden shrink-0 text-ink-muted sm:block">{match.section.title}</li>
              <ChevronRight className="hidden size-3 shrink-0 text-ink-muted/60 sm:block" aria-hidden />
            </>
          ) : null}
          <li className="min-w-0 truncate font-medium text-ink">
            {match?.item.label ?? hubTitle ?? "Workspace"}
          </li>
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* posting context: company, branch and financial year in one control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setContextOpen((open) => !open)}
            aria-expanded={contextOpen}
            className="flex h-10 max-w-[42vw] items-center gap-2 rounded-full border border-hairline px-3 text-[12.5px] text-ink-secondary hover:border-hairline-strong hover:text-ink sm:h-[34px] sm:max-w-none sm:px-3.5"
          >
            <span className="hidden font-medium text-ink sm:inline">{company.name}</span>
            <span className="hidden text-ink-muted sm:inline">·</span>
            <span className="max-w-[90px] truncate">{branch?.name}</span>
            <span className="hidden text-ink-muted md:inline">· {financialYear?.label}</span>
            {financialYear?.isLocked ? (
              <Lock className="size-3 shrink-0 text-warning" aria-label="Period locked" />
            ) : null}
            <ChevronDown className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
          </button>

          {contextOpen ? (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setContextOpen(false)} aria-hidden />
              <div className="absolute right-0 z-30 mt-1.5 w-[min(84vw,250px)] overflow-hidden rounded-[16px] border border-hairline bg-surface shadow-raised">
                <p className="t-eyebrow border-b border-hairline px-3 py-2">Branch</p>
                <ul className="p-1">
                  {company.branches.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setBranchId(entry.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left text-[12.5px] text-ink-secondary hover:bg-surface-2 hover:text-ink"
                      >
                        <span className="truncate">{entry.name}</span>
                        {entry.id === branchId ? (
                          <Check className="size-3.5 shrink-0 text-accent" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="t-eyebrow border-y border-hairline px-3 py-2">Financial year</p>
                <ul className="p-1">
                  {company.financialYears.map((year) => (
                    <li key={year.id}>
                      <button
                        type="button"
                        onClick={() => setFyId(year.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left text-[12.5px] text-ink-secondary hover:bg-surface-2 hover:text-ink"
                      >
                        <span className="truncate">
                          {year.label}
                          {year.isLocked ? (
                            <span className="ml-1.5 text-[10.5px] text-ink-muted">locked</span>
                          ) : null}
                        </span>
                        {year.id === fyId ? (
                          <Check className="size-3.5 shrink-0 text-accent" aria-hidden />
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* quick create */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCreateOpen((open) => !open)}
            aria-expanded={createOpen}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 text-[12.5px] font-medium text-on-accent hover:bg-accent-hover sm:h-[34px] sm:px-4"
          >
            <Plus className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">New</span>
          </button>
          {createOpen ? (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setCreateOpen(false)} aria-hidden />
              <ul className="absolute right-0 z-30 mt-1.5 w-[min(84vw,230px)] overflow-hidden rounded-[16px] border border-hairline bg-surface p-1 shadow-raised">
                {QUICK_CREATE.map((entry) => (
                  <li key={entry.label}>
                    <Link
                      href={entry.href}
                      onClick={() => setCreateOpen(false)}
                      className="block rounded-[10px] px-2.5 py-2 text-[12.5px] text-ink-secondary hover:bg-surface-2 hover:text-ink"
                    >
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onOpenSearch}
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink lg:hidden"
          aria-label="Search modules"
        >
          <Search className="size-4" aria-hidden />
        </button>

        <Link
          href="/system/notifications"
          className={cn(
            "relative grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-surface-2 sm:size-[34px]",
            pathname === "/system/notifications" ? "text-ink" : "text-ink-muted hover:text-ink",
          )}
          aria-label={`Notifications, ${alertCount} unread`}
        >
          <Bell className="size-4" />
          {alertCount > 0 ? (
            <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-critical ring-2 ring-surface" />
          ) : null}
        </Link>

        <ThemeToggle />

        <span
          className="ml-1 hidden size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[11.5px] font-semibold text-ink-secondary ring-1 ring-hairline sm:grid"
          title={`${user.name} · ${user.roleName}`}
        >
          {user.initials}
        </span>
      </div>
    </header>
  );
}
