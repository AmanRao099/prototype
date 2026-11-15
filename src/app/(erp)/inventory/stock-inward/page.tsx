import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { InwardView } from "./inward-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getGoodsReceipts } from "@/lib/api/client";
import { formatMoneyCompact, formatQty, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Stock Inward" };

export const instant = false;

export default async function StockInwardPage() {
  const receipts = await getGoodsReceipts();

  const posted = receipts.filter((receipt) => receipt.status === "posted");
  const periodReceipts = posted.filter((receipt) => receipt.sourceType !== "opening_stock");
  const quantity = periodReceipts.reduce((sum, receipt) => sum + receipt.quantity, 0);
  const value = periodReceipts.reduce((sum, receipt) => sum + toNumber(receipt.value), 0);
  const pending = receipts.filter((receipt) => receipt.status === "pending_approval");
  const tracked = periodReceipts.filter((receipt) => receipt.tracked !== "none").length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Stock Inward"
        subtitle="Goods received into stock"
        secondaryActions={[{ label: "Verify quantities" }]}
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>New goods receipt</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Receipts this period",
            value: String(periodReceipts.length),
            caption: "Excludes the opening-stock upload",
          },
          {
            label: "Quantity received",
            value: formatQty(quantity),
            caption: "Base units across all lines",
          },
          {
            label: "Value received",
            value: formatMoneyCompact(value),
            caption: "Posted to the inventory control account",
          },
          {
            label: "Awaiting approval",
            value: String(pending.length),
            caption: `${tracked} receipts carry batch or serial detail`,
            tone: pending.length > 0 ? "critical" : "good",
          },
        ]}
      />

      <InwardView receipts={receipts} />
    </div>
  );
}
