import type { Metadata } from "next";
import { CircleAlert, ShieldCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getBackups } from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/format";
import type { BackupRecord, SecurityControl } from "@/lib/types";

export const metadata: Metadata = { title: "Backup & Security" };

export const instant = false;

const KIND_LABEL: Record<BackupRecord["kind"], string> = {
  full: "Full backup",
  incremental: "Incremental",
  snapshot: "Database snapshot",
};

const STATE_META: Record<
  SecurityControl["state"],
  { label: string; tone: "good" | "warning" | "critical"; icon: typeof ShieldCheck }
> = {
  enforced: { label: "Enforced", tone: "good", icon: ShieldCheck },
  partial: { label: "Partial", tone: "warning", icon: TriangleAlert },
  not_configured: { label: "Not configured", tone: "critical", icon: CircleAlert },
};

export default async function BackupSecurityPage() {
  const { backups, controls } = await getBackups();

  const lastGood = backups.find((backup) => backup.status === "completed");
  const failed = backups.filter((backup) => backup.status === "failed").length;
  const lastRestoreTest = backups.find((backup) => backup.restoreTestedOn)?.restoreTestedOn;
  const enforced = controls.filter((control) => control.state === "enforced").length;
  const gaps = controls.filter((control) => control.state !== "enforced");

  const backupColumns: Array<Column<BackupRecord>> = [
    {
      key: "at",
      header: "Run",
      cell: (backup) => (
        <CellStack primary={formatDateTime(backup.at)} secondary={KIND_LABEL[backup.kind]} />
      ),
    },
    { key: "destination", header: "Destination", hideBelow: "md", cell: (backup) => backup.destination },
    {
      key: "size",
      header: "Size",
      align: "right",
      cell: (backup) =>
        backup.sizeMb ? `${(backup.sizeMb / 1024).toFixed(2)} GB` : <span className="text-ink-muted">-</span>,
    },
    {
      key: "retention",
      header: "Retention",
      align: "right",
      hideBelow: "lg",
      cell: (backup) => `${backup.retentionDays} days`,
    },
    {
      key: "restore",
      header: "Restore tested",
      hideBelow: "lg",
      cell: (backup) =>
        backup.restoreTestedOn ? (
          formatDate(backup.restoreTestedOn)
        ) : (
          <span className="text-ink-muted">Not this run</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (backup) => (
        <Badge tone={backup.status === "completed" ? "good" : backup.status === "failed" ? "critical" : "warning"} dot>
          {backup.status === "completed" ? "Completed" : backup.status === "failed" ? "Failed" : "Running"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Backup & Security"
        subtitle="Backups, restores and security posture"
        secondaryActions={[{ label: "Run backup now" }]}
        actions={<ActionButton variant="primary" icon={<ShieldCheck className="size-3.5" />}>Security review</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Last successful backup",
            value: lastGood ? formatDate(lastGood.at) : "None",
            caption: lastGood ? `${KIND_LABEL[lastGood.kind]} to ${lastGood.destination}` : "No backup on record",
            tone: lastGood ? "good" : "critical",
          },
          {
            label: "Failed runs",
            value: String(failed),
            caption: "Investigate before the next release gate",
            tone: failed > 0 ? "critical" : "good",
          },
          {
            label: "Last restore test",
            value: lastRestoreTest ? formatDate(lastRestoreTest) : "Not tested",
            caption: "A documented restore is a go-live requirement",
            tone: lastRestoreTest ? "good" : "critical",
          },
          {
            label: "Controls enforced",
            value: `${enforced} of ${controls.length}`,
            caption: `${gaps.length} need attention`,
            tone: gaps.length > 0 ? "critical" : "good",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Backup history" subtitle="Automated schedule and retention" />
          <DataTable columns={backupColumns} rows={backups} minWidth="min-w-[860px]" />
          <PanelFooter>
            <span>Full backup nightly at 02:00, incremental every 12 hours</span>
            <span className="text-ink-secondary">Stored in private object storage</span>
          </PanelFooter>
        </Panel>

        <Panel className="self-start">
          <PanelHeader title="Security controls" subtitle="Phase 1 access and recovery posture" />
          <PanelBody flush>
            <ul className="divide-y divide-hairline">
              {controls.map((control) => {
                const meta = STATE_META[control.state];
                const Icon = meta.icon;
                return (
                  <li key={control.id} className="flex gap-2.5 px-4 py-3">
                    <Icon
                      className={`mt-0.5 size-4 shrink-0 ${
                        meta.tone === "good"
                          ? "text-good"
                          : meta.tone === "warning"
                            ? "text-warning"
                            : "text-critical"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 text-[12.5px] font-medium text-ink">{control.name}</p>
                        <Badge tone={meta.tone} dot>
                          {meta.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[11px] text-ink-secondary">{control.detail}</p>
                      <p className="mt-1 text-[10.5px] text-ink-muted">Owner: {control.owner}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
