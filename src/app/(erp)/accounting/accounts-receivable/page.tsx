import type { Metadata } from "next";
import { Download, Plus, Send } from "lucide-react";
import {
  PartyLedgerView,
  type OpenDocument,
} from "@/components/accounting/party-ledger-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getCustomers, getSalesInvoices } from "@/lib/api/client";
import { bucketise, daysOverdue } from "@/lib/ageing";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Accounts Receivable" };

export const instant = false;

export default async function AccountsReceivablePage() {
  const [customers, invoices] = await Promise.all([getCustomers(), getSalesInvoices()]);

  const documents: OpenDocument[] = invoices
    .filter((invoice) => invoice.invoiceType !== "credit_note" && toNumber(invoice.balance) > 0)
    .map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date,
      dueDate: invoice.dueDate,
      party: invoice.customer,
      total: invoice.total,
      settled: invoice.received,
      balance: invoice.balance,
      status: invoice.status,
      daysOverdue: daysOverdue(invoice.dueDate),
    }));

  const ageing = bucketise(
    documents.map((document) => ({
      dueDate: document.dueDate,
      balance: toNumber(document.balance),
    })),
  );

  const outstanding = customers.reduce((sum, party) => sum + toNumber(party.outstanding), 0);
  const overdue = customers.reduce((sum, party) => sum + toNumber(party.overdue), 0);
  const overLimit = customers.filter(
    (party) => party.creditLimit && toNumber(party.outstanding) / toNumber(party.creditLimit) >= 0.9,
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Accounts Receivable"
        subtitle="Customer accounts, invoices, receipts, credit notes, ageing and credit limits"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Send className="size-3.5" />}>Send statements</ActionButton>
            <ActionButton icon={<Download className="size-3.5" />}>Export ageing</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              Record receipt
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Total outstanding",
            value: formatMoneyCompact(outstanding),
            caption: `${documents.length} open invoices`,
          },
          {
            label: "Overdue",
            value: formatMoneyCompact(overdue),
            caption: `${((overdue / outstanding) * 100).toFixed(1)}% of the book`,
            tone: "critical",
          },
          {
            label: "Near or over credit limit",
            value: String(overLimit),
            caption: "Customers at 90% of limit or above",
            tone: overLimit > 0 ? "critical" : "good",
          },
          {
            label: "Active customers",
            value: String(customers.filter((party) => party.isActive).length),
            caption: `${customers.length} on file`,
            tone: "muted",
          },
        ]}
      />

      <PartyLedgerView
        parties={customers}
        documents={documents}
        ageing={ageing}
        partyNoun="Customers"
        documentNoun="Invoice"
        settledLabel="Received"
        showCreditLimit
      />
    </div>
  );
}
