"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, FileSpreadsheet } from "lucide-react";
import { StatementTable } from "@/components/accounting/statement-table";
import { Badge, PhaseBadge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatPercent, toNumber } from "@/lib/format";
import type { BalanceSheet, CashFlow, ProfitAndLoss } from "@/lib/statements";
import type { ReportDefinition, TrialBalanceRow } from "@/lib/types";

type TrialRow = TrialBalanceRow & { id: string };

export interface AgeingMatrixRow {
  id: string;
  party: string;
  buckets: number[];
  total: number;
  oldestDays: number;
}

export interface AgeingAnalytics {
  bucketLabels: string[];
  receivables: AgeingMatrixRow[];
  payables: AgeingMatrixRow[];
  dso: number;
  dpo: number;
  overdueSharePct: number;
}

export function ReportingView({
  trialBalance,
  reports,
  profitAndLoss,
  balanceSheet,
  cashFlow,
  ageing,
  periodLabel,
}: {
  trialBalance: TrialBalanceRow[];
  reports: ReportDefinition[];
  profitAndLoss: ProfitAndLoss;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlow;
  ageing: AgeingAnalytics;
  periodLabel: string;
}) {
  const [tab, setTab] = useState("pnl");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [ageingSide, setAgeingSide] = useState<"receivables" | "payables">("receivables");

  const needle = search.trim().toLowerCase();
  const rows: TrialRow[] = trialBalance
    .filter((row) => {
      if (type !== "all" && row.type !== type) return false;
      if (!needle) return true;
      return row.accountName.toLowerCase().includes(needle) || row.accountCode.includes(needle);
    })
    .map((row) => ({ ...row, id: row.accountCode }));

  const totals = rows.reduce(
    (acc, row) => ({
      openingDebit: acc.openingDebit + toNumber(row.openingDebit),
      openingCredit: acc.openingCredit + toNumber(row.openingCredit),
      periodDebit: acc.periodDebit + toNumber(row.periodDebit),
      periodCredit: acc.periodCredit + toNumber(row.periodCredit),
      closingDebit: acc.closingDebit + toNumber(row.closingDebit),
      closingCredit: acc.closingCredit + toNumber(row.closingCredit),
    }),
    {
      openingDebit: 0,
      openingCredit: 0,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
    },
  );
  const balanced = Math.abs(totals.closingDebit - totals.closingCredit) < 1;

  const trialColumns: Array<Column<TrialRow>> = [
    {
      key: "account",
      header: "Account",
      cell: (row) => <CellStack primary={row.accountName} secondary={row.accountCode} />,
    },
    {
      key: "openingDebit",
      header: "Opening Dr",
      align: "right",
      hideBelow: "xl",
      cell: (row) => (toNumber(row.openingDebit) ? formatMoneyWhole(row.openingDebit) : "-"),
    },
    {
      key: "openingCredit",
      header: "Opening Cr",
      align: "right",
      hideBelow: "xl",
      cell: (row) => (toNumber(row.openingCredit) ? formatMoneyWhole(row.openingCredit) : "-"),
    },
    {
      key: "periodDebit",
      header: "Period Dr",
      align: "right",
      hideBelow: "md",
      cell: (row) => (toNumber(row.periodDebit) ? formatMoneyWhole(row.periodDebit) : "-"),
    },
    {
      key: "periodCredit",
      header: "Period Cr",
      align: "right",
      hideBelow: "md",
      cell: (row) => (toNumber(row.periodCredit) ? formatMoneyWhole(row.periodCredit) : "-"),
    },
    {
      key: "closingDebit",
      header: "Closing Dr",
      align: "right",
      cell: (row) =>
        toNumber(row.closingDebit) ? (
          <span className="font-medium">{formatMoneyWhole(row.closingDebit)}</span>
        ) : (
          "-"
        ),
    },
    {
      key: "closingCredit",
      header: "Closing Cr",
      align: "right",
      cell: (row) =>
        toNumber(row.closingCredit) ? (
          <span className="font-medium">{formatMoneyWhole(row.closingCredit)}</span>
        ) : (
          "-"
        ),
    },
  ];

  const ageingRows = ageing[ageingSide];
  const ageingColumns: Array<Column<AgeingMatrixRow>> = [
    { key: "party", header: ageingSide === "receivables" ? "Customer" : "Supplier", cell: (row) => row.party },
    ...ageing.bucketLabels.map((label, index) => ({
      key: label,
      header: label,
      align: "right" as const,
      cell: (row: AgeingMatrixRow) =>
        row.buckets[index] ? (
          <span className={index >= 2 ? "text-delta-down" : undefined}>
            {formatMoneyWhole(row.buckets[index])}
          </span>
        ) : (
          <span className="text-ink-muted">-</span>
        ),
    })),
    {
      key: "oldest",
      header: "Oldest",
      align: "right",
      hideBelow: "lg",
      cell: (row) => `${row.oldestDays} days`,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (row) => <span className="font-medium">{formatMoneyWhole(row.total)}</span>,
    },
  ];

  const bucketTotals = ageing.bucketLabels.map((_, index) =>
    ageingRows.reduce((total, row) => total + row.buckets[index], 0),
  );
  const ageingTotal = ageingRows.reduce((total, row) => total + row.total, 0);

  const categories = Array.from(new Set(reports.map((report) => report.category)));

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "pnl", label: "Profit & loss" },
          { id: "balance", label: "Balance sheet" },
          { id: "cashflow", label: "Cash flow" },
          { id: "trial", label: "Trial balance", count: trialBalance.length },
          { id: "ageing", label: "Ageing" },
          { id: "catalogue", label: "Catalogue", count: reports.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "pnl" ? (
        <Panel>
          <PanelHeader
            title="Profit & loss"
            subtitle={`${periodLabel} against the year to date, derived from the ledger`}
          />
          <StatementTable lines={profitAndLoss.lines} periodLabel={periodLabel} />
          <PanelFooter>
            <span>
              Gross margin {formatPercent((profitAndLoss.grossProfitYtd / profitAndLoss.revenueYtd) * 100, 1)} year
              to date
            </span>
            <span className="font-medium text-ink">
              Net margin{" "}
              {formatPercent((profitAndLoss.netProfitYtd / profitAndLoss.revenueYtd) * 100, 1)}
            </span>
          </PanelFooter>
        </Panel>
      ) : null}

      {tab === "balance" ? (
        <Panel>
          <PanelHeader title="Balance sheet" subtitle="Position as at the reporting date" />
          <StatementTable lines={balanceSheet.lines} periodLabel="As at date" showYtd={false} />
          <PanelFooter>
            <span className="flex items-center gap-1.5">
              {balanceSheet.balanced ? (
                <>
                  <CheckCircle2 className="size-3.5 text-good" aria-hidden />
                  Assets equal liabilities plus equity
                </>
              ) : (
                <>
                  <CircleAlert className="size-3.5 text-critical" aria-hidden />
                  Balance sheet does not balance - check the ledger
                </>
              )}
            </span>
            <span className="font-medium text-ink">{formatMoneyWhole(balanceSheet.totalAssets)}</span>
          </PanelFooter>
        </Panel>
      ) : null}

      {tab === "cashflow" ? (
        <Panel>
          <PanelHeader
            title="Cash flow statement"
            subtitle={`Indirect method for ${periodLabel.toLowerCase()}`}
          />
          <StatementTable lines={cashFlow.lines} periodLabel={periodLabel} showYtd={false} />
          <PanelFooter>
            <span className="flex items-center gap-1.5">
              {cashFlow.ties ? (
                <>
                  <CheckCircle2 className="size-3.5 text-good" aria-hidden />
                  Opening cash plus movement equals the closing ledger balance
                </>
              ) : (
                <>
                  <CircleAlert className="size-3.5 text-critical" aria-hidden />
                  Movement does not reconcile to the cash ledger
                </>
              )}
            </span>
            <span className="font-medium text-ink">{formatMoneyWhole(cashFlow.closingCash)}</span>
          </PanelFooter>
        </Panel>
      ) : null}

      {tab === "trial" ? (
        <Panel>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search account name or code"
            filters={[
              {
                id: "type",
                label: "Account type",
                value: type,
                onChange: setType,
                options: [
                  { value: "all", label: "All types" },
                  { value: "asset", label: "Assets" },
                  { value: "liability", label: "Liabilities" },
                  { value: "equity", label: "Equity" },
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expenses" },
                ],
              },
            ]}
          >
            <ResultCount shown={rows.length} total={trialBalance.length} noun="accounts" />
          </Toolbar>

          <DataTable
            columns={trialColumns}
            rows={rows}
            minWidth="min-w-[1020px]"
            footer={
              <>
                <td className="px-4 py-2">Totals</td>
                <td className="hidden px-3 py-2 text-right tnum xl:table-cell">
                  {formatMoneyWhole(totals.openingDebit)}
                </td>
                <td className="hidden px-3 py-2 text-right tnum xl:table-cell">
                  {formatMoneyWhole(totals.openingCredit)}
                </td>
                <td className="hidden px-3 py-2 text-right tnum md:table-cell">
                  {formatMoneyWhole(totals.periodDebit)}
                </td>
                <td className="hidden px-3 py-2 text-right tnum md:table-cell">
                  {formatMoneyWhole(totals.periodCredit)}
                </td>
                <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.closingDebit)}</td>
                <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(totals.closingCredit)}</td>
              </>
            }
          />

          <PanelFooter>
            <span className="flex items-center gap-1.5">
              {balanced ? (
                <>
                  <CheckCircle2 className="size-3.5 text-good" aria-hidden />
                  Closing debits equal closing credits
                </>
              ) : (
                <>
                  <CircleAlert className="size-3.5 text-critical" aria-hidden />
                  Filtered view - totals balance across the full account list
                </>
              )}
            </span>
          </PanelFooter>
        </Panel>
      ) : null}

      {tab === "ageing" ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Panel>
              <PanelBody>
                <p className="t-eyebrow">Days sales outstanding</p>
                <p className="t-figure mt-2 tnum">{ageing.dso.toFixed(0)} days</p>
                <p className="t-caption mt-1.5">Average collection period on posted sales</p>
              </PanelBody>
            </Panel>
            <Panel>
              <PanelBody>
                <p className="t-eyebrow">Days payable outstanding</p>
                <p className="t-figure mt-2 tnum">{ageing.dpo.toFixed(0)} days</p>
                <p className="t-caption mt-1.5">Average settlement period on supplier bills</p>
              </PanelBody>
            </Panel>
            <Panel>
              <PanelBody>
                <p className="t-eyebrow">Receivables overdue</p>
                <p className="t-figure mt-2 tnum text-delta-down">
                  {ageing.overdueSharePct.toFixed(1)}%
                </p>
                <p className="t-caption mt-1.5">Share of the book past its due date</p>
              </PanelBody>
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              title="Ageing by party"
              subtitle="Outstanding balance split across ageing buckets"
              action={
                <Tabs
                  tabs={[
                    { id: "receivables", label: "Receivable" },
                    { id: "payables", label: "Payable" },
                  ]}
                  active={ageingSide}
                  onChange={(id) => setAgeingSide(id as "receivables" | "payables")}
                />
              }
            />
            <DataTable
              columns={ageingColumns}
              rows={ageingRows}
              minWidth="min-w-[860px]"
              footer={
                <>
                  <td className="px-4 py-2">Total</td>
                  {bucketTotals.map((total, index) => (
                    <td key={index} className="px-3 py-2 text-right tnum">
                      {formatMoneyWhole(total)}
                    </td>
                  ))}
                  <td className="hidden px-3 py-2 lg:table-cell" />
                  <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(ageingTotal)}</td>
                </>
              }
            />
          </Panel>
        </div>
      ) : null}

      {tab === "catalogue" ? (
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <Panel key={category}>
              <PanelHeader
                title={category}
                subtitle={`${reports.filter((report) => report.category === category).length} reports`}
              />
              <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {reports
                  .filter((report) => report.category === category)
                  .map((report) => {
                    const body = (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                            <FileSpreadsheet className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                            {report.name}
                          </p>
                          {report.phase !== "mvp" ? <PhaseBadge phase={report.phase} compact /> : null}
                        </div>
                        <p className="mt-1 text-[11px] text-ink-secondary">{report.description}</p>
                        <p className="mt-2 flex items-center justify-between gap-2 text-[10.5px] text-ink-muted">
                          <span>
                            {report.lastRunOn ? `Last run ${formatDate(report.lastRunOn)}` : "Not run yet"}
                          </span>
                          {report.href ? (
                            <span className="inline-flex items-center gap-0.5 text-accent">
                              Open
                              <ArrowUpRight className="size-3" aria-hidden />
                            </span>
                          ) : (
                            <Badge tone="neutral">Scheduled</Badge>
                          )}
                        </p>
                      </>
                    );

                    const shell =
                      "rounded-lg border border-hairline bg-plane p-3 transition-colors hover:border-hairline-strong";

                    return report.href ? (
                      <Link key={report.id} href={report.href} className={shell}>
                        {body}
                      </Link>
                    ) : (
                      <div key={report.id} className={shell}>
                        {body}
                      </div>
                    );
                  })}
              </PanelBody>
            </Panel>
          ))}
        </div>
      ) : null}
    </div>
  );
}
