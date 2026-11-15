"use client";

import { useState } from "react";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDateTime } from "@/lib/format";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import type { AuditAction, AuditEvent, AuditFieldChange } from "@/lib/types";

const ACTION_LABEL: Record<AuditAction, string> = {
  create: "Created",
  update: "Changed",
  delete: "Deleted / reversed",
  post: "Posted",
  approve: "Approved",
  login: "Sign-in",
  export: "Exported",
  settings: "Settings",
};

const ACTION_DOT: Record<AuditAction, string> = {
  create: "bg-series-1",
  update: "bg-warning",
  delete: "bg-critical",
  post: "bg-good",
  approve: "bg-good",
  login: "bg-axis",
  export: "bg-series-7",
  settings: "bg-series-2",
};

export function AuditView({
  events,
  changes,
}: {
  events: AuditEvent[];
  changes: Record<string, AuditFieldChange[]>;
}) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [module, setModule] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const modules = Array.from(new Set(events.map((event) => event.module))).sort();
  const needle = search.trim().toLowerCase();

  const rows = events.filter((event) => {
    if (action !== "all" && event.action !== action) return false;
    if (module !== "all" && event.module !== module) return false;
    if (!needle) return true;
    return (
      event.user.toLowerCase().includes(needle) ||
      event.reference.toLowerCase().includes(needle) ||
      event.summary.toLowerCase().includes(needle) ||
      event.entity.toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<AuditEvent>> = [
    {
      key: "at",
      header: "When",
      width: "w-[150px]",
      cell: (event) => formatDateTime(event.at),
    },
    { key: "user", header: "User", cell: (event) => <span className="text-ink">{event.user}</span> },
    {
      key: "action",
      header: "Action",
      cell: (event) => (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${ACTION_DOT[event.action]}`} />
          {ACTION_LABEL[event.action]}
        </span>
      ),
    },
    {
      key: "record",
      header: "Record",
      cell: (event) => {
        const diff = changes[event.id];
        if (!diff) return <CellStack primary={event.reference} secondary={event.entity} />;
        return (
          <button
            type="button"
            onClick={() => setSelectedId(event.id === selectedId ? null : event.id)}
            className="text-left"
          >
            <CellStack
              primary={event.reference}
              secondary={`${event.entity} · ${diff.length} field${diff.length === 1 ? "" : "s"} changed`}
            />
          </button>
        );
      },
    },
    { key: "module", header: "Module", hideBelow: "lg", cell: (event) => event.module },
    {
      key: "summary",
      header: "Detail",
      cell: (event) => (
        <span className="block max-w-[400px] truncate" title={event.summary}>
          {event.summary}
        </span>
      ),
    },
    {
      key: "fields",
      header: "Fields",
      align: "right",
      hideBelow: "xl",
      cell: (event) => (event.changedFields ? event.changedFields : <span className="text-ink-muted">-</span>),
    },
    {
      key: "ip",
      header: "IP address",
      align: "right",
      hideBelow: "xl",
      cell: (event) => <span className="text-ink-muted">{event.ipAddress}</span>,
    },
  ];

  const selected = events.find((event) => event.id === selectedId);
  const selectedChanges = selectedId ? (changes[selectedId] ?? []) : [];

  return (
    <div className="flex flex-col gap-3">
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search user, record, reference or detail"
        filters={[
          {
            id: "action",
            label: "Action",
            value: action,
            onChange: setAction,
            options: [
              { value: "all", label: "All actions" },
              ...Object.entries(ACTION_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
          {
            id: "module",
            label: "Module",
            value: module,
            onChange: setModule,
            options: [
              { value: "all", label: "All modules" },
              ...modules.map((value) => ({ value, label: value })),
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={events.length} noun="events" />
      </Toolbar>

      <DataTable columns={columns} rows={rows} minWidth="min-w-[1100px]" />
    </Panel>

    {selected ? (
      <Panel>
        <PanelHeader
          title={`${selected.reference} · field changes`}
          subtitle={`${selected.user} · ${formatDateTime(selected.at)} · ${selected.ipAddress}`}
          action={
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              Close
            </button>
          }
        />
        <PanelBody flush>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-hairline text-left">
                <th scope="col" className="px-4 py-2 text-[10px] font-semibold tracking-[0.07em] text-ink-muted uppercase">
                  Field
                </th>
                <th scope="col" className="px-3 py-2 text-[10px] font-semibold tracking-[0.07em] text-ink-muted uppercase">
                  Before
                </th>
                <th scope="col" className="px-4 py-2 text-[10px] font-semibold tracking-[0.07em] text-ink-muted uppercase">
                  After
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedChanges.map((change) => (
                <tr key={change.field} className="border-b border-hairline/60 last:border-0">
                  <td className="px-4 py-2 text-ink">{change.field}</td>
                  <td className="px-3 py-2 text-delta-down line-through decoration-delta-down/40">
                    {change.before}
                  </td>
                  <td className="px-4 py-2 text-ink">{change.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelBody>
      </Panel>
    ) : null}
    </div>
  );
}
