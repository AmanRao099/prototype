import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NavIcon } from "@/components/layout/icon";
import { PhaseBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getBackups, getSession, getUsers } from "@/lib/api/client";
import { SETTINGS_ITEMS } from "@/lib/nav";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Settings" };

export const instant = false;

export default async function SettingsPage() {
  const [{ company }, users, { backups, controls }] = await Promise.all([
    getSession(),
    getUsers(),
    getBackups(),
  ]);

  const activeUsers = users.filter((user) => user.status === "active").length;
  const lastBackup = backups.find((backup) => backup.status === "completed");
  const gaps = controls.filter((control) => control.state !== "enforced").length;
  const activeFy = company.financialYears.find((year) => year.isActive);

  return (
    <div className="page-stack">
      <PageHeader
        title="Settings"
        subtitle="Administration, kept out of the daily menu"
      />

      <SummaryStrip
        items={[
          {
            label: "Company",
            value: company.name,
            caption: `${company.branches.length} branches · base ${company.baseCurrency}`,
          },
          {
            label: "Open financial year",
            value: activeFy?.label ?? "Not set",
            caption: activeFy ? `Closes ${formatDate(activeFy.endDate)}` : "Configure before posting",
          },
          {
            label: "Active users",
            value: String(activeUsers),
            caption: `${users.length} accounts in total`,
          },
          {
            label: "Security gaps",
            value: String(gaps),
            caption: lastBackup ? `Last backup ${formatDate(lastBackup.at)}` : "No backup on record",
            tone: gaps > 0 ? "critical" : "good",
          },
        ]}
      />

      <Panel>
        <PanelHeader
          title="Administration"
          subtitle="These five modules sit here rather than in the workflow menu"
        />
        <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {SETTINGS_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col rounded-lg border border-hairline bg-plane p-3 transition-colors hover:border-hairline-strong"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <NavIcon name={item.icon} className="size-4 shrink-0 text-ink-muted" />
                  <span className="truncate text-[12.5px] font-medium text-ink">{item.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {item.phase !== "mvp" ? <PhaseBadge phase={item.phase} compact /> : null}
                  <ArrowUpRight className="size-3.5 text-ink-muted" aria-hidden />
                </span>
              </span>
              <span className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-ink-secondary">
                {item.features}
              </span>
            </Link>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
