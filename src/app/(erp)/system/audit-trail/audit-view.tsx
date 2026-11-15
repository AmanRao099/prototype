"use client";

import { useState } from "react";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDateTime } from "@/lib/format";
import type { AuditAction, AuditEvent } from "@/lib/types";

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

export function AuditView({ events }: { events: AuditEvent[] }) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [module, setModule] = useState("all");

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
      cell: (event) => <CellStack primary={event.reference} secondary={event.entity} />,
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

  return (
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
  );
}
