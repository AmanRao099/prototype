"use client";

import { DataTableView } from "@/components/charts/data-table-view";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { formatQty } from "@/lib/format";
import type { StockMovementSummary } from "@/lib/types";

const SERIES = ["Inward", "Outward"];

export function StockMovementPanel({ movement }: { movement: StockMovementSummary[] }) {
  return (
    <>
      <GroupedBarChart
        seriesNames={SERIES}
        groups={movement.map((day) => ({ label: day.label, values: [day.inward, day.outward] }))}
        formatValue={(value) => formatQty(value, "units")}
        height={200}
      />
      <DataTableView
        caption="Posted stock movement quantities by day"
        columns={["Day", ...SERIES]}
        rows={movement.map((day) => ({
          key: day.label,
          cells: [day.label, formatQty(day.inward), formatQty(day.outward)],
        }))}
      />
    </>
  );
}
