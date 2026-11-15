"use client";

import { useState } from "react";
import { Barcode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { Item, TrackingMode } from "@/lib/types";

const TRACKING_LABEL: Record<TrackingMode, string> = {
  none: "Quantity only",
  batch: "Batch & expiry",
  serial: "Serial numbers",
};

export function ItemsView({ items }: { items: Item[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const needle = search.trim().toLowerCase();

  const rows = items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (stockFilter === "below" && item.onHand >= item.reorderLevel) return false;
    if (stockFilter === "negative" && item.onHand >= 0) return false;
    if (stockFilter === "tracked" && item.tracking === "none") return false;
    if (!needle) return true;
    return (
      item.sku.toLowerCase().includes(needle) ||
      item.name.toLowerCase().includes(needle) ||
      item.brand.toLowerCase().includes(needle) ||
      item.barcode.includes(needle)
    );
  });

  const columns: Array<Column<Item>> = [
    {
      key: "item",
      header: "Item",
      cell: (item) => <CellStack primary={item.name} secondary={`${item.sku} · ${item.brand}`} />,
    },
    { key: "category", header: "Category", hideBelow: "md", cell: (item) => item.category },
    {
      key: "unit",
      header: "Unit",
      hideBelow: "lg",
      cell: (item) =>
        item.altUnit ? (
          <span>
            {item.unit}
            <span className="block text-[10.5px] text-ink-muted">
              1 {item.altUnit} = {item.conversion} {item.unit}
            </span>
          </span>
        ) : (
          item.unit
        ),
    },
    {
      key: "tracking",
      header: "Tracking",
      hideBelow: "xl",
      cell: (item) =>
        item.tracking === "none" ? (
          <span className="text-ink-muted">{TRACKING_LABEL[item.tracking]}</span>
        ) : (
          <Badge tone="accent" dot>
            {TRACKING_LABEL[item.tracking]}
          </Badge>
        ),
    },
    {
      key: "purchase",
      header: "Purchase",
      align: "right",
      hideBelow: "xl",
      cell: (item) => formatMoneyWhole(item.purchasePrice),
    },
    {
      key: "selling",
      header: "Selling",
      align: "right",
      hideBelow: "lg",
      cell: (item) => formatMoneyWhole(item.sellingPrice),
    },
    {
      key: "onHand",
      header: "On hand",
      align: "right",
      cell: (item) => (
        <span className={item.onHand < 0 ? "font-medium text-delta-down" : "font-medium"}>
          {formatQty(item.onHand)}
        </span>
      ),
    },
    {
      key: "reserved",
      header: "Reserved",
      align: "right",
      hideBelow: "md",
      cell: (item) => (item.reserved ? formatQty(item.reserved) : <span className="text-ink-muted">-</span>),
    },
    {
      key: "available",
      header: "Available",
      align: "right",
      cell: (item) => (
        <span className={item.available < 0 ? "text-delta-down" : undefined}>
          {formatQty(item.available)}
        </span>
      ),
    },
    {
      key: "reorder",
      header: "Reorder at",
      align: "right",
      hideBelow: "xl",
      cell: (item) => formatQty(item.reorderLevel),
    },
    {
      key: "value",
      header: "Stock value",
      align: "right",
      cell: (item) => formatMoneyWhole(item.stockValue),
    },
  ];

  const totalValue = rows.reduce((sum, item) => sum + toNumber(item.stockValue), 0);

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search SKU, item, brand or barcode"
        filters={[
          {
            id: "category",
            label: "Category",
            value: category,
            onChange: setCategory,
            options: [
              { value: "all", label: "All categories" },
              ...categories.map((value) => ({ value, label: value })),
            ],
          },
          {
            id: "stock",
            label: "Stock position",
            value: stockFilter,
            onChange: setStockFilter,
            options: [
              { value: "all", label: "All items" },
              { value: "below", label: "Below reorder level" },
              { value: "negative", label: "Negative stock" },
              { value: "tracked", label: "Batch or serial tracked" },
            ],
          },
        ]}
      >
        <span className="hidden items-center gap-1 text-[11px] text-ink-muted sm:inline-flex">
          <Barcode className="size-3.5" aria-hidden />
          Barcode ready
        </span>
        <ResultCount shown={rows.length} total={items.length} noun="items" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1180px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={10}>
              Listed items
            </td>
            <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(totalValue)}</td>
          </>
        }
      />
    </Panel>
  );
}
