"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { MovementStatusPill } from "@/components/inventory/movement-status";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { StockTransferDoc } from "@/lib/types";

export function TransferView({ transfers }: { transfers: StockTransferDoc[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const needle = search.trim().toLowerCase();

  const rows = transfers.filter((transfer) => {
    if (status !== "all" && transfer.status !== status) return false;
    if (!needle) return true;
    return (
      transfer.number.toLowerCase().includes(needle) ||
      transfer.fromWarehouse.toLowerCase().includes(needle) ||
      transfer.toWarehouse.toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<StockTransferDoc>> = [
    {
      key: "number",
      header: "Transfer",
      cell: (transfer) => (
        <CellStack primary={transfer.number} secondary={formatDate(transfer.date)} />
      ),
    },
    {
      key: "route",
      header: "Route",
      cell: (transfer) => (
        <span className="inline-flex items-center gap-1.5 text-ink">
          {transfer.fromWarehouse}
          <ArrowRight className="size-3 shrink-0 text-ink-muted" aria-hidden />
          {transfer.toWarehouse}
        </span>
      ),
    },
    {
      key: "lines",
      header: "Lines",
      align: "right",
      hideBelow: "md",
      cell: (transfer) => transfer.lineCount,
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      cell: (transfer) => formatQty(transfer.quantity),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      cell: (transfer) => <span className="font-medium">{formatMoneyWhole(transfer.value)}</span>,
    },
    {
      key: "dispatched",
      header: "Dispatched",
      hideBelow: "lg",
      cell: (transfer) =>
        transfer.dispatchedOn ? (
          formatDate(transfer.dispatchedOn)
        ) : (
          <span className="text-ink-muted">Not dispatched</span>
        ),
    },
    {
      key: "received",
      header: "Received",
      hideBelow: "lg",
      cell: (transfer) =>
        transfer.receivedOn ? (
          formatDate(transfer.receivedOn)
        ) : (
          <span className="text-ink-muted">Open</span>
        ),
    },
    {
      key: "requestedBy",
      header: "Requested by",
      hideBelow: "xl",
      cell: (transfer) => transfer.requestedBy,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (transfer) => <MovementStatusPill status={transfer.status} />,
    },
  ];

  const totals = rows.reduce(
    (acc, transfer) => ({
      quantity: acc.quantity + transfer.quantity,
      value: acc.value + toNumber(transfer.value),
    }),
    { quantity: 0, value: 0 },
  );

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search transfer number or warehouse"
        filters={[
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All transfers" },
              { value: "pending_approval", label: "Awaiting approval" },
              { value: "in_transit", label: "In transit" },
              { value: "received", label: "Received" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={transfers.length} noun="transfers" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1060px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={3}>
              Listed transfers
            </td>
            <td className="px-3 py-2 text-right tnum">{formatQty(totals.quantity)}</td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.value)}</td>
            <td className="px-3 py-2" colSpan={4} />
          </>
        }
      />
    </Panel>
  );
}
