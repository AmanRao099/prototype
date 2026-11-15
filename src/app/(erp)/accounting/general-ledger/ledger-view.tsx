"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { Account, JournalEntry, LedgerRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LedgerView({
  journals,
  ledger,
  accounts,
}: {
  journals: JournalEntry[];
  ledger: LedgerRow[];
  accounts: Account[];
}) {
  const [tab, setTab] = useState("vouchers");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState(journals[0]?.id ?? "");
  const [accountCode, setAccountCode] = useState("1200");

  const filteredJournals = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return journals.filter((entry) => {
      if (status !== "all" && entry.status !== status) return false;
      if (!needle) return true;
      return (
        entry.voucherNo.toLowerCase().includes(needle) ||
        entry.narration.toLowerCase().includes(needle) ||
        entry.voucherType.toLowerCase().includes(needle) ||
        (entry.sourceDocument ?? "").toLowerCase().includes(needle)
      );
    });
  }, [journals, search, status]);

  const selected = journals.find((entry) => entry.id === selectedId) ?? filteredJournals[0];
  const postableAccounts = accounts.filter((account) => !account.isGroup);

  const journalColumns: Array<Column<JournalEntry>> = [
    {
      key: "voucher",
      header: "Voucher",
      cell: (entry) => (
        <button
          type="button"
          onClick={() => setSelectedId(entry.id)}
          className={cn(
            "text-left font-medium hover:underline",
            selected?.id === entry.id ? "text-accent" : "text-ink",
          )}
        >
          {entry.voucherNo}
          <span className="block text-[10.5px] font-normal text-ink-muted">
            {formatDate(entry.date)}
          </span>
        </button>
      ),
    },
    { key: "type", header: "Type", hideBelow: "md", cell: (entry) => entry.voucherType },
    {
      key: "narration",
      header: "Narration",
      cell: (entry) => (
        <span className="block max-w-[320px] truncate" title={entry.narration}>
          {entry.narration}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      hideBelow: "lg",
      cell: (entry) => entry.sourceDocument ?? "Manual",
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      cell: (entry) => formatMoneyWhole(entry.totalDebit),
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      cell: (entry) => formatMoneyWhole(entry.totalCredit),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (entry) => <StatusPill status={entry.status} />,
    },
  ];

  const ledgerColumns: Array<Column<LedgerRow>> = [
    { key: "date", header: "Date", width: "w-[104px]", cell: (row) => formatDate(row.date) },
    {
      key: "voucher",
      header: "Voucher",
      cell: (row) => (
        <span className="font-medium text-ink">
          {row.voucherNo}
          <span className="block text-[10.5px] font-normal text-ink-muted">{row.voucherType}</span>
        </span>
      ),
    },
    {
      key: "narration",
      header: "Narration",
      cell: (row) => (
        <span className="block max-w-[360px] truncate" title={row.narration}>
          {row.narration}
        </span>
      ),
    },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      cell: (row) => (toNumber(row.debit) ? formatMoneyWhole(row.debit) : "-"),
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      cell: (row) => (toNumber(row.credit) ? formatMoneyWhole(row.credit) : "-"),
    },
    {
      key: "balance",
      header: "Running balance",
      align: "right",
      cell: (row) => <span className="font-medium">{formatMoneyWhole(row.runningBalance)}</span>,
    },
  ];

  const ledgerDebit = ledger.reduce((sum, row) => sum + toNumber(row.debit), 0);
  const ledgerCredit = ledger.reduce((sum, row) => sum + toNumber(row.credit), 0);
  const closing = ledger[ledger.length - 1]?.runningBalance ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "vouchers", label: "Journal vouchers", count: journals.length },
          { id: "statement", label: "Account statement", count: ledger.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "vouchers" ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search voucher, narration or source document"
              filters={[
                {
                  id: "status",
                  label: "Status",
                  value: status,
                  onChange: setStatus,
                  options: [
                    { value: "all", label: "All statuses" },
                    { value: "posted", label: "Posted" },
                    { value: "draft", label: "Draft" },
                    { value: "pending_approval", label: "Pending approval" },
                    { value: "reversed", label: "Reversed" },
                  ],
                },
              ]}
            >
              <ResultCount shown={filteredJournals.length} total={journals.length} noun="vouchers" />
            </Toolbar>
            <DataTable columns={journalColumns} rows={filteredJournals} minWidth="min-w-[860px]" />
          </Panel>

          <Panel>
            <PanelHeader
              title={selected ? selected.voucherNo : "Voucher"}
              subtitle={selected ? `${selected.voucherType} - ${formatDate(selected.date)}` : undefined}
            />
            {selected ? (
              <PanelBody className="flex flex-col gap-3">
                <p className="text-[12px] text-ink-secondary">{selected.narration}</p>

                <div className="overflow-hidden rounded-lg border border-hairline">
                  <table className="w-full border-collapse text-[11.5px]">
                    <thead>
                      <tr className="border-b border-hairline bg-surface-2/50 text-left text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                        <th scope="col" className="px-2.5 py-1.5 font-medium">
                          Account
                        </th>
                        <th scope="col" className="px-2.5 py-1.5 text-right font-medium">
                          Debit
                        </th>
                        <th scope="col" className="px-2.5 py-1.5 text-right font-medium">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.lines.map((line) => (
                        <tr key={line.id} className="border-b border-hairline/60 last:border-0">
                          <td className="px-2.5 py-1.5">
                            <span className="block text-ink">{line.accountName}</span>
                            <span className="block text-[10px] text-ink-muted tnum">
                              {line.accountCode}
                              {line.party ? ` - ${line.party}` : ""}
                            </span>
                          </td>
                          <td className="px-2.5 py-1.5 text-right tnum text-ink">
                            {toNumber(line.debit) ? formatMoneyWhole(line.debit) : "-"}
                          </td>
                          <td className="px-2.5 py-1.5 text-right tnum text-ink">
                            {toNumber(line.credit) ? formatMoneyWhole(line.credit) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-hairline bg-surface-2/40 text-[11.5px] font-medium text-ink">
                        <td className="px-2.5 py-1.5">Total</td>
                        <td className="px-2.5 py-1.5 text-right tnum">
                          {formatMoneyWhole(selected.totalDebit)}
                        </td>
                        <td className="px-2.5 py-1.5 text-right tnum">
                          {formatMoneyWhole(selected.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="flex items-center gap-1.5 text-[11.5px] text-ink-secondary">
                  <CheckCircle2 className="size-3.5 shrink-0 text-good" aria-hidden />
                  Debits equal credits - entry passes the posting check
                </p>

                <dl className="space-y-1.5 border-t border-hairline pt-2.5 text-[11px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Created by</dt>
                    <dd className="text-ink">{selected.createdBy}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Posted by</dt>
                    <dd className="text-ink">{selected.postedBy ?? "Not posted"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Source document</dt>
                    <dd className="text-ink">{selected.sourceDocument ?? "Manual entry"}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-[11.5px] font-medium text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <FileText className="size-3.5" aria-hidden />
                  Open source document
                </button>
              </PanelBody>
            ) : (
              <PanelBody>
                <p className="text-[12px] text-ink-muted">Select a voucher to see its lines.</p>
              </PanelBody>
            )}
          </Panel>
        </div>
      ) : (
        <Panel>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search narration or voucher"
            filters={[
              {
                id: "account",
                label: "Account",
                value: accountCode,
                onChange: setAccountCode,
                options: postableAccounts.map((account) => ({
                  value: account.code,
                  label: `${account.code} - ${account.name}`,
                })),
              },
            ]}
          >
            <ResultCount shown={ledger.length} total={ledger.length} noun="entries" />
          </Toolbar>

          <DataTable
            columns={ledgerColumns}
            rows={ledger.filter((row) => {
              const needle = search.trim().toLowerCase();
              if (!needle) return true;
              return (
                row.narration.toLowerCase().includes(needle) ||
                row.voucherNo.toLowerCase().includes(needle)
              );
            })}
            minWidth="min-w-[820px]"
            footer={
              <>
                <td className="px-4 py-2" colSpan={3}>
                  Period total - closing balance {formatMoneyWhole(closing)} Dr
                </td>
                <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(ledgerDebit)}</td>
                <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(ledgerCredit)}</td>
                <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(closing)}</td>
              </>
            }
          />
        </Panel>
      )}
    </div>
  );
}
