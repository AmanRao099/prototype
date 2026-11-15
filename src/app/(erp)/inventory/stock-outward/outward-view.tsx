"use client";

import { useState } from "react";
import { MovementStatusPill } from "@/components/inventory/movement-status";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { StockIssue } from "@/lib/types";

const ISSUE_LABEL: Record<StockIssue["issueType"], string> = {
  sales_delivery: "Sales delivery",
  internal_consumption: "Internal consumption",
  damaged: "Damaged stock",
  sample: "Sample issue",
};

export function OutwardView({ issues }: { issues: StockIssue[] }) {
  const [search, setSearch] = useState("");
  const [issueType, setIssueType] = useState("all");
  const [warehouse, setWarehouse] = useState("all");

  const warehouses = Array.from(new Set(issues.map((issue) => issue.warehouse))).sort();
  const needle = search.trim().toLowerCase();

  const rows = issues.filter((issue) => {
    if (issueType !== "all" && issue.issueType !== issueType) return false;
    if (warehouse !== "all" && issue.warehouse !== warehouse) return false;
    if (!needle) return true;
    return (
      issue.number.toLowerCase().includes(needle) ||
      issue.party.toLowerCase().includes(needle) ||
      (issue.reference ?? "").toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<StockIssue>> = [
    {
      key: "number",
      header: "Issue note",
      cell: (issue) => <CellStack primary={issue.number} secondary={formatDate(issue.date)} />,
    },
    {
      key: "party",
      header: "Customer / destination",
      cell: (issue) => (
        <CellStack
          primary={issue.party}
          secondary={issue.reference ? `Against ${issue.reference}` : ISSUE_LABEL[issue.issueType]}
        />
      ),
    },
    {
      key: "type",
      header: "Issue type",
      hideBelow: "lg",
      cell: (issue) => ISSUE_LABEL[issue.issueType],
    },
    { key: "warehouse", header: "Warehouse", hideBelow: "md", cell: (issue) => issue.warehouse },
    { key: "lines", header: "Lines", align: "right", hideBelow: "md", cell: (issue) => issue.lineCount },
    { key: "quantity", header: "Quantity", align: "right", cell: (issue) => formatQty(issue.quantity) },
    {
      key: "value",
      header: "Cost of goods",
      align: "right",
      cell: (issue) => <span className="font-medium">{formatMoneyWhole(issue.value)}</span>,
    },
    { key: "issuedBy", header: "Issued by", hideBelow: "xl", cell: (issue) => issue.issuedBy },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (issue) => <MovementStatusPill status={issue.status} />,
    },
  ];

  const totals = rows.reduce(
    (acc, issue) => ({
      quantity: acc.quantity + issue.quantity,
      value: acc.value + toNumber(issue.value),
    }),
    { quantity: 0, value: 0 },
  );

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search issue note, customer or source document"
        filters={[
          {
            id: "type",
            label: "Issue type",
            value: issueType,
            onChange: setIssueType,
            options: [
              { value: "all", label: "All issue types" },
              ...Object.entries(ISSUE_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
          {
            id: "warehouse",
            label: "Warehouse",
            value: warehouse,
            onChange: setWarehouse,
            options: [
              { value: "all", label: "All warehouses" },
              ...warehouses.map((value) => ({ value, label: value })),
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={issues.length} noun="issues" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1040px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={5}>
              Listed issues
            </td>
            <td className="px-3 py-2 text-right tnum">{formatQty(totals.quantity)}</td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.value)}</td>
            <td className="px-3 py-2" colSpan={2} />
          </>
        }
      />
    </Panel>
  );
}
