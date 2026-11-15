import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { OutwardView } from "./outward-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getItems, getStockIssues } from "@/lib/api/client";
import { formatMoneyCompact, formatQty, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Stock Outward" };

export const instant = false;

export default async function StockOutwardPage() {
  const [issues, items] = await Promise.all([getStockIssues(), getItems()]);

  const posted = issues.filter((issue) => issue.status === "posted");
  const quantity = posted.reduce((sum, issue) => sum + issue.quantity, 0);
  const cogs = posted.reduce((sum, issue) => sum + toNumber(issue.value), 0);
  const deliveries = posted.filter((issue) => issue.issueType === "sales_delivery").length;
  const reserved = items.reduce((sum, item) => sum + item.reserved, 0);
  const pending = issues.filter((issue) => issue.status === "pending_approval").length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Stock Outward"
        subtitle="Issues, deliveries and reservations"
        secondaryActions={[{ label: "Delivery notes" }]}
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>New stock issue</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Issues posted",
            value: String(posted.length),
            caption: `${deliveries} against sales invoices`,
          },
          {
            label: "Quantity issued",
            value: formatQty(quantity),
            caption: "Base units across all lines",
          },
          {
            label: "Cost of goods issued",
            value: formatMoneyCompact(cogs),
            caption: "Posted at weighted-average cost",
          },
          {
            label: "Reserved stock",
            value: formatQty(reserved),
            caption: pending > 0 ? `${pending} issue awaiting approval` : "Allocated to open orders",
            tone: pending > 0 ? "critical" : "muted",
          },
        ]}
      />

      <OutwardView issues={issues} />
    </div>
  );
}
