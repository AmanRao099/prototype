"use client";

import { DataTableView } from "@/components/charts/data-table-view";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { formatMoneyWhole } from "@/lib/format";
import type { AgeingBucket } from "@/lib/types";

const SERIES = ["Receivable", "Payable"];

export function AgeingPanel({ buckets }: { buckets: AgeingBucket[] }) {
  return (
    <>
      <GroupedBarChart
        seriesNames={SERIES}
        groups={buckets.map((bucket) => ({
          label: bucket.label,
          values: [bucket.receivable, bucket.payable],
        }))}
        formatValue={formatMoneyWhole}
        height={300}
      />
      <DataTableView
        caption="Receivable and payable outstanding by ageing bucket"
        columns={["Bucket", ...SERIES]}
        rows={buckets.map((bucket) => ({
          key: bucket.label,
          cells: [bucket.label, formatMoneyWhole(bucket.receivable), formatMoneyWhole(bucket.payable)],
        }))}
      />
    </>
  );
}
