import type { Metadata } from "next";
import { Download, Printer } from "lucide-react";
import { ReportingView } from "./reporting-view";
import { RankedBars } from "@/components/charts/ranked-bars";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getReportCatalogue, getTrialBalance } from "@/lib/api/client";
import { formatMoneyCompact, formatMoneyWhole, toNumber } from "@/lib/format";
import type { AccountType, TrialBalanceRow } from "@/lib/types";

export const metadata: Metadata = { title: "Financial Reporting" };

export const instant = false;

function closingFor(rows: TrialBalanceRow[], type: AccountType): number {
  return rows
    .filter((row) => row.type === type)
    .reduce(
      (sum, row) =>
        sum +
        (type === "income" || type === "liability" || type === "equity"
          ? toNumber(row.closingCredit) - toNumber(row.closingDebit)
          : toNumber(row.closingDebit) - toNumber(row.closingCredit)),
      0,
    );
}

export default async function FinancialReportingPage() {
  const [trialBalance, reports] = await Promise.all([getTrialBalance(), getReportCatalogue()]);

  const income = closingFor(trialBalance, "income");
  const expenses = closingFor(trialBalance, "expense");
  const assets = closingFor(trialBalance, "asset");
  const liabilities = closingFor(trialBalance, "liability");
  const equity = closingFor(trialBalance, "equity");
  const netProfit = income - expenses;

  const totalDebit = trialBalance.reduce((sum, row) => sum + toNumber(row.closingDebit), 0);
  const totalCredit = trialBalance.reduce((sum, row) => sum + toNumber(row.closingCredit), 0);

  const expenseBars = trialBalance
    .filter((row) => row.type === "expense")
    .map((row) => ({
      id: row.accountCode,
      label: row.accountName,
      value: toNumber(row.closingDebit),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Financial Reporting"
        subtitle="Trial balance, profit & loss, balance sheet, ledgers, ageing, registers and VAT reports"
        phase="limited"
        phaseNote="Core reports in Phase 1"
        actions={
          <>
            <ActionButton icon={<Printer className="size-3.5" />}>Print</ActionButton>
            <ActionButton icon={<Download className="size-3.5" />}>Export to Excel</ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Income",
            value: formatMoneyCompact(income),
            caption: "Net of sales returns and discounts",
          },
          {
            label: "Expenses",
            value: formatMoneyCompact(expenses),
            caption: "Cost of sales and operating expenses",
          },
          {
            label: "Net profit",
            value: formatMoneyCompact(netProfit),
            caption: `${((netProfit / income) * 100).toFixed(1)}% of income`,
            tone: netProfit >= 0 ? "good" : "critical",
          },
          {
            label: "Trial balance",
            value: Math.abs(totalDebit - totalCredit) < 1 ? "Balanced" : "Out of balance",
            caption: `Dr ${formatMoneyCompact(totalDebit)} / Cr ${formatMoneyCompact(totalCredit)}`,
            tone: Math.abs(totalDebit - totalCredit) < 1 ? "good" : "critical",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="Profit & loss summary" subtitle="Financial year to date" />
          <PanelBody>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Income</dt>
                <dd className="font-medium tnum text-ink">{formatMoneyWhole(income)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Cost of goods sold</dt>
                <dd className="font-medium tnum text-ink">
                  {formatMoneyWhole(
                    toNumber(
                      trialBalance.find((row) => row.accountCode === "5100")?.closingDebit ?? 0,
                    ),
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-hairline pt-2">
                <dt className="text-ink-secondary">Operating expenses</dt>
                <dd className="font-medium tnum text-ink">
                  {formatMoneyWhole(
                    expenses -
                      toNumber(
                        trialBalance.find((row) => row.accountCode === "5100")?.closingDebit ?? 0,
                      ),
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-hairline pt-2 text-[13px]">
                <dt className="font-medium text-ink">Net profit</dt>
                <dd className="font-semibold tnum text-ink">{formatMoneyWhole(netProfit)}</dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Balance sheet position" subtitle="As at the reporting date" />
          <PanelBody>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Total assets</dt>
                <dd className="font-medium tnum text-ink">{formatMoneyWhole(assets)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Total liabilities</dt>
                <dd className="font-medium tnum text-ink">{formatMoneyWhole(liabilities)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-secondary">Equity</dt>
                <dd className="font-medium tnum text-ink">{formatMoneyWhole(equity)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-hairline pt-2 text-[13px]">
                <dt className="font-medium text-ink">Retained result</dt>
                <dd className="font-semibold tnum text-ink">
                  {formatMoneyWhole(assets - liabilities - equity)}
                </dd>
              </div>
            </dl>
          </PanelBody>
          <PanelFooter>
            <span>Current-year profit is carried into equity at year end</span>
          </PanelFooter>
        </Panel>

        <Panel>
          <PanelHeader title="Expense accounts" subtitle="Closing debit by account" />
          <PanelBody>
            <RankedBars bars={expenseBars} formatValue={formatMoneyCompact} />
          </PanelBody>
        </Panel>
      </div>

      <ReportingView trialBalance={trialBalance} reports={reports} />
    </div>
  );
}
