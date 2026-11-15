import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { SalesView } from "./sales-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getSalesInvoices } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Sales & Invoicing" };

export const instant = false;

export default async function SalesInvoicingPage() {
  const invoices = await getSalesInvoices();

  const billable = invoices.filter((invoice) => invoice.invoiceType !== "proforma");
  const invoiced = billable
    .filter((invoice) => invoice.invoiceType !== "credit_note")
    .reduce((sum, invoice) => sum + toNumber(invoice.total), 0);
  const received = billable.reduce((sum, invoice) => sum + toNumber(invoice.received), 0);
  const outstanding = billable.reduce((sum, invoice) => sum + toNumber(invoice.balance), 0);
  const vat = billable
    .filter((invoice) => invoice.invoiceType !== "credit_note")
    .reduce((sum, invoice) => sum + toNumber(invoice.vat), 0);
  const overdue = invoices.filter((invoice) => invoice.status === "overdue").length;
  const credited = invoices
    .filter((invoice) => invoice.invoiceType === "credit_note")
    .reduce((sum, invoice) => sum + toNumber(invoice.total), 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="Sales & Invoicing"
        subtitle="Invoices, credit notes and collection status"
        secondaryActions={[{ label: "Sales register" }]}
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>New invoice</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Invoiced",
            value: formatMoneyCompact(invoiced),
            caption: `VAT ${formatMoneyCompact(vat)} on posted sales`,
          },
          {
            label: "Received",
            value: formatMoneyCompact(received),
            caption: `${((received / invoiced) * 100).toFixed(0)}% collected`,
            tone: "good",
          },
          {
            label: "Outstanding",
            value: formatMoneyCompact(outstanding),
            caption: `${overdue} invoices overdue`,
            tone: overdue > 0 ? "critical" : "default",
          },
          {
            label: "Credit notes",
            value: formatMoneyCompact(credited),
            caption: "Sales returns and rate adjustments",
            tone: "muted",
          },
        ]}
      />

      <SalesView invoices={invoices} />
    </div>
  );
}
