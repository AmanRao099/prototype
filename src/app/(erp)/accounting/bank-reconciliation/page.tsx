import type { Metadata } from "next";
import { Upload } from "lucide-react";
import { ReconciliationView } from "./reconciliation-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import {
  getBankStatement,
  getCashBankAccounts,
  getCashBankEntries,
} from "@/lib/api/client";
import { toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Bank Reconciliation" };

export const instant = false;

export default async function BankReconciliationPage() {
  const [statement, entries, accounts] = await Promise.all([
    getBankStatement("cb-01"),
    getCashBankEntries("cb-01"),
    getCashBankAccounts(),
  ]);

  const account = accounts.find((entry) => entry.id === statement.accountId);

  return (
    <div className="page-stack">
      <PageHeader
        title="Bank Reconciliation"
        subtitle="Match the statement to the ledger and explain what is left"
        note="Phase 2 scope. Statements are imported and matched here; automatic bank feeds are a later phase. Matching never changes a balance - it explains the gap between the bank and the books, and the working is only complete when the difference is nil."
        secondaryActions={[{ label: "Previous reconciliations" }, { label: "Export working" }]}
        actions={
          <ActionButton variant="primary" icon={<Upload className="size-3.5" />}>
            Import statement
          </ActionButton>
        }
      />

      <ReconciliationView
        statement={statement}
        entries={entries}
        bookBalance={toNumber(account?.balance ?? 0)}
      />
    </div>
  );
}
