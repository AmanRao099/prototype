import type { Metadata } from "next";
import { Plus, Settings2 } from "lucide-react";
import { RankedBars } from "@/components/charts/ranked-bars";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getWarehouses } from "@/lib/api/client";
import { formatMoneyCompact, formatMoneyWhole, toNumber } from "@/lib/format";
import type { Warehouse } from "@/lib/types";

export const metadata: Metadata = { title: "Warehouse Management" };

export const instant = false;

const KIND_LABEL: Record<Warehouse["kind"], string> = {
  main: "Main store",
  depot: "Depot",
  bonded: "Bonded",
  retail: "Retail counter",
  transit: "In transit",
};

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();

  const stored = warehouses.filter((warehouse) => warehouse.kind !== "transit");
  const totalValue = warehouses.reduce((sum, warehouse) => sum + toNumber(warehouse.stockValue), 0);
  const bins = stored.reduce((sum, warehouse) => sum + warehouse.binCount, 0);
  const avgUtilisation =
    stored.reduce((sum, warehouse) => sum + warehouse.utilisationPct, 0) / stored.length;
  const inTransit = warehouses.find((warehouse) => warehouse.kind === "transit");

  const columns: Array<Column<Warehouse>> = [
    {
      key: "name",
      header: "Warehouse",
      cell: (warehouse) => (
        <CellStack primary={warehouse.name} secondary={`${warehouse.code} · ${warehouse.location}`} />
      ),
    },
    { key: "kind", header: "Type", hideBelow: "md", cell: (warehouse) => KIND_LABEL[warehouse.kind] },
    { key: "manager", header: "Manager", hideBelow: "lg", cell: (warehouse) => warehouse.manager },
    {
      key: "bins",
      header: "Bins",
      align: "right",
      hideBelow: "md",
      cell: (warehouse) => (warehouse.binCount ? warehouse.binCount : <span className="text-ink-muted">-</span>),
    },
    { key: "skus", header: "SKUs", align: "right", cell: (warehouse) => warehouse.skuCount },
    {
      key: "utilisation",
      header: "Space used",
      align: "right",
      hideBelow: "sm",
      cell: (warehouse) =>
        warehouse.kind === "transit" ? (
          <span className="text-ink-muted">n/a</span>
        ) : (
          <span className={warehouse.utilisationPct >= 90 ? "text-delta-down" : undefined}>
            {warehouse.utilisationPct}%
          </span>
        ),
    },
    {
      key: "value",
      header: "Stock value",
      align: "right",
      cell: (warehouse) => (
        <span className="font-medium">{formatMoneyWhole(warehouse.stockValue)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Warehouse Management"
        subtitle="Multiple warehouses, locations and bins, warehouse-wise stock, allocation and valuation"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Settings2 className="size-3.5" />}>Bin layout</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New warehouse
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Storage locations",
            value: String(stored.length),
            caption: `${bins} bins mapped`,
          },
          {
            label: "Stock on hand",
            value: formatMoneyCompact(totalValue),
            caption: "Ties to the inventory control account",
          },
          {
            label: "Average space used",
            value: `${avgUtilisation.toFixed(0)}%`,
            caption: "Port Bonded is the tightest at 91%",
          },
          {
            label: "In transit",
            value: formatMoneyCompact(inTransit?.stockValue ?? 0),
            caption: `${inTransit?.skuCount ?? 0} SKUs between warehouses`,
            tone: "muted",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader title="Stock value by warehouse" subtitle="Weighted-average valuation" />
          <PanelBody>
            <RankedBars
              bars={warehouses.map((warehouse) => ({
                id: warehouse.id,
                label: warehouse.name,
                value: toNumber(warehouse.stockValue),
                meta: `${warehouse.skuCount} SKUs`,
              }))}
              formatValue={formatMoneyCompact}
            />
          </PanelBody>
        </Panel>

        <Panel className="self-start">
          <PanelHeader title="Space utilisation" subtitle="Share of mapped bin capacity in use" />
          <PanelBody>
            <RankedBars
              bars={stored.map((warehouse) => ({
                id: warehouse.id,
                label: warehouse.name,
                value: warehouse.utilisationPct,
                meta: `${warehouse.binCount} bins`,
              }))}
              formatValue={(value) => `${value}%`}
              color="var(--series-3)"
            />
          </PanelBody>
          <PanelFooter>
            <span>Above 90% blocks put-away</span>
          </PanelFooter>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Warehouses" subtitle="Locations, ownership and current position" />
        <DataTable columns={columns} rows={warehouses} minWidth="min-w-[860px]" />
      </Panel>
    </div>
  );
}
