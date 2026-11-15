"use client";

import { useState } from "react";
import { MovementStatusPill } from "@/components/inventory/movement-status";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { StockAdjustmentDoc } from "@/lib/types";

const REASON_LABEL: Record<StockAdjustmentDoc["reason"], string> = {
  damage: "Damaged stock",
  expiry: "Expired stock",
  physical_count: "Physical verification",
  shortage: "Shortage",
  reclassification: "Reclassification",
};

export function AdjustmentView({ adjustments }: { adjustments: StockAdjustmentDoc[] }) {
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("all");
  const [direction, setDirection] = useState("all");

  const needle = search.trim().toLowerCase();

  const rows = adjustments.filter((adjustment) => {
    if (reason !== "all" && adjustment.reason !== reason) return false;
    if (direction !== "all" && adjustment.direction !== direction) return false;
    if (!needle) return true;
    return (
      adjustment.number.toLowerCase().includes(needle) ||
      adjustment.warehouse.toLowerCase().includes(needle) ||
      adjustment.requestedBy.toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<StockAdjustmentDoc>> = [
    {
      key: "number",
      header: "Adjustment",
      cell: (adjustment) => (
        <CellStack primary={adjustment.number} secondary={formatDate(adjustment.date)} />
      ),
    },
    { key: "warehouse", header: "Warehouse", cell: (adjustment) => adjustment.warehouse },
    {
      key: "reason",
      header: "Reason",
      hideBelow: "md",
      cell: (adjustment) => REASON_LABEL[adjustment.reason],
    },
    {
      key: "direction",
      header: "Direction",
      hideBelow: "lg",
      cell: (adjustment) =>
        adjustment.direction === "increase" ? (
          <span className="text-ink-secondary">Increase</span>
        ) : (
          <span className="text-delta-down">Decrease</span>
        ),
    },
    {
      key: "lines",
      header: "Lines",
      align: "right",
      hideBelow: "md",
      cell: (adjustment) => adjustment.lineCount,
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      cell: (adjustment) => (
        <span className={adjustment.direction === "decrease" ? "text-delta-down" : undefined}>
          {adjustment.direction === "decrease" ? "-" : "+"}
          {formatQty(adjustment.quantity)}
        </span>
      ),
    },
    {
      key: "value",
      header: "Value impact",
      align: "right",
      cell: (adjustment) => (
        <span
          className={
            adjustment.direction === "decrease" ? "font-medium text-delta-down" : "font-medium"
          }
        >
          {adjustment.direction === "decrease" ? "-" : "+"}
          {formatMoneyWhole(adjustment.value)}
        </span>
      ),
    },
    {
      key: "approval",
      header: "Authorised by",
      hideBelow: "xl",
      cell: (adjustment) =>
        adjustment.approvedBy ? (
          <CellStack primary={adjustment.approvedBy} secondary={`Raised by ${adjustment.requestedBy}`} />
        ) : (
          <CellStack primary="Not approved" secondary={`Raised by ${adjustment.requestedBy}`} />
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (adjustment) => <MovementStatusPill status={adjustment.status} />,
    },
  ];

  const net = rows.reduce(
    (sum, adjustment) =>
      sum + (adjustment.direction === "increase" ? 1 : -1) * toNumber(adjustment.value),
    0,
  );

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search adjustment, warehouse or requester"
        filters={[
          {
            id: "reason",
            label: "Reason",
            value: reason,
            onChange: setReason,
            options: [
              { value: "all", label: "All reasons" },
              ...Object.entries(REASON_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
          {
            id: "direction",
            label: "Direction",
            value: direction,
            onChange: setDirection,
            options: [
              { value: "all", label: "Increase and decrease" },
              { value: "increase", label: "Increase only" },
              { value: "decrease", label: "Decrease only" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={adjustments.length} noun="adjustments" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1080px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={6}>
              Net value impact on the listed adjustments
            </td>
            <td className={`px-3 py-2 text-right tnum ${net < 0 ? "text-delta-down" : ""}`}>
              {formatMoneyWhole(net)}
            </td>
            <td className="px-3 py-2" colSpan={2} />
          </>
        }
      />
    </Panel>
  );
}
