import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NavIcon } from "@/components/layout/icon";
import { PhaseBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import {
  ALL_NAV_ITEMS,
  ALL_SECTIONS,
  WORKBOOK_CATEGORIES,
  itemsByWorkbookCategory,
  type NavItem,
} from "@/lib/nav";

export const metadata: Metadata = { title: "All modules" };

function ModuleCard({ item, showModuleName }: { item: NavItem; showModuleName?: boolean }) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-lg border border-hairline bg-plane p-3 transition-colors hover:border-hairline-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <NavIcon name={item.icon} className="size-4 shrink-0 text-ink-muted" />
          <span className="min-w-0">
            <span className="block truncate text-[12.5px] font-medium text-ink">
              {showModuleName ? item.moduleName : item.label}
            </span>
            {showModuleName && item.moduleName !== item.label ? (
              <span className="block truncate text-[10.5px] text-ink-muted">
                Menu: {item.label}
              </span>
            ) : null}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {item.phase !== "mvp" ? <PhaseBadge phase={item.phase} compact /> : null}
          <ArrowUpRight className="size-3.5 text-ink-muted" aria-hidden />
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-secondary">
        {item.features}
      </p>
    </Link>
  );
}

export default function ModulesPage() {
  const mvp = ALL_NAV_ITEMS.filter((item) => item.phase === "mvp").length;
  const limited = ALL_NAV_ITEMS.filter((item) => item.phase === "limited").length;
  const phase2 = ALL_NAV_ITEMS.filter((item) => item.phase === "phase2").length;

  return (
    <div className="page-stack">
      <PageHeader
        title="All modules"
        subtitle="Every module in scope, by workflow and by workbook"
      />

      <SummaryStrip
        items={[
          {
            label: "Modules in scope",
            value: String(ALL_NAV_ITEMS.length),
            caption: "From Accounts & Inventory Modules.xlsx",
          },
          {
            label: "Phase 1 complete",
            value: String(mvp),
            caption: "Full workflow in the 30-day MVP",
            tone: "good",
          },
          {
            label: "Phase 1 limited",
            value: String(limited),
            caption: "Core path now, depth in Phase 2",
          },
          {
            label: "Phase 2",
            value: String(phase2),
            caption: "Screen present, build scheduled later",
            tone: "muted",
          },
        ]}
      />

      <section className="flex flex-col gap-3">
        <h2 className="t-eyebrow">By workflow — how the menu is arranged</h2>
        {ALL_SECTIONS.map((section) => (
          <Panel key={section.id}>
            <PanelHeader title={section.title} subtitle={section.blurb} />
            <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => (
                <ModuleCard key={item.href} item={item} />
              ))}
            </PanelBody>
          </Panel>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="t-eyebrow">By workbook category — how the scope document lists them</h2>
        {WORKBOOK_CATEGORIES.map((category) => {
          const items = itemsByWorkbookCategory(category);
          return (
            <Panel key={category}>
              <PanelHeader title={category} subtitle={`${items.length} modules in the workbook`} />
              <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ModuleCard key={item.href} item={item} showModuleName />
                ))}
              </PanelBody>
            </Panel>
          );
        })}
      </section>
    </div>
  );
}
