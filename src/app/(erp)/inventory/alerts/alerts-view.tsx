"use client";

import { useState } from "react";
import { StatusChip } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import type { InventoryAlert, StatusLevel } from "@/lib/types";

const TYPE_LABEL: Record<InventoryAlert["type"], string> = {
  low_stock: "Low stock",
  reorder: "Reorder level",
  expiry: "Expiry",
  negative_stock: "Negative stock",
  overstock: "Overstock",
  non_moving: "Non-moving",
};

const LEVEL_ORDER: Record<StatusLevel, number> = {
  critical: 0,
  serious: 1,
  warning: 2,
  good: 3,
  neutral: 4,
};

export function AlertsView({ alerts }: { alerts: InventoryAlert[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [level, setLevel] = useState("all");

  const needle = search.trim().toLowerCase();

  const rows = alerts
    .filter((alert) => {
      if (type !== "all" && alert.type !== type) return false;
      if (level !== "all" && alert.level !== level) return false;
      if (!needle) return true;
      return (
        alert.item.toLowerCase().includes(needle) ||
        alert.sku.toLowerCase().includes(needle) ||
        alert.warehouse.toLowerCase().includes(needle) ||
        alert.detail.toLowerCase().includes(needle)
      );
    })
    .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  const columns: Array<Column<InventoryAlert>> = [
    {
      key: "item",
      header: "Item",
      cell: (alert) => <CellStack primary={alert.item} secondary={alert.sku} />,
    },
    {
      key: "type",
      header: "Alert",
      cell: (alert) => <StatusChip level={alert.level} label={TYPE_LABEL[alert.type]} />,
    },
    { key: "warehouse", header: "Warehouse", hideBelow: "md", cell: (alert) => alert.warehouse },
    {
      key: "detail",
      header: "Detail",
      cell: (alert) => (
        <span className="block max-w-[520px] truncate" title={alert.detail}>
          {alert.detail}
        </span>
      ),
    },
  ];

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search item, SKU, warehouse or detail"
        filters={[
          {
            id: "type",
            label: "Alert type",
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: "All alert types" },
              ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
          {
            id: "level",
            label: "Severity",
            value: level,
            onChange: setLevel,
            options: [
              { value: "all", label: "All severities" },
              { value: "critical", label: "Critical" },
              { value: "serious", label: "Action due" },
              { value: "warning", label: "Watch" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={alerts.length} noun="alerts" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[860px]"
        emptyMessage="No alerts for this company and branch."
      />
    </Panel>
  );
}
