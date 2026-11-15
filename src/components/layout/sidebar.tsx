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
      {/* scrim for the mobile drawer */}
      <div
        onClick={onCloseMobile}
        className={cn(
          "fixed inset-0 z-30 bg-black/30 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-hairline bg-surface transition-[width,transform] duration-200 lg:static lg:translate-x-0",
          collapsed ? "lg:w-[68px]" : "lg:w-[268px]",
          "w-[268px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-hairline px-3">
          <Link
            href={DASHBOARD_ITEM.href}
            className="flex min-w-0 items-center gap-2"
            onClick={onCloseMobile}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-[13px] font-bold text-white">
              A
            </span>
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {APP_CONFIG.productName}
                </span>
                <span className="block truncate text-[10px] text-ink-muted">
                  Accounts, Inventory & Common
                </span>
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto rounded-md p-1.5 text-ink-secondary hover:bg-surface-2 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="ml-auto hidden rounded-md p-1.5 text-ink-secondary hover:bg-surface-2 hover:text-ink lg:block"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        {!collapsed ? (
          <div className="border-b border-hairline p-3">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-muted"
                aria-hidden
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search modules"
                className="w-full rounded-lg border border-hairline bg-plane py-1.5 pr-2 pl-8 text-[12px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
              />
            </label>
          </div>
        ) : null}

        <nav className="scroll-thin flex-1 overflow-y-auto px-2 py-3" aria-label="Modules">
          <SidebarLink
            item={DASHBOARD_ITEM}
            active={pathname === DASHBOARD_ITEM.href}
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />

          {groups.map((group) => (
            <div key={group.title} className="mt-4">
              {!collapsed ? (
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  {group.title}
                </p>
              ) : (
                <div className="mx-2 my-2 border-t border-hairline" />
              )}
              <ul className="space-y-0.5">
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
          <div className="border-t border-hairline px-3 py-2.5 text-[10px] leading-relaxed text-ink-muted">
            29 modules from the source workbook.
            <br />
            <span className="text-ink-secondary">P1</span> ships in the 30-day MVP,{" "}
            <span className="text-ink-secondary">P2</span> in the post-MVP roadmap.
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
        "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12.5px] transition-colors",
        active
          ? "bg-accent-wash font-medium text-accent"
          : "text-ink-secondary hover:bg-surface-2 hover:text-ink",
        item.phase === "phase2" && !active && "opacity-70",
      )}
    >
      <NavIcon name={item.icon} className="size-4 shrink-0" />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.phase !== "mvp" ? <PhaseBadge phase={item.phase} /> : null}
        </>
      ) : null}
    </Link>
  );
}
