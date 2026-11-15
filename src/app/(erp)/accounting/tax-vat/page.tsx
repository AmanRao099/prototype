import type { Metadata } from "next";
import { VatView } from "./vat-view";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getVatReturn } from "@/lib/api/client";
import { formatDate, formatMoneyCompact, toNumber } from "@/lib/format";
import { AS_OF } from "@/lib/ageing";

export const metadata: Metadata = { title: "Tax & VAT" };

export const instant = false;

export default async function TaxVatPage() {
  const { boxes, periods, codes } = await getVatReturn();

  const current = periods[0];
  const outputVat = toNumber(current?.outputVat ?? 0);
  const inputVat = toNumber(current?.inputVat ?? 0);
  const daysToDue = current
    ? Math.round((new Date(current.dueDate).getTime() - AS_OF.getTime()) / 86_400_000)
    : 0;

  return (
    <div className="page-stack">
      <PageHeader
        title="Tax & VAT"
        subtitle="Return workings, tax codes and filing history"
        note="One tax jurisdiction in Phase 1. The return workings and transaction report are produced here; filing stays a manual step."
        secondaryActions={[{ label: "Tax settings" }, { label: "Transaction report" }]}
      />

      <SummaryStrip
        items={[
          {
            label: "Output VAT",
            value: formatMoneyCompact(outputVat),
            caption: `${current?.label ?? ""} on standard-rated sales`,
          },
          {
            label: "Input VAT",
            value: formatMoneyCompact(inputVat),
            caption: "Recoverable on purchases and expenses",
          },
          {
            label: "Net payable",
            value: formatMoneyCompact(outputVat - inputVat),
            caption: "Payable to the tax authority",
          },
          {
            label: "Return due",
            value: current ? formatDate(current.dueDate) : "-",
            caption: daysToDue >= 0 ? `${daysToDue} days remaining` : `${Math.abs(daysToDue)} days late`,
            tone: daysToDue <= 14 ? "critical" : "default",
          },
        ]}
      />

      <VatView boxes={boxes} periods={periods} codes={codes} />
    </div>
  );
}
