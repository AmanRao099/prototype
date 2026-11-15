"use client";

import { useState } from "react";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { ValuationRow } from "@/lib/types";

export function ValuationView({ rows }: { rows: ValuationRow[] }) {
  const [method, setMethod] = useState("wavg");
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");

  const warehouses = Array.from(new Set(rows.map((row) => row.warehouse))).sort();
  const needle = search.trim().toLowerCase();

  const filtered = rows.filter((row) => {
    if (warehouse !== "all" && row.warehouse !== warehouse) return false;
    if (!needle) return true;
    return row.sku.toLowerCase().includes(needle) || row.item.toLowerCase().includes(needle);
  });

  const rateFor = (row: ValuationRow) =>
    method === "fifo" ? toNumber(row.fifoRate) : toNumber(row.weightedAvgRate);
  const valueFor = (row: ValuationRow) => row.quantity * rateFor(row) + toNumber(row.landedCost);

  const columns: Array<Column<ValuationRow>> = [
    {
      key: "item",
      header: "Item",
      cell: (row) => <CellStack primary={row.item} secondary={row.sku} />,
    },
    { key: "warehouse", header: "Warehouse", hideBelow: "md", cell: (row) => row.warehouse },
    {
      key: "quantity",
      header: "Quantity",
      align: "right",
      cell: (row) => formatQty(row.quantity, row.unit),
    },
    {
      key: "wavg",
      header: "W.Avg rate",
      align: "right",
      hideBelow: "lg",
      cell: (row) => (
        <span className={method === "wavg" ? "font-medium text-ink" : "text-ink-muted"}>
          {formatMoneyWhole(row.weightedAvgRate)}
        </span>
      ),
    },
    {
      key: "fifo",
      header: "FIFO rate",
      align: "right",
      hideBelow: "lg",
      cell: (row) => (
        <span className={method === "fifo" ? "font-medium text-ink" : "text-ink-muted"}>
          {formatMoneyWhole(row.fifoRate)}
        </span>
      ),
    },
    {
      key: "landed",
      header: "Landed cost",
      align: "right",
      hideBelow: "xl",
      cell: (row) =>
        toNumber(row.landedCost) ? (
          formatMoneyWhole(row.landedCost)
        ) : (
          <span className="text-ink-muted">-</span>
        ),
    },
    {
      key: "lastMovement",
      header: "Last movement",
      hideBelow: "xl",
      cell: (row) => formatDate(row.lastMovementOn),
    },
    {
      key: "value",
      header: "Closing value",
      align: "right",
      cell: (row) => <span className="font-medium">{formatMoneyWhole(valueFor(row))}</span>,
    },
  ];

  const total = filtered.reduce((sum, row) => sum + valueFor(row), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          tabs={[
            { id: "wavg", label: "Weighted average" },
            { id: "fifo", label: "FIFO" },
          ]}
          active={method}
          onChange={setMethod}
        />
        <p className="text-[11px] text-ink-muted">
          Costing method is a company setting; both bases are shown for comparison.
        </p>
      </div>

      <Panel>
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search item or SKU"
          filters={[
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
          <ResultCount shown={filtered.length} total={rows.length} noun="lines" />
        </Toolbar>

        <DataTable
          columns={columns}
          rows={filtered}
          minWidth="min-w-[1080px]"
          footer={
            <>
              <td className="px-4 py-2" colSpan={7}>
                Closing value on {method === "fifo" ? "FIFO" : "weighted average"}
              </td>
              <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(total)}</td>
            </>
          }
        />
      </Panel>
    </div>
  );
}
