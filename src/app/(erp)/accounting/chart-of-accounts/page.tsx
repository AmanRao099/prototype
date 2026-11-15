import type { Metadata } from "next";
import { Download, Plus, Upload } from "lucide-react";
import { AccountsView } from "./accounts-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getAccounts } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";
import type { Account, AccountType } from "@/lib/types";

export const metadata: Metadata = { title: "Chart of Accounts" };

// Live ledger balances: render per request, not at build time.
export const instant = false;

function totalFor(accounts: Account[], type: AccountType): number {
  return accounts
    .filter((account) => account.type === type && account.level <= 1 && !account.isGroup)
    .reduce((sum, account) => sum + toNumber(account.balance), 0);
}

export default async function ChartOfAccountsPage() {
  const accounts = await getAccounts();

  const postable = accounts.filter((account) => !account.isGroup);
  const assets = accounts.find((account) => account.code === "1000");
  const liabilities = accounts.find((account) => account.code === "2000");
  const equity = accounts.find((account) => account.code === "3000");

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Chart of Accounts"
        subtitle="Account groups, hierarchy, opening balances and cash/bank accounts"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Upload className="size-3.5" />}>Import</ActionButton>
            <ActionButton icon={<Download className="size-3.5" />}>Export</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New account
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Total assets",
            value: formatMoneyCompact(assets?.balance ?? 0),
            caption: `${accounts.filter((a) => a.type === "asset").length} asset accounts`,
          },
          {
            label: "Total liabilities",
            value: formatMoneyCompact(liabilities?.balance ?? 0),
            caption: `Payables ${formatMoneyCompact(totalFor(accounts, "liability"))}`,
          },
          {
            label: "Equity",
            value: formatMoneyCompact(equity?.balance ?? 0),
            caption: "Share capital and retained earnings",
          },
          {
            label: "Postable accounts",
            value: String(postable.length),
            caption: `${accounts.length - postable.length} groups, ${postable.filter((a) => a.isBankOrCash).length} cash/bank`,
            tone: "muted",
          },
        ]}
      />

      <AccountsView accounts={accounts} />
    </div>
  );
}
