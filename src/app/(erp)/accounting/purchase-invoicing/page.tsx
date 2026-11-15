import type { Metadata } from "next";
import { Download, Plus } from "lucide-react";
import { PurchaseView } from "./purchase-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getPurchaseInvoices } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Purchase & Supplier Invoicing" };

export const instant = false;

export default async function PurchaseInvoicingPage() {
  const invoices = await getPurchaseInvoices();

  const bills = invoices.filter((invoice) => invoice.invoiceType !== "debit_note");
  const purchased = bills.reduce((sum, invoice) => sum + toNumber(invoice.total), 0);
  const paid = bills.reduce((sum, invoice) => sum + toNumber(invoice.paid), 0);
  const balance = bills.reduce((sum, invoice) => sum + toNumber(invoice.balance), 0);
  const inputVat = bills.reduce((sum, invoice) => sum + toNumber(invoice.vat), 0);
  const landed = bills.reduce((sum, invoice) => sum + toNumber(invoice.additionalCharges), 0);
  const awaitingApproval = invoices.filter(
    (invoice) => invoice.status === "pending_approval",
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Purchase & Supplier Invoicing"
        subtitle="Purchase invoices, cash purchases, returns, debit notes, VAT, additional charges and landed cost"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Download className="size-3.5" />}>Purchase register</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New purchase invoice
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Purchased",
            value: formatMoneyCompact(purchased),
            caption: `Input VAT ${formatMoneyCompact(inputVat)}`,
          },
          {
            label: "Paid",
            value: formatMoneyCompact(paid),
            caption: `${((paid / purchased) * 100).toFixed(0)}% settled`,
            tone: "good",
          },
          {
            label: "Open balance",
            value: formatMoneyCompact(balance),
            caption: `${awaitingApproval} invoices awaiting approval`,
          },
          {
            label: "Additional charges",
            value: formatMoneyCompact(landed),
            caption: "Freight and handling allocated to landed cost",
            tone: "muted",
          },
        ]}
      />

      <PurchaseView invoices={invoices} />
    </div>
  );
}
