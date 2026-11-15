import type { Metadata } from "next";
import { ValuationView } from "./valuation-view";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import {
  getLandedCosts,
  getRevaluations,
  getStandardCosts,
  getValuation,
  getWarehouses,
} from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Valuation & Costing" };

export const instant = false;

export default async function ValuationPage() {
  const [rows, warehouses, standardCosts, revaluations, landedCosts] = await Promise.all([
    getValuation(),
    getWarehouses(),
    getStandardCosts(),
    getRevaluations(),
    getLandedCosts(),
  ]);

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
    <div className="page-stack">
      <PageHeader
        title="Valuation & Costing"
        subtitle="Closing value by costing method"
        note="Phase 2 adds standard-cost variance, revaluation runs and landed-cost apportionment across shipments. FIFO and weighted average remain the Phase 1 bases, and the costing method itself stays a company setting."
        secondaryActions={[{ label: "Export valuation" }]}
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


      <ValuationView
        rows={rows}
        standardCosts={standardCosts}
        revaluations={revaluations}
        landedCosts={landedCosts}
      />
    </div>
  );
}
