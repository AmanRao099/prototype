import type { Metadata } from "next";
import { Download, Printer } from "lucide-react";
import { InventoryReportingView } from "./reporting-view";
import { RankedBars } from "@/components/charts/ranked-bars";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
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
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Inventory Reporting"
        subtitle="Current stock, stock summary and ledger, movement, valuation, ageing, batch/serial, expiry, slow stock, reorder and reconciliation"
        phase="limited"
        phaseNote="Core reports in Phase 1"
        actions={
          <>
            <ActionButton icon={<Printer className="size-3.5" />}>Print</ActionButton>
            <ActionButton icon={<Download className="size-3.5" />}>Export to Excel</ActionButton>
          </>
        }
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
