"use client";

import { DataTableView } from "@/components/charts/data-table-view";
import { LineChart } from "@/components/charts/line-chart";
import { formatMoneyWhole } from "@/lib/format";
import type { TimeSeries } from "@/lib/types";

export function SalesPurchasePanel({ series }: { series: TimeSeries }) {
  return (
    <>
      <LineChart
        seriesNames={series.seriesNames}
        points={series.points}
        formatValue={formatMoneyWhole}
      />
      <DataTableView
        caption="Monthly posted sales and purchases"
        columns={["Month", ...series.seriesNames]}
        rows={series.points.map((point) => ({
          key: point.label,
          cells: [point.label, ...point.values.map((value) => formatMoneyWhole(value))],
        }))}
      />
    </>
  );
}
