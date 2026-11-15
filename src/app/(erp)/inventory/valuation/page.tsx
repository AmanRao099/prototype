import type { Metadata } from "next";
import { Download } from "lucide-react";
import { ValuationView } from "./valuation-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getValuation, getWarehouses } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Valuation & Costing" };

export const instant = false;

export default async function ValuationPage() {
  const [rows, warehouses] = await Promise.all([getValuation(), getWarehouses()]);

  const totalValue = warehouses.reduce((sum, warehouse) => sum + toNumber(warehouse.stockValue), 0);
  const wavg = rows.reduce(
    (sum, row) => sum + row.quantity * toNumber(row.weightedAvgRate) + toNumber(row.landedCost),
    0,
  );
  const fifo = rows.reduce(
    (sum, row) => sum + row.quantity * toNumber(row.fifoRate) + toNumber(row.landedCost),
    0,
  );
  const landed = rows.reduce((sum, row) => sum + toNumber(row.landedCost), 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Valuation & Costing"
        subtitle="FIFO, weighted average, item and warehouse valuation, landed cost allocation and movement costing"
        phase="limited"
        phaseNote="FIFO and weighted average in Phase 1"
        actions={<ActionButton icon={<Download className="size-3.5" />}>Export valuation</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Stock value (W.Avg)",
            value: formatMoneyCompact(wavg),
            caption: "Top items shown; company costing method",
          },
          {
            label: "Stock value (FIFO)",
            value: formatMoneyCompact(fifo),
            caption: `${formatMoneyCompact(fifo - wavg)} higher than weighted average`,
          },
          {
            label: "Landed cost allocated",
            value: formatMoneyCompact(landed),
            caption: "Freight and duty carried into stock",
          },
          {
            label: "Inventory control account",
            value: formatMoneyCompact(totalValue),
            caption: "Full ledger balance across every SKU",
            tone: "muted",
          },
        ]}
      />

      <p className="rounded-[10px] border border-hairline bg-surface px-4 py-3 text-[12px] text-ink-secondary">
        Standard costing, revaluation runs and full landed-cost apportionment across shipments are
        Phase 2 items. Phase 1 values movements at the configured method and allocates landed cost
        on the receipt that carries it.
      </p>

      <ValuationView rows={rows} />
    </div>
  );
}
