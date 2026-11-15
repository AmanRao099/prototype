import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { TraceabilityView } from "./traceability-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getBatches, getSerials, getTrace } from "@/lib/api/client";
import { AS_OF } from "@/lib/ageing";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Batches & Serials" };

export const instant = false;

const TRACED_BATCH = "bt-01";

export default async function TraceabilityPage() {
  const [batches, serials, trace] = await Promise.all([
    getBatches(),
    getSerials(),
    getTrace(TRACED_BATCH),
  ]);

  const live = batches.filter((batch) => batch.remainingQty > 0);
  const expiringSoon = live.filter((batch) => {
    if (!batch.expiresOn) return false;
    const days = (new Date(batch.expiresOn).getTime() - AS_OF.getTime()) / 86_400_000;
    return days <= 30;
  });
  const valueAtRisk = expiringSoon.reduce(
    (total, batch) => total + batch.remainingQty * toNumber(batch.unitCost),
    0,
  );
  const quarantined = live.filter((batch) => batch.status === "quarantined").length;
  const serialsOut = serials.filter(
    (serial) => serial.status === "delivered" || serial.status === "reserved",
  ).length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Batches & Serials"
        subtitle="Shelf life, warranty and full movement history"
        note="Phase 2 scope: batch and serial traceability end to end, including quarantine, expiry handling and the recall trail. Phase 1 captured batch and serial numbers on receipt but did not trace them through every movement."
        secondaryActions={[{ label: "Expiry report" }, { label: "Recall trace" }]}
        actions={
          <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
            Record batch
          </ActionButton>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Live batches",
            value: String(live.length),
            caption: `${batches.length - live.length} fully consumed`,
          },
          {
            label: "Expiring within 30 days",
            value: String(expiringSoon.length),
            caption: "Includes batches already past their date",
            tone: expiringSoon.length > 0 ? "critical" : "good",
          },
          {
            label: "Value at risk",
            value: formatMoneyCompact(valueAtRisk),
            caption: "Stock value on short-dated batches",
            tone: valueAtRisk > 0 ? "critical" : "good",
          },
          {
            label: "Serials tracked",
            value: String(serials.length),
            caption: `${serialsOut} reserved or with customers · ${quarantined} batch in quarantine`,
            tone: "muted",
          },
        ]}
      />

      <TraceabilityView
        batches={batches}
        serials={serials}
        trace={trace}
        tracedBatchId={TRACED_BATCH}
      />
    </div>
  );
}
