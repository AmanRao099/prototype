"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, LayoutGrid, PanelLeftClose, PanelLeftOpen, Search, Settings, X } from "lucide-react";
import { NavIcon } from "@/components/layout/icon";
import { PhaseBadge } from "@/components/ui/badge";
import {
  DASHBOARD_ITEM,
  NAV_SECTIONS,
  SETTINGS_SECTION,
  sectionForPath,
  type NavItem,
} from "@/lib/nav";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Workflow-shaped navigation.
 *
 * Sections collapse, and only the section you are working in is open, so the
 * menu shows roughly eight links instead of twenty-nine. Anything not on
 * screen is one keystroke away through the command palette.
 */
export function Sidebar({
  mobileOpen,
  onCloseMobile,
  onOpenSearch,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const activeSectionId = sectionForPath(pathname)?.id ?? "sell";

  /**
   * Open state is derived, not stored: the section you are working in is open,
   * and anything you open or close by hand overrides that for the session. No
   * effect has to sync it when the route changes.
   */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const isSectionOpen = (id: string) => overrides[id] ?? id === activeSectionId;

  function toggleSection(id: string) {
    setOverrides((current) => ({ ...current, [id]: !isSectionOpen(id) }));
  }

  const settingsActive = SETTINGS_SECTION.items.some((item) => item.href === pathname);

  return (
    <>
      <div
        onClick={onCloseMobile}
        className={cn("fixed inset-0 z-30 bg-black/40 lg:hidden", mobileOpen ? "block" : "hidden")}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-hairline bg-surface transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-[60px]" : "lg:w-[246px]",
          "w-[246px]",
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

        {/* search opens the palette rather than filtering a long list in place */}
        {!collapsed ? (
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={onOpenSearch}
              className="field flex w-full items-center gap-2 px-2.5 text-left text-ink-muted hover:border-hairline-strong"
            >
              <Search className="size-3.5 shrink-0" aria-hidden />
              <span className="flex-1 text-[12px]">Search modules</span>
              <kbd className="rounded border border-hairline px-1 py-px text-[9.5px]">Ctrl K</kbd>
            </button>
          </div>
        ) : (
          <div className="px-2 pb-3">
            <button
              type="button"
              onClick={onOpenSearch}
              className="grid h-[30px] w-full place-items-center rounded-lg border border-hairline text-ink-muted hover:text-ink"
              aria-label="Search modules"
            >
              <Search className="size-4" aria-hidden />
            </button>
          </div>
        )}

        <nav className="scroll-thin flex-1 overflow-y-auto px-2 pb-3" aria-label="Modules">
          <SidebarLink
            item={DASHBOARD_ITEM}
            active={pathname === DASHBOARD_ITEM.href}
            collapsed={collapsed}
            onNavigate={onCloseMobile}
          />

          <div className="mt-2 space-y-0.5">
            {NAV_SECTIONS.map((section) => {
              const isOpen = isSectionOpen(section.id);
              const hasActive = section.items.some((item) => item.href === pathname);

              if (collapsed) {
                return (
                  <div key={section.id} className="space-y-px py-1">
                    <div className="mx-2 border-t border-hairline" />
                    {section.items.map((item) => (
                      <SidebarLink
                        key={item.href}
                        item={item}
                        active={pathname === item.href}
                        collapsed
                        onNavigate={onCloseMobile}
                      />
                    ))}
                  </div>
                );
              }

              return (
                <div key={section.id}>
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    className={cn(
                      "flex h-[30px] w-full items-center gap-2.5 rounded-lg px-2 text-[12.5px] font-medium transition-colors",
                      hasActive ? "text-ink" : "text-ink-secondary",
                      "hover:bg-surface-2/60",
                    )}
                  >
                    <NavIcon
                      name={section.icon}
                      className={cn("size-[15px] shrink-0", hasActive ? "text-accent" : "text-ink-muted")}
                    />
                    <span className="flex-1 text-left">{section.title}</span>
                    {!isOpen && hasActive ? (
                      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                    ) : null}
                    <ChevronRight
                      className={cn(
                        "size-3.5 shrink-0 text-ink-muted transition-transform",
                        isOpen && "rotate-90",
                      )}
                      aria-hidden
                    />
                  </button>

                  {isOpen ? (
                    <ul className="mt-px mb-1 space-y-px border-l border-hairline pl-2 ml-[15px]">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <SidebarLink
                            item={item}
                            active={pathname === item.href}
                            collapsed={false}
                            nested
                            onNavigate={onCloseMobile}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>

        {/* utility rail: everything administrative lives behind these two */}
        <div className="border-t border-hairline p-2">
          <Link
            href="/modules"
            onClick={onCloseMobile}
            title={collapsed ? "All modules" : undefined}
            aria-current={pathname === "/modules" ? "page" : undefined}
            className={cn(
              "flex h-[30px] items-center gap-2.5 rounded-lg px-2 text-[12.5px] transition-colors",
              pathname === "/modules"
                ? "bg-surface-2 font-medium text-ink"
                : "text-ink-secondary hover:bg-surface-2/60 hover:text-ink",
            )}
          >
            <LayoutGrid className="size-[15px] shrink-0 text-ink-muted" aria-hidden />
            {!collapsed ? <span className="flex-1 truncate">All modules</span> : null}
          </Link>

          <Link
            href="/settings"
            onClick={onCloseMobile}
            title={collapsed ? "Settings" : undefined}
            aria-current={pathname === "/settings" || settingsActive ? "page" : undefined}
            className={cn(
              "mt-px flex h-[30px] items-center gap-2.5 rounded-lg px-2 text-[12.5px] transition-colors",
              pathname === "/settings" || settingsActive
                ? "bg-surface-2 font-medium text-ink"
                : "text-ink-secondary hover:bg-surface-2/60 hover:text-ink",
            )}
          >
            <Settings
              className={cn(
                "size-[15px] shrink-0",
                settingsActive || pathname === "/settings" ? "text-accent" : "text-ink-muted",
              )}
              aria-hidden
            />
            {!collapsed ? <span className="flex-1 truncate">Settings</span> : null}
          </Link>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  nested = false,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : item.moduleName}
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
          className={cn(
            "absolute top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent",
            nested ? "-left-[9px]" : "-left-2",
          )}
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
