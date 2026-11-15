"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, FileSpreadsheet } from "lucide-react";
import { Badge, PhaseBadge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { ReportDefinition, TrialBalanceRow } from "@/lib/types";

type TrialRow = TrialBalanceRow & { id: string };

export function ReportingView({
  trialBalance,
  reports,
}: {
  trialBalance: TrialBalanceRow[];
  reports: ReportDefinition[];
}) {
  const [tab, setTab] = useState("trial");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const rows: TrialRow[] = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return trialBalance
      .filter((row) => {
        if (type !== "all" && row.type !== type) return false;
        if (!needle) return true;
        return (
          row.accountName.toLowerCase().includes(needle) || row.accountCode.includes(needle)
        );
      })
      .map((row) => ({ ...row, id: row.accountCode }));
  }, [search, trialBalance, type]);

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

  const columns: Array<Column<TrialRow>> = [
    {
      key: "account",
      header: "Account",
      cell: (row) => (
        <span>
          <span className="block text-ink">{row.accountName}</span>
          <span className="block text-[10.5px] tnum text-ink-muted">{row.accountCode}</span>
        </span>
      ),
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

  const categories = Array.from(new Set(reports.map((report) => report.category)));

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "trial", label: "Trial balance", count: trialBalance.length },
          { id: "catalogue", label: "Report catalogue", count: reports.length },
        ]}
        active={tab}
        onChange={setTab}
      />

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
            columns={columns}
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
                <td className="px-4 py-2 text-right tnum">
                  {formatMoneyWhole(totals.closingCredit)}
                </td>
              </>
            }
          />

          <div className="flex items-center gap-2 border-t border-hairline px-4 py-2.5 text-[11.5px]">
            {balanced ? (
              <>
                <CheckCircle2 className="size-3.5 shrink-0 text-good" aria-hidden />
                <span className="text-ink-secondary">
                  Closing debits equal closing credits for the listed accounts.
                </span>
              </>
            ) : (
              <>
                <CircleAlert className="size-3.5 shrink-0 text-critical" aria-hidden />
                <span className="text-ink-secondary">
                  Filtered view - totals balance only across the full account list.
                </span>
              </>
            )}
          </div>
        </Panel>
      ) : (
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
                          <PhaseBadge phase={report.phase} />
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
      )}
    </div>
  );
}
