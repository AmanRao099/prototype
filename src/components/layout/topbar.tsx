"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronRight, Lock, Menu, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { findNavItem } from "@/lib/nav";
import type { Company, SessionUser } from "@/lib/types";

export function Topbar({
  company,
  user,
  alertCount,
  onOpenMobileNav,
}: {
  company: Company;
  user: SessionUser;
  alertCount: number;
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();
  const match = findNavItem(pathname);
  const [branchId, setBranchId] = useState(company.branches[0]?.id ?? "");
  const activeFy = company.financialYears.find((year) => year.isActive) ?? company.financialYears[0];
  const [fyId, setFyId] = useState(activeFy?.id ?? "");
  const selectedFy = company.financialYears.find((year) => year.id === fyId);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-hairline bg-surface/95 px-3 backdrop-blur sm:px-4">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-lg border border-hairline p-1.5 text-ink-secondary hover:bg-surface-2 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-[12px]">
          <li className="hidden shrink-0 text-ink-muted sm:block">{company.name}</li>
          {match?.group ? (
            <>
              <ChevronRight className="hidden size-3 shrink-0 text-ink-muted sm:block" aria-hidden />
              <li className="hidden shrink-0 text-ink-muted md:block">{match.group.title}</li>
            </>
          ) : null}
          <ChevronRight className="hidden size-3 shrink-0 text-ink-muted sm:block" aria-hidden />
          <li className="min-w-0 truncate font-medium text-ink">
            {match?.item.label ?? "Workspace"}
          </li>
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <label className="hidden items-center gap-1.5 md:flex">
          <span className="sr-only">Branch</span>
          <select
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="rounded-lg border border-hairline bg-plane px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
          >
            {company.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="hidden items-center gap-1.5 lg:flex">
          <span className="sr-only">Financial year</span>
          <select
            value={fyId}
            onChange={(event) => setFyId(event.target.value)}
            className="rounded-lg border border-hairline bg-plane px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
          >
            {company.financialYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>
        </label>

        {selectedFy?.isLocked ? (
          <Badge tone="warning">
            <Lock className="size-3" aria-hidden />
            Period locked
          </Badge>
        ) : null}

        <Link
          href="/accounting/sales-invoicing"
          className="hidden items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 sm:flex"
        >
          <Plus className="size-3.5" aria-hidden />
          New invoice
        </Link>

        <Link
          href="/system/notifications"
          className="relative rounded-lg border border-hairline p-1.5 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label={`Notifications, ${alertCount} unread`}
        >
          <Bell className="size-4" />
          {alertCount > 0 ? (
            <span className="absolute -top-1 -right-1 grid min-w-[16px] place-items-center rounded-full bg-critical px-1 text-[9px] font-semibold text-white tnum">
              {alertCount}
            </span>
          ) : null}
        </Link>

        <ThemeToggle />

        <div className="flex items-center gap-2 border-l border-hairline pl-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-secondary">
            {user.initials}
          </span>
          <span className="hidden min-w-0 leading-tight xl:block">
            <span className="block truncate text-[12px] font-medium text-ink">{user.name}</span>
            <span className="block truncate text-[10px] text-ink-muted">{user.roleName}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
