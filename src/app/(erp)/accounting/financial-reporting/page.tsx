import type { Metadata } from "next";
import { ReportingView, type AgeingAnalytics, type AgeingMatrixRow } from "./reporting-view";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import {
  getCustomers,
  getPurchaseInvoices,
  getReportCatalogue,
  getSalesInvoices,
  getSuppliers,
  getTrialBalance,
} from "@/lib/api/client";
import { AS_OF, daysOverdue } from "@/lib/ageing";
import { formatMoneyCompact, toNumber } from "@/lib/format";
import { buildBalanceSheet, buildCashFlow, buildProfitAndLoss } from "@/lib/statements";

export const metadata: Metadata = { title: "Financial Reporting" };

export const instant = false;

const PERIOD_LABEL = "November 2026";
const BUCKETS = ["Not due", "1-30 days", "31-60 days", "61-90 days", "90+ days"];
/** Days elapsed in the financial year, used for DSO and DPO. */
const FY_DAYS_ELAPSED = Math.round(
  (AS_OF.getTime() - new Date("2026-04-01T00:00:00+05:30").getTime()) / 86_400_000,
);

function bucketIndex(dueDate: string): number {
  const overdue = daysOverdue(dueDate);
  if (overdue === 0) return 0;
  if (overdue <= 30) return 1;
  if (overdue <= 60) return 2;
  if (overdue <= 90) return 3;
  return 4;
}

function buildMatrix(
  documents: Array<{ party: string; dueDate: string; balance: number }>,
): AgeingMatrixRow[] {
  const byParty = new Map<string, AgeingMatrixRow>();

  for (const document of documents) {
    if (document.balance <= 0) continue;
    const row =
      byParty.get(document.party) ??
      ({
        id: document.party,
        party: document.party,
        buckets: BUCKETS.map(() => 0),
        total: 0,
        oldestDays: 0,
      } satisfies AgeingMatrixRow);

    row.buckets[bucketIndex(document.dueDate)] += document.balance;
    row.total += document.balance;
    row.oldestDays = Math.max(row.oldestDays, daysOverdue(document.dueDate));
    byParty.set(document.party, row);
  }

  return [...byParty.values()].sort((a, b) => b.total - a.total);
}

export default async function FinancialReportingPage() {
  const [trialBalance, reports, salesInvoices, purchaseInvoices, customers, suppliers] =
    await Promise.all([
      getTrialBalance(),
      getReportCatalogue(),
      getSalesInvoices(),
      getPurchaseInvoices(),
      getCustomers(),
      getSuppliers(),
    ]);

  const profitAndLoss = buildProfitAndLoss(trialBalance);
  const balanceSheet = buildBalanceSheet(trialBalance, profitAndLoss.netProfitYtd);
  const cashFlow = buildCashFlow(trialBalance, profitAndLoss.netProfitPeriod);

  const receivableDocuments = salesInvoices
    .filter((invoice) => invoice.invoiceType !== "credit_note" && toNumber(invoice.balance) > 0)
    .map((invoice) => ({
      party: invoice.customer,
      dueDate: invoice.dueDate,
      balance: toNumber(invoice.balance),
    }));
  const payableDocuments = purchaseInvoices
    .filter((invoice) => invoice.invoiceType !== "debit_note" && toNumber(invoice.balance) > 0)
    .map((invoice) => ({
      party: invoice.supplier,
      dueDate: invoice.dueDate,
      balance: toNumber(invoice.balance),
    }));

  const outstanding = customers.reduce((sum, party) => sum + toNumber(party.outstanding), 0);
  const overdue = customers.reduce((sum, party) => sum + toNumber(party.overdue), 0);
  const payable = suppliers.reduce((sum, party) => sum + toNumber(party.outstanding), 0);
  const cogsYtd = toNumber(trialBalance.find((row) => row.accountCode === "5100")?.closingDebit ?? 0);

  const ageing: AgeingAnalytics = {
    bucketLabels: BUCKETS,
    receivables: buildMatrix(receivableDocuments),
    payables: buildMatrix(payableDocuments),
    dso: (outstanding / profitAndLoss.revenueYtd) * FY_DAYS_ELAPSED,
    dpo: (payable / cogsYtd) * FY_DAYS_ELAPSED,
    overdueSharePct: (overdue / outstanding) * 100,
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Financial Reporting"
        subtitle="Statements, trial balance, ageing and registers"
        note="Phase 2 adds profit & loss, balance sheet, cash flow and ageing analytics. Every statement is derived from the trial balance, so a statement cannot disagree with the ledger behind it."
        secondaryActions={[{ label: "Print" }, { label: "Export to Excel" }]}
      />

      <SummaryStrip
        items={[
          {
            label: "Revenue (year to date)",
            value: formatMoneyCompact(profitAndLoss.revenueYtd),
            caption: `${formatMoneyCompact(profitAndLoss.revenuePeriod)} in ${PERIOD_LABEL}`,
          },
          {
            label: "Net profit (year to date)",
            value: formatMoneyCompact(profitAndLoss.netProfitYtd),
            caption: `${((profitAndLoss.netProfitYtd / profitAndLoss.revenueYtd) * 100).toFixed(1)}% net margin`,
            tone: profitAndLoss.netProfitYtd >= 0 ? "good" : "critical",
          },
          {
            label: "Operating cash flow",
            value: formatMoneyCompact(cashFlow.operating),
            caption: `${PERIOD_LABEL}, indirect method`,
          },
          {
            label: "Balance sheet",
            value: balanceSheet.balanced ? "Balanced" : "Out of balance",
            caption: `Assets ${formatMoneyCompact(balanceSheet.totalAssets)}`,
            tone: balanceSheet.balanced ? "good" : "critical",
          },
        ]}
      />

      <ReportingView
        trialBalance={trialBalance}
        reports={reports}
        profitAndLoss={profitAndLoss}
        balanceSheet={balanceSheet}
        cashFlow={cashFlow}
        ageing={ageing}
        periodLabel={PERIOD_LABEL}
      />
    </div>
  );
}
