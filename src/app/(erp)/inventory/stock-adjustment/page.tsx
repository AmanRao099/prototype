import type { Metadata } from "next";
import { Plus, ShieldAlert } from "lucide-react";
import { AdjustmentView } from "./adjustment-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getStockAdjustments } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Stock Adjustment" };

export const instant = false;

export default async function StockAdjustmentPage() {
  const adjustments = await getStockAdjustments();

  const posted = adjustments.filter((adjustment) => adjustment.status === "posted");
  const increases = posted
    .filter((adjustment) => adjustment.direction === "increase")
    .reduce((sum, adjustment) => sum + toNumber(adjustment.value), 0);
  const decreases = posted
    .filter((adjustment) => adjustment.direction === "decrease")
    .reduce((sum, adjustment) => sum + toNumber(adjustment.value), 0);
  const pending = adjustments.filter((adjustment) => adjustment.status === "pending_approval");
  const counts = posted.filter((adjustment) => adjustment.reason === "physical_count").length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Stock Adjustment"
        subtitle="Authorised corrections to stock on hand"
        note="Adjustments are the only way to change stock on hand outside a posted movement. Every line carries a reason, an authoriser and an audit entry; direct edits to a quantity field are not permitted."
        secondaryActions={[{ label: "Start count sheet" }]}
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>New adjustment</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Write-ups",
            value: formatMoneyCompact(increases),
            caption: "Positive adjustments posted",
          },
          {
            label: "Write-downs",
            value: formatMoneyCompact(decreases),
            caption: "Damage, expiry and shortages",
            tone: "critical",
          },
          {
            label: "Net impact",
            value: formatMoneyCompact(increases - decreases),
            caption: "Charged to cost of goods sold",
            tone: increases - decreases < 0 ? "critical" : "good",
          },
          {
            label: "Awaiting approval",
            value: String(pending.length),
            caption: `${counts} physical counts reconciled this period`,
            icon: pending.length > 0 ? <ShieldAlert className="size-3 text-warning" /> : undefined,
            tone: pending.length > 0 ? "critical" : "good",
          },
        ]}
      />


      <AdjustmentView adjustments={adjustments} />
    </div>
  );
}
