"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { NavIcon } from "@/components/layout/icon";
import { PhaseBadge } from "@/components/ui/badge";
import { DASHBOARD_ITEM, NAV_GROUPS, type NavItem } from "@/lib/nav";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return NAV_GROUPS;
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(needle) ||
          item.features.toLowerCase().includes(needle),
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={cn("fixed inset-0 z-30 bg-black/40 lg:hidden", mobileOpen ? "block" : "hidden")}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-hairline bg-surface transition-[width,transform] duration-200 lg:static lg:translate-x-0",
          collapsed ? "lg:w-[60px]" : "lg:w-[254px]",
          "w-[254px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* brand */}
        <div className="flex h-14 items-center gap-2.5 px-3">
          <Link
            href={DASHBOARD_ITEM.href}
            className="flex min-w-0 items-center gap-2.5"
            onClick={onCloseMobile}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-[12px] font-bold text-on-accent">
              A
            </span>
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-[13px] leading-tight font-semibold tracking-[-0.01em] text-ink">
                  {APP_CONFIG.productName}
                </span>
                <span className="block truncate text-[10px] text-ink-muted">
                  Accounts · Inventory · System
                </span>
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-1.5 text-ink-muted hover:bg-surface-2 hover:text-ink lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="ml-auto hidden rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink lg:block"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        {!collapsed ? (
          <div className="px-3 pb-3">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-muted"
                aria-hidden
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules"
                className="field w-full pr-2 pl-8"
              />
            </label>
          </div>
        ) : null}

        <nav
          className="scroll-thin flex-1 overflow-y-auto px-2 pb-3"
          aria-label="Modules"
        >
          <SidebarLink
            item={DASHBOARD_ITEM}
            active={pathname === DASHBOARD_ITEM.href}
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />

          {groups.map((group) => (
            <div key={group.title} className="mt-5 first:mt-3">
              {!collapsed ? (
                <p className="t-eyebrow px-2 pb-1.5">{group.title}</p>
              ) : (
                <div className="mx-2 my-3 border-t border-hairline" />
              )}
              <ul className="space-y-px">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <SidebarLink
                      item={item}
                      active={pathname === item.href}
                      collapsed={collapsed}
                      onNavigate={onCloseMobile}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {groups.length === 0 ? (
            <p className="px-2 py-6 text-[12px] text-ink-muted">No module matches that search.</p>
          ) : null}
        </nav>

        {!collapsed ? (
          <div className="border-t border-hairline px-3 py-2.5">
            <p className="text-[10.5px] leading-relaxed text-ink-muted">
              29 modules from the source workbook.{" "}
              <span className="text-ink-secondary">LTD</span> and{" "}
              <span className="text-ink-secondary">P2</span> mark limited and post-MVP scope.
            </p>
          </div>
        ) : null}
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-[30px] items-center gap-2.5 rounded-lg px-2 text-[12.5px] transition-colors",
        active
          ? "bg-surface-2 font-medium text-ink"
          : "text-ink-secondary hover:bg-surface-2/60 hover:text-ink",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute top-1/2 -left-2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent"
        />
      ) : null}
      <NavIcon
        name={item.icon}
        className={cn("size-[15px] shrink-0", active ? "text-accent" : "text-ink-muted")}
      />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.phase !== "mvp" ? <PhaseBadge phase={item.phase} compact /> : null}
        </>
      ) : null}
    </Link>
  );
}
