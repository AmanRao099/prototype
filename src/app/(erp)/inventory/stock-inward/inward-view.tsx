"use client";

import { useState } from "react";
import { MovementStatusPill } from "@/components/inventory/movement-status";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { GoodsReceipt } from "@/lib/types";

const SOURCE_LABEL: Record<GoodsReceipt["sourceType"], string> = {
  purchase_receipt: "Purchase receipt",
  direct_entry: "Direct entry",
  opening_stock: "Opening stock",
  sales_return: "Sales return",
};

export function InwardView({ receipts }: { receipts: GoodsReceipt[] }) {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [warehouse, setWarehouse] = useState("all");

  const warehouses = Array.from(new Set(receipts.map((receipt) => receipt.warehouse))).sort();
  const needle = search.trim().toLowerCase();

  const rows = receipts.filter((receipt) => {
    if (source !== "all" && receipt.sourceType !== source) return false;
    if (warehouse !== "all" && receipt.warehouse !== warehouse) return false;
    if (!needle) return true;
    return (
      receipt.number.toLowerCase().includes(needle) ||
      receipt.party.toLowerCase().includes(needle) ||
      (receipt.reference ?? "").toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<GoodsReceipt>> = [
    {
      key: "number",
      header: "Receipt",
      cell: (receipt) => <CellStack primary={receipt.number} secondary={formatDate(receipt.date)} />,
    },
    {
      key: "party",
      header: "Supplier / source",
      cell: (receipt) => (
        <CellStack
          primary={receipt.party}
          secondary={receipt.reference ? `Against ${receipt.reference}` : SOURCE_LABEL[receipt.sourceType]}
        />
      ),
    },
    {
      key: "source",
      header: "Type",
      hideBelow: "lg",
      cell: (receipt) => SOURCE_LABEL[receipt.sourceType],
    },
    { key: "warehouse", header: "Warehouse", hideBelow: "md", cell: (receipt) => receipt.warehouse },
    {
      key: "tracked",
      header: "Traceability",
      hideBelow: "xl",
      cell: (receipt) =>
        receipt.tracked === "none" ? (
          <span className="text-ink-muted">Quantity only</span>
        ) : (
          <Badge tone="accent" dot>
            {receipt.tracked === "batch" ? "Batch & expiry" : "Serial numbers"}
          </Badge>
        ),
    },
    {
      key: "lines",
      header: "Lines",
      align: "right",
      hideBelow: "md",
      cell: (receipt) => receipt.lineCount,
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      cell: (receipt) => formatQty(receipt.quantity),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      cell: (receipt) => <span className="font-medium">{formatMoneyWhole(receipt.value)}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (receipt) => <MovementStatusPill status={receipt.status} />,
    },
  ];

  const totals = rows.reduce(
    (acc, receipt) => ({
      quantity: acc.quantity + receipt.quantity,
      value: acc.value + toNumber(receipt.value),
    }),
    { quantity: 0, value: 0 },
  );

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search receipt, supplier or source document"
        filters={[
          {
            id: "source",
            label: "Receipt type",
            value: source,
            onChange: setSource,
            options: [
              { value: "all", label: "All receipt types" },
              ...Object.entries(SOURCE_LABEL).map(([value, label]) => ({ value, label })),
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
        <ResultCount shown={rows.length} total={receipts.length} noun="receipts" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1060px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={6}>
              Listed receipts
            </td>
            <td className="px-3 py-2 text-right tnum">{formatQty(totals.quantity)}</td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.value)}</td>
            <td className="px-4 py-2" />
          </>
        }
      />
    </Panel>
  );
}
