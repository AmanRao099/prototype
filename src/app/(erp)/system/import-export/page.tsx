import type { Metadata } from "next";
import { FileDown, FileUp, Upload } from "lucide-react";
import { Badge, PhaseBadge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getImportExport } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import type { ImportJob } from "@/lib/types";

export const metadata: Metadata = { title: "Import & Export" };

export const instant = false;

const EXPORTS = [
  { name: "Sales register", format: "Excel, PDF", module: "Accounting" },
  { name: "Purchase register", format: "Excel, PDF", module: "Accounting" },
  { name: "Trial balance", format: "Excel, PDF", module: "Accounting" },
  { name: "Receivable & payable ageing", format: "Excel", module: "Accounting" },
  { name: "Current stock & valuation", format: "Excel", module: "Inventory" },
  { name: "Stock ledger", format: "Excel", module: "Inventory" },
  { name: "VAT return workings", format: "Excel", module: "Tax" },
  { name: "Audit log", format: "CSV", module: "System" },
];

export default async function ImportExportPage() {
  const { templates, jobs } = await getImportExport();

  const completed = jobs.filter((job) => job.status === "completed");
  const rowsImported = completed.reduce((sum, job) => sum + job.imported, 0);
  const failedRows = jobs.reduce((sum, job) => sum + job.failed, 0);
  const failedJobs = jobs.filter((job) => job.status === "failed").length;

  const jobColumns: Array<Column<ImportJob>> = [
    {
      key: "template",
      header: "Import",
      cell: (job) => <CellStack primary={job.template} secondary={job.fileName} />,
    },
    {
      key: "started",
      header: "Run",
      hideBelow: "md",
      cell: (job) => <CellStack primary={job.runBy} secondary={formatDateTime(job.startedAt)} />,
    },
    { key: "rows", header: "Rows", align: "right", cell: (job) => job.rows },
    { key: "imported", header: "Imported", align: "right", cell: (job) => job.imported },
    {
      key: "failed",
      header: "Failed",
      align: "right",
      cell: (job) =>
        job.failed ? <span className="text-delta-down">{job.failed}</span> : <span className="text-ink-muted">0</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (job) => (
        <Badge tone={job.status === "completed" ? "good" : job.status === "failed" ? "critical" : "warning"} dot>
          {job.status === "completed" ? "Completed" : job.status === "failed" ? "Failed" : "Running"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Import & Export"
        subtitle="Templates, runs and exports"
        secondaryActions={[{ label: "Download templates" }]}
        actions={<ActionButton variant="primary" icon={<Upload className="size-3.5" />}>New import</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Templates available",
            value: String(templates.filter((template) => template.phase === "mvp").length),
            caption: `${templates.length} defined, rest scheduled for Phase 2`,
          },
          {
            label: "Rows imported",
            value: rowsImported.toLocaleString("en-IN"),
            caption: `${completed.length} successful runs`,
          },
          {
            label: "Rows rejected",
            value: String(failedRows),
            caption: "Validation errors are returned per row",
            tone: failedRows > 0 ? "critical" : "good",
          },
          {
            label: "Failed runs",
            value: String(failedJobs),
            caption: "Nothing is written unless the whole file validates",
            tone: failedJobs > 0 ? "critical" : "good",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Import templates" subtitle="Download, fill and upload" />
          <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border border-hairline bg-plane p-3 transition-colors hover:border-hairline-strong"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                    <FileDown className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                    {template.name}
                  </p>
                  {template.phase !== "mvp" ? <PhaseBadge phase={template.phase} /> : null}
                </div>
                <p className="mt-1 text-[11px] text-ink-secondary">{template.description}</p>
                <p className="mt-2 text-[10.5px] text-ink-muted">
                  {template.module} · {template.columns} columns
                </p>
              </div>
            ))}
          </PanelBody>
        </Panel>

        <Panel className="self-start">
          <PanelHeader title="Exports" subtitle="Available from each register and report" />
          <PanelBody flush>
            <ul className="divide-y divide-hairline">
              {EXPORTS.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileUp className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] text-ink">{entry.name}</span>
                      <span className="block text-[10.5px] text-ink-muted">{entry.module}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-muted">{entry.format}</span>
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Recent import runs" subtitle="Row counts and validation outcome" />
        <DataTable columns={jobColumns} rows={jobs} minWidth="min-w-[820px]" />
      </Panel>
    </div>
  );
}
