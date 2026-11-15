import type { Metadata } from "next";
import { ArrowLeftRight, Plus } from "lucide-react";
import { CashBankView } from "./cash-bank-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import {
  getCashBankAccounts,
  getCashBankEntries,
  getPayments,
  getReceipts,
} from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Cash & Bank" };

export const instant = false;

export default async function CashBankPage() {
  const [accounts, entries, receipts, payments] = await Promise.all([
    getCashBankAccounts(),
    getCashBankEntries("cb-01"),
    getReceipts(),
    getPayments(),
  ]);

  const total = accounts.reduce((sum, account) => sum + toNumber(account.balance), 0);
  const bankTotal = accounts
    .filter((account) => account.kind === "bank")
    .reduce((sum, account) => sum + toNumber(account.balance), 0);
  const receiptTotal = receipts
    .filter((receipt) => receipt.status === "posted")
    .reduce((sum, receipt) => sum + toNumber(receipt.amount), 0);
  const paymentTotal = payments
    .filter((payment) => payment.status === "posted")
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const unreconciled = accounts.reduce((sum, account) => sum + account.unreconciledCount, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Cash & Bank"
        subtitle="Cash and bank accounts, receipts, payments, fund transfers, petty cash and daily closing"
        phase="limited"
        phaseNote="Bank reconciliation automation in Phase 2"
        actions={
          <>
            <ActionButton icon={<ArrowLeftRight className="size-3.5" />}>Fund transfer</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New voucher
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Cash & bank balance",
            value: formatMoneyCompact(total),
            caption: `Bank ${formatMoneyCompact(bankTotal)} of the total`,
          },
          {
            label: "Receipts this period",
            value: formatMoneyCompact(receiptTotal),
            caption: `${receipts.length} receipt vouchers`,
            tone: "good",
          },
          {
            label: "Payments this period",
            value: formatMoneyCompact(paymentTotal),
            caption: `${payments.filter((p) => p.status === "pending_approval").length} awaiting approval`,
          },
          {
            label: "Unreconciled entries",
            value: String(unreconciled),
            caption: "Manual matching until Phase 2 bank feeds",
            tone: unreconciled > 0 ? "critical" : "good",
          },
        ]}
      />

      <CashBankView
        accounts={accounts}
        entries={entries}
        receipts={receipts}
        payments={payments}
      />
    </div>
  );
}
