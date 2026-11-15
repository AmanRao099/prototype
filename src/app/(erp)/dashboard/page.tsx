import type { Metadata } from "next";
import { Download, RefreshCw } from "lucide-react";
import { DataTableView } from "@/components/charts/data-table-view";
import { RankedBars } from "@/components/charts/ranked-bars";
import { ActivityTable } from "@/components/dashboard/activity-table";
import { AgeingPanel } from "@/components/dashboard/ageing-panel";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { ApprovalsPanel } from "@/components/dashboard/approvals-panel";
import { IntegrityPanel } from "@/components/dashboard/integrity-panel";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { ReceivablesPanel } from "@/components/dashboard/receivables-panel";
import { SalesPurchasePanel } from "@/components/dashboard/sales-purchase-panel";
import { StockMovementPanel } from "@/components/dashboard/stock-movement-panel";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { USING_MOCK_DATA, getDashboard } from "@/lib/api/client";
import { formatDateTime, formatMoneyCompact, formatMoneyWhole, formatQty } from "@/lib/format";
import { PERIOD_COMPARISON, PERIOD_LABEL, parsePeriod } from "@/lib/periods";

// Live operational data: this route renders per request rather than at build time.
export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Financial overview, sales and purchase summary, receivables, payables and stock position.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period = parsePeriod(rawPeriod);
  const data = await getDashboard(period);

  const stockTotal = data.warehouses.reduce((sum, warehouse) => sum + warehouse.stockValue, 0);
  const criticalAlerts = data.alerts.filter((alert) => alert.level === "critical").length;

  return (
    <div className="flex flex-col gap-4">
      {/* page header and the single filter row above the charts */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="t-page-title">Dashboard</h1>
            {USING_MOCK_DATA ? (
              <Badge tone="accent" dot>
                Sample data
              </Badge>
            ) : null}
          </div>
          <p className="t-caption mt-1">
            {PERIOD_LABEL[period]} - figures as at {formatDateTime(data.generatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter active={period} />
          <ActionButton icon={<RefreshCw className="size-3.5" />}>Refresh</ActionButton>
          <ActionButton icon={<Download className="size-3.5" />}>Export</ActionButton>
        </div>
      </div>

      {/* financial overview: stat tiles, the number is the chart */}
      <section aria-label="Financial overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <KpiTile key={kpi.key} kpi={kpi} comparisonLabel={PERIOD_COMPARISON[period]} />
        ))}
      </section>

      {/* sales / purchase summary plus the accounting control position */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Sales and purchases"
            subtitle="Posted invoice value by month, both measures on one axis"
            href="/accounting/financial-reporting"
            hrefLabel="Registers"
          />
          <PanelBody>
            <SalesPurchasePanel series={data.salesVsPurchase} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Accounting controls" subtitle="Posting integrity and open VAT position" />
          <IntegrityPanel trialBalance={data.trialBalance} vat={data.vat} />
        </Panel>
      </div>

      {/* receivables / payables and the stock position */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Receivables and payables ageing"
            subtitle="Outstanding balances by ageing bucket"
            href="/accounting/accounts-receivable"
            hrefLabel="Statements"
          />
          <PanelBody>
            <AgeingPanel buckets={data.ageing} />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Stock value by warehouse"
            subtitle="Weighted-average valuation of on-hand stock"
            href="/inventory/valuation"
            hrefLabel="Valuation"
          />
          <PanelBody>
            <RankedBars
              bars={data.warehouses.map((warehouse) => ({
                id: warehouse.warehouseId,
                label: warehouse.warehouse,
                value: warehouse.stockValue,
                meta: `${warehouse.skuCount} SKUs - ${warehouse.utilisationPct}% used`,
              }))}
              formatValue={formatMoneyCompact}
            />
            <DataTableView
              caption="Stock value, SKU count and space utilisation by warehouse"
              columns={["Warehouse", "Stock value", "SKUs", "Utilisation"]}
              rows={data.warehouses.map((warehouse) => ({
                key: warehouse.warehouseId,
                cells: [
                  warehouse.warehouse,
                  formatMoneyWhole(warehouse.stockValue),
                  String(warehouse.skuCount),
                  `${warehouse.utilisationPct}%`,
                ],
              }))}
            />
          </PanelBody>
          <PanelFooter>
            <span>Total on-hand value</span>
            <span className="font-medium tnum text-ink">{formatMoneyWhole(stockTotal)}</span>
          </PanelFooter>
        </Panel>
      </div>

      {/* operational queues */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel>
          <PanelHeader
            title="Inventory alerts"
            subtitle={`${criticalAlerts} critical of ${data.alerts.length} open`}
            href="/inventory/alerts"
          />
          <AlertsPanel alerts={data.alerts} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Pending approvals"
            subtitle={`${data.approvals.length} documents waiting on you`}
            href="/system/approvals"
          />
          <ApprovalsPanel approvals={data.approvals} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Stock movement"
            subtitle="Posted inward and outward quantities, last 7 days"
            href="/inventory/reporting"
          />
          <PanelBody>
            <StockMovementPanel movement={data.stockMovement} />
          </PanelBody>
          <PanelFooter>
            <span>Net movement</span>
            <span className="font-medium tnum text-ink">
              {formatQty(
                data.stockMovement.reduce((sum, day) => sum + day.inward - day.outward, 0),
                "units",
              )}
            </span>
          </PanelFooter>
        </Panel>
      </div>

      {/* ledger activity and customer exposure */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title="Recent postings"
            subtitle="Every posted document carries a balanced journal"
            href="/accounting/general-ledger"
            hrefLabel="General ledger"
          />
          <ActivityTable rows={data.activity} />
        </Panel>

        <Panel>
          <PanelHeader
            title="Customer exposure"
            subtitle="Highest outstanding balances"
            href="/accounting/accounts-receivable"
          />
          <ReceivablesPanel parties={data.topReceivables} />
        </Panel>
      </div>
    </div>
  );
}
