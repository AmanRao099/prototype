"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge, PhaseBadge, StatusChip } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatMoneyWhole, formatRelative } from "@/lib/format";
import { AS_OF } from "@/lib/ageing";
import type { ApprovalRequest, ApprovalRule } from "@/lib/types";

export function ApprovalsView({
  requests,
  rules,
}: {
  requests: ApprovalRequest[];
  rules: ApprovalRule[];
}) {
  const [tab, setTab] = useState("queue");
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("all");

  const needle = search.trim().toLowerCase();
  const documentTypes = Array.from(new Set(requests.map((request) => request.documentType)));

  const rows = requests.filter((request) => {
    if (documentType !== "all" && request.documentType !== documentType) return false;
    if (!needle) return true;
    return (
      request.reference.toLowerCase().includes(needle) ||
      request.party.toLowerCase().includes(needle) ||
      request.requestedBy.toLowerCase().includes(needle)
    );
  });

  const queueColumns: Array<Column<ApprovalRequest>> = [
    {
      key: "document",
      header: "Document",
      cell: (request) => <CellStack primary={request.reference} secondary={request.documentType} />,
    },
    { key: "party", header: "Party", cell: (request) => request.party },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (request) =>
        request.amount !== undefined ? (
          <span className="font-medium">{formatMoneyWhole(request.amount)}</span>
        ) : (
          <span className="text-ink-muted">-</span>
        ),
    },
    {
      key: "step",
      header: "Waiting at",
      hideBelow: "md",
      cell: (request) => <StatusChip level={request.level} label={request.step} />,
    },
    {
      key: "requested",
      header: "Raised",
      hideBelow: "lg",
      cell: (request) => (
        <CellStack
          primary={request.requestedBy}
          secondary={formatRelative(request.requestedAt, AS_OF)}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-[160px]",
      cell: () => (
        <span className="inline-flex items-center gap-1.5">
          <button
            type="button"
            className="inline-flex h-[24px] items-center gap-1 rounded-md px-1.5 text-[10.5px] font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-3" aria-hidden />
            Reject
          </button>
          <button
            type="button"
            className="inline-flex h-[24px] items-center gap-1 rounded-md border border-hairline bg-surface-2 px-1.5 text-[10.5px] font-medium text-ink transition-colors hover:border-hairline-strong"
          >
            <Check className="size-3" aria-hidden />
            Approve
          </button>
        </span>
      ),
    },
  ];

  const ruleColumns: Array<Column<ApprovalRule>> = [
    {
      key: "document",
      header: "Document type",
      cell: (rule) => <CellStack primary={rule.documentType} secondary={rule.condition} />,
    },
    {
      key: "levels",
      header: "Approval chain",
      cell: (rule) => rule.levels.map((level) => `L${level.level} ${level.approver}`).join(" → "),
    },
    {
      key: "delegation",
      header: "Delegation",
      hideBelow: "lg",
      cell: (rule) => rule.delegation ?? <span className="text-ink-muted">Not configured</span>,
    },
    {
      key: "phase",
      header: "Scope",
      hideBelow: "md",
      cell: (rule) => (rule.phase === "mvp" ? <span className="text-ink-muted">Phase 1</span> : <PhaseBadge phase={rule.phase} />),
    },
    {
      key: "state",
      header: "State",
      align: "right",
      cell: (rule) =>
        rule.isActive ? (
          <Badge tone="good" dot>
            Active
          </Badge>
        ) : (
          <Badge tone="neutral">Inactive</Badge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "queue", label: "Approval queue", count: requests.length },
          { id: "rules", label: "Rules", count: rules.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Panel>
        {tab === "queue" ? (
          <>
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search reference, party or requester"
              filters={[
                {
                  id: "type",
                  label: "Document type",
                  value: documentType,
                  onChange: setDocumentType,
                  options: [
                    { value: "all", label: "All document types" },
                    ...documentTypes.map((value) => ({ value, label: value })),
                  ],
                },
              ]}
            >
              <ResultCount shown={rows.length} total={requests.length} noun="documents" />
            </Toolbar>
            <DataTable
              columns={queueColumns}
              rows={rows}
              minWidth="min-w-[920px]"
              emptyMessage="Approval queue is clear."
            />
          </>
        ) : (
          <DataTable columns={ruleColumns} rows={rules} minWidth="min-w-[880px]" />
        )}
      </Panel>
    </div>
  );
}
