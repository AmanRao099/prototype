import type { Metadata } from "next";
import { CalendarClock, Download, Plus } from "lucide-react";
import {
  PartyLedgerView,
  type OpenDocument,
} from "@/components/accounting/party-ledger-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getPurchaseInvoices, getSuppliers } from "@/lib/api/client";
import { AS_OF, bucketise, daysOverdue } from "@/lib/ageing";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Accounts Payable" };

export const instant = false;

export default async function AccountsPayablePage() {
  const [suppliers, invoices] = await Promise.all([getSuppliers(), getPurchaseInvoices()]);

  const documents: OpenDocument[] = invoices
    .filter((invoice) => invoice.invoiceType !== "debit_note" && toNumber(invoice.balance) > 0)
    .map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date,
      dueDate: invoice.dueDate,
      party: invoice.supplier,
      total: invoice.total,
      settled: invoice.paid,
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

  const outstanding = suppliers.reduce((sum, party) => sum + toNumber(party.outstanding), 0);
  const overdue = suppliers.reduce((sum, party) => sum + toNumber(party.overdue), 0);

  const weekAhead = new Date(AS_OF.getTime() + 7 * 86_400_000);
  const dueThisWeek = documents.filter((document) => {
    const due = new Date(document.dueDate);
    return due >= AS_OF && due <= weekAhead;
  });
  const dueThisWeekValue = dueThisWeek.reduce(
    (sum, document) => sum + toNumber(document.balance),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Accounts Payable"
        subtitle="Supplier accounts, supplier invoices, payment vouchers, debit notes and ageing"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<CalendarClock className="size-3.5" />}>Payment run</ActionButton>
            <ActionButton icon={<Download className="size-3.5" />}>Export ageing</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              Record payment
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Total payable",
            value: formatMoneyCompact(outstanding),
            caption: `${documents.length} open supplier invoices`,
          },
          {
            label: "Overdue",
            value: formatMoneyCompact(overdue),
            caption: `${((overdue / outstanding) * 100).toFixed(1)}% of the book`,
            tone: "critical",
          },
          {
            label: "Due in 7 days",
            value: formatMoneyCompact(dueThisWeekValue),
            caption: `${dueThisWeek.length} invoices fall due`,
          },
          {
            label: "Active suppliers",
            value: String(suppliers.filter((party) => party.isActive).length),
            caption: `${suppliers.length} on file`,
            tone: "muted",
          },
        ]}
      />

      <PartyLedgerView
        parties={suppliers}
        documents={documents}
        ageing={ageing}
        partyNoun="Suppliers"
        documentNoun="Bill"
        settledLabel="Paid"
      />
    </div>
  );
}
