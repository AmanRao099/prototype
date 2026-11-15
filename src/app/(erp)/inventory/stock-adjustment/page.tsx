import type { Metadata } from "next";
import { ClipboardList, Plus, ShieldAlert } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Stock Adjustment"
        subtitle="Positive and negative adjustments, damaged and expired stock, physical verification, reconciliation and approvals"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<ClipboardList className="size-3.5" />}>Start count sheet</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New adjustment
            </ActionButton>
          </>
        }
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

      <p className="rounded-[10px] border border-hairline bg-surface px-4 py-3 text-[12px] text-ink-secondary">
        Adjustments are the only way to change stock on hand outside a posted movement. Every line
        carries a reason, an authoriser and an audit entry; direct edits to a quantity field are not
        permitted.
      </p>

      <AdjustmentView adjustments={adjustments} />
    </div>
  );
}
