import type { Metadata } from "next";
import { Download, Plus, Upload } from "lucide-react";
import { ItemsView } from "./items-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getItems } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Item & Product Master" };

export const instant = false;

export default async function ItemsPage() {
  const items = await getItems();

  const stockValue = items.reduce((sum, item) => sum + toNumber(item.stockValue), 0);
  const belowReorder = items.filter((item) => item.onHand < item.reorderLevel).length;
  const tracked = items.filter((item) => item.tracking !== "none").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Item & Product Master"
        subtitle="SKU codes, barcodes, categories, brands, units and conversions, prices, VAT and batch/serial tracking"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Upload className="size-3.5" />}>Import items</ActionButton>
            <ActionButton icon={<Download className="size-3.5" />}>Export</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New item
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Items loaded",
            value: String(items.filter((item) => item.isActive).length),
            caption: `Sample of the 1,284-SKU catalogue`,
          },
          {
            label: "Stock value",
            value: formatMoneyCompact(stockValue),
            caption: "Weighted average valuation",
          },
          {
            label: "Below reorder level",
            value: String(belowReorder),
            caption: "Raise purchase cover",
            tone: belowReorder > 0 ? "critical" : "good",
          },
          {
            label: "Batch or serial tracked",
            value: String(tracked),
            caption: "Traceability enforced on movement",
            tone: "muted",
          },
        ]}
      />

      <ItemsView items={items} />
    </div>
  );
}
