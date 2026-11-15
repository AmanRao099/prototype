import type { Metadata } from "next";
import { InventoryReportingView } from "./reporting-view";
import { RankedBars } from "@/components/charts/ranked-bars";
import { PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import {
  getInventoryReports,
  getItems,
  getStockLedger,
  getWarehouses,
} from "@/lib/api/client";
import { formatMoneyCompact, formatQty, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Inventory Reporting" };

export const instant = false;

export default async function InventoryReportingPage() {
  const [ledger, reports, items, warehouses] = await Promise.all([
    getStockLedger(),
    getInventoryReports(),
    getItems(),
    getWarehouses(),
  ]);

  const stockValue = warehouses.reduce((sum, warehouse) => sum + toNumber(warehouse.stockValue), 0);
  const inward = ledger.reduce((sum, row) => sum + row.inQty, 0);
  const outward = ledger.reduce((sum, row) => sum + row.outQty, 0);
  const slowMoving = items.filter(
    (item) => item.onHand > 0 && item.tracking !== "serial" && item.reserved === 0,
  ).length;

  const byCategory = Object.entries(
    items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + Math.max(toNumber(item.stockValue), 0);
      return acc;
    }, {}),
  )
    .map(([category, value]) => ({ id: category, label: category, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="page-stack">
      <PageHeader
        title="Inventory Reporting"
        subtitle="Stock ledger and report catalogue"
        note="Core stock reports in Phase 1. Ageing analytics and full batch/serial traceability reports follow in Phase 2."
        secondaryActions={[{ label: "Print" }, { label: "Export to Excel" }]}
      />

      <SummaryStrip
        items={[
          {
            label: "Stock on hand",
            value: formatMoneyCompact(stockValue),
            caption: `${items.length} items across ${warehouses.length} locations`,
          },
          {
            label: "Inward (ledger)",
            value: formatQty(inward),
            caption: "Units received in the sampled ledger",
          },
          {
            label: "Outward (ledger)",
            value: formatQty(outward),
            caption: "Units issued in the sampled ledger",
          },
          {
            label: "Unreserved lines",
            value: String(slowMoving),
            caption: "Candidates for the slow-stock review",
            tone: "muted",
          },
        ]}
      />

      <Panel>
        <PanelHeader title="Stock value by category" subtitle="Weighted-average valuation" />
        <PanelBody>
          <RankedBars bars={byCategory} formatValue={formatMoneyCompact} />
        </PanelBody>
      </Panel>

      <InventoryReportingView ledger={ledger} reports={reports} />
    </div>
  );
}
