import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { LedgerView } from "./ledger-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getAccounts, getJournals, getLedger } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "General Ledger" };

export const instant = false;

export default async function GeneralLedgerPage() {
  const [journals, ledger, accounts] = await Promise.all([
    getJournals(),
    getLedger("1200"),
    getAccounts(),
  ]);

  const posted = journals.filter((entry) => entry.status === "posted");
  const unposted = journals.filter((entry) =>
    ["draft", "pending_approval"].includes(entry.status),
  );
  const postedDebit = posted.reduce((sum, entry) => sum + toNumber(entry.totalDebit), 0);
  const postedCredit = posted.reduce((sum, entry) => sum + toNumber(entry.totalCredit), 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="General Ledger"
        subtitle="Journal vouchers and account statements"
        secondaryActions={[{ label: "Export" }]}
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>New journal entry</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Posted debit",
            value: formatMoneyCompact(postedDebit),
            caption: `${posted.length} posted vouchers`,
          },
          {
            label: "Posted credit",
            value: formatMoneyCompact(postedCredit),
            caption:
              postedDebit === postedCredit ? "Balanced against debit" : "Out of balance - review",
            tone: postedDebit === postedCredit ? "good" : "critical",
          },
          {
            label: "Unposted vouchers",
            value: String(unposted.length),
            caption: "Draft and pending approval",
            tone: unposted.length > 0 ? "muted" : "good",
          },
          {
            label: "Reversed this period",
            value: String(journals.filter((entry) => entry.status === "reversed").length),
            caption: "Corrections use controlled reversals",
            tone: "muted",
          },
        ]}
      />

      <LedgerView journals={journals} ledger={ledger} accounts={accounts} />
    </div>
  );
}
