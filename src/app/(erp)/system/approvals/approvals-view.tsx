"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge, PhaseBadge, StatusChip } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatDateTime, formatMoneyWhole, formatRelative } from "@/lib/format";
import { AS_OF } from "@/lib/ageing";
import type {
  ApprovalDelegation,
  ApprovalHistoryEntry,
  ApprovalRequest,
  ApprovalRule,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const DELEGATION_TONE = {
  active: "good",
  scheduled: "accent",
  expired: "neutral",
} as const;

const OUTCOME_TONE = {
  approved: "good",
  rejected: "critical",
  in_progress: "warning",
} as const;

export function ApprovalsView({
  requests,
  rules,
  delegations,
  history,
}: {
  requests: ApprovalRequest[];
  rules: ApprovalRule[];
  delegations: ApprovalDelegation[];
  history: ApprovalHistoryEntry[];
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

  const delegationColumns: Array<Column<ApprovalDelegation>> = [
    {
      key: "from",
      header: "Delegated by",
      cell: (delegation) => (
        <CellStack primary={delegation.fromUser} secondary={delegation.reason} />
      ),
    },
    {
      key: "to",
      header: "Acting approver",
      cell: (delegation) => <span className="text-ink">{delegation.toUser}</span>,
    },
    {
      key: "scope",
      header: "Scope",
      hideBelow: "md",
      cell: (delegation) => delegation.documentTypes.join(", "),
    },
    {
      key: "window",
      header: "Window",
      hideBelow: "lg",
      cell: (delegation) =>
        `${formatDate(delegation.startsOn)} - ${formatDate(delegation.endsOn)}`,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (delegation) => (
        <Badge tone={DELEGATION_TONE[delegation.status]} dot>
          {delegation.status === "active"
            ? "Active"
            : delegation.status === "scheduled"
              ? "Scheduled"
              : "Expired"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "queue", label: "Approval queue", count: requests.length },
          { id: "rules", label: "Rules", count: rules.length },
          { id: "delegation", label: "Delegation", count: delegations.length },
          { id: "history", label: "History", count: history.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Panel className={tab === "queue" || tab === "rules" ? "" : "hidden"}>
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

      {tab === "delegation" ? (
        <Panel>
          <PanelHeader
            title="Delegation"
            subtitle="Who may approve on someone else's behalf, and for how long"
          />
          <DataTable columns={delegationColumns} rows={delegations} minWidth="min-w-[860px]" />
          <PanelFooter>
            <span>A delegated decision records both the delegate and the original approver</span>
            <span className="text-ink-secondary">
              {delegations.filter((entry) => entry.status === "active").length} active now
            </span>
          </PanelFooter>
        </Panel>
      ) : null}

      {tab === "history" ? (
        <div className="flex flex-col gap-3">
          {history.map((entry) => (
            <Panel key={entry.id}>
              <PanelHeader
                title={`${entry.documentType} ${entry.reference}`}
                subtitle={`${entry.party} · raised by ${entry.raisedBy} on ${formatDate(entry.raisedAt)}`}
                action={
                  <span className="flex items-center gap-2">
                    {entry.amount !== undefined ? (
                      <span className="text-[12px] font-medium tnum text-ink">
                        {formatMoneyWhole(entry.amount)}
                      </span>
                    ) : null}
                    <Badge tone={OUTCOME_TONE[entry.outcome]} dot>
                      {entry.outcome === "approved"
                        ? "Approved"
                        : entry.outcome === "rejected"
                          ? "Rejected"
                          : "In progress"}
                    </Badge>
                  </span>
                }
              />
              <PanelBody>
                <ol className="relative space-y-3 border-l border-hairline pl-5">
                  {entry.steps.map((step) => (
                    <li key={step.level} className="relative">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-1.5 -left-[23px] size-2 rounded-full ring-4 ring-surface",
                          step.decision === "approved"
                            ? "bg-good"
                            : step.decision === "rejected"
                              ? "bg-critical"
                              : "bg-warning",
                        )}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[12.5px] text-ink">
                          <span className="font-medium">Level {step.level}</span> · {step.approver}
                          {step.actedFor ? (
                            <span className="text-ink-muted"> acting for {step.actedFor}</span>
                          ) : null}
                        </p>
                        <p className="text-[10.5px] text-ink-muted">
                          {step.at ? formatDateTime(step.at) : "Waiting"}
                        </p>
                      </div>
                      {step.comment ? (
                        <p className="mt-1 text-[11.5px] text-ink-secondary">{step.comment}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </PanelBody>
              {entry.completedAt ? (
                <PanelFooter>
                  <span>Completed {formatDateTime(entry.completedAt)}</span>
                  <span className="text-ink-secondary">
                    {Math.round(
                      (new Date(entry.completedAt).getTime() - new Date(entry.raisedAt).getTime()) /
                        3_600_000,
                    )}{" "}
                    hours end to end
                  </span>
                </PanelFooter>
              ) : null}
            </Panel>
          ))}
        </div>
      ) : null}
    </div>
  );
}
