"use client";

import { useMemo, useState } from "react";
import { Banknote, CircleDollarSign, Landmark, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { CashBankAccount, CashBankEntry, PaymentDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

const KIND_ICON = {
  bank: Landmark,
  cash: Banknote,
  petty_cash: CircleDollarSign,
} as const;

const KIND_LABEL = {
  bank: "Bank account",
  cash: "Cash account",
  petty_cash: "Petty cash",
} as const;

const MODE_LABEL: Record<PaymentDocument["mode"], string> = {
  cash: "Cash",
  bank_transfer: "Bank transfer",
  cheque: "Cheque",
  card: "Card",
};

export function CashBankView({
  accounts,
  entries,
  receipts,
  payments,
}: {
  accounts: CashBankAccount[];
  entries: CashBankEntry[];
  receipts: PaymentDocument[];
  payments: PaymentDocument[];
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [tab, setTab] = useState("book");
  const [search, setSearch] = useState("");
  const [reconciled, setReconciled] = useState("all");

  const account = accounts.find((item) => item.id === accountId) ?? accounts[0];

  const bookRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (reconciled === "yes" && !entry.reconciled) return false;
      if (reconciled === "no" && entry.reconciled) return false;
      if (!needle) return true;
      return (
        entry.particulars.toLowerCase().includes(needle) ||
        entry.reference.toLowerCase().includes(needle)
      );
    });
  }, [entries, reconciled, search]);

  const vouchers = tab === "receipts" ? receipts : payments;
  const voucherRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return vouchers;
    return vouchers.filter(
      (voucher) =>
        voucher.number.toLowerCase().includes(needle) ||
        voucher.party.toLowerCase().includes(needle) ||
        (voucher.instrumentRef ?? "").toLowerCase().includes(needle),
    );
  }, [search, vouchers]);

  const bookColumns: Array<Column<CashBankEntry>> = [
    { key: "date", header: "Date", width: "w-[104px]", cell: (entry) => formatDate(entry.date) },
    {
      key: "reference",
      header: "Reference",
      cell: (entry) => <span className="font-medium text-ink">{entry.reference}</span>,
    },
    {
      key: "particulars",
      header: "Particulars",
      cell: (entry) => (
        <span className="block max-w-[340px] truncate" title={entry.particulars}>
          {entry.particulars}
        </span>
      ),
    },
    {
      key: "in",
      header: "Receipt",
      align: "right",
      cell: (entry) =>
        toNumber(entry.inflow) ? formatMoneyWhole(entry.inflow) : <span className="text-ink-muted">-</span>,
    },
    {
      key: "out",
      header: "Payment",
      align: "right",
      cell: (entry) =>
        toNumber(entry.outflow) ? formatMoneyWhole(entry.outflow) : <span className="text-ink-muted">-</span>,
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      cell: (entry) => <span className="font-medium">{formatMoneyWhole(entry.runningBalance)}</span>,
    },
    {
      key: "reconciled",
      header: "Reconciled",
      align: "right",
      hideBelow: "md",
      cell: (entry) =>
        entry.reconciled ? <Badge tone="good">Matched</Badge> : <Badge tone="neutral">Open</Badge>,
    },
  ];

  const voucherColumns: Array<Column<PaymentDocument>> = [
    {
      key: "number",
      header: "Voucher",
      cell: (voucher) => (
        <span>
          <span className="block font-medium text-ink">{voucher.number}</span>
          <span className="block text-[10.5px] text-ink-muted">{formatDate(voucher.date)}</span>
        </span>
      ),
    },
    { key: "party", header: "Party", cell: (voucher) => voucher.party },
    {
      key: "mode",
      header: "Mode",
      hideBelow: "md",
      cell: (voucher) => (
        <span>
          {MODE_LABEL[voucher.mode]}
          {voucher.instrumentRef ? (
            <span className="block text-[10.5px] text-ink-muted">{voucher.instrumentRef}</span>
          ) : null}
        </span>
      ),
    },
    { key: "account", header: "Account", hideBelow: "lg", cell: (voucher) => voucher.account },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (voucher) => <span className="font-medium">{formatMoneyWhole(voucher.amount)}</span>,
    },
    {
      key: "unallocated",
      header: "On account",
      align: "right",
      hideBelow: "sm",
      cell: (voucher) =>
        toNumber(voucher.unallocated) ? (
          <span className="text-delta-down">{formatMoneyWhole(voucher.unallocated)}</span>
        ) : (
          <span className="text-ink-muted">Fully allocated</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (voucher) => <StatusPill status={voucher.status} />,
    },
  ];

  const unreconciledValue = entries
    .filter((entry) => !entry.reconciled)
    .reduce((sum, entry) => sum + toNumber(entry.inflow) - toNumber(entry.outflow), 0);

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
      <Panel className="xl:col-span-1">
        <PanelHeader title="Accounts" subtitle="Cash, petty cash and bank" />
        <ul className="divide-y divide-hairline">
          {accounts.map((item) => {
            const Icon = KIND_ICON[item.kind];
            const active = item.id === account?.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setAccountId(item.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors",
                    active ? "bg-accent-wash" : "hover:bg-surface-2/60",
                  )}
                >
                  <Icon
                    className={cn("mt-0.5 size-4 shrink-0", active ? "text-accent" : "text-ink-muted")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[12.5px] font-medium",
                        active ? "text-accent" : "text-ink",
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="block text-[10.5px] text-ink-muted">
                      {KIND_LABEL[item.kind]}
                      {item.accountNumberMasked ? ` - ${item.accountNumberMasked}` : ""}
                    </span>
                    <span className="mt-1 block text-[12.5px] font-semibold tnum text-ink">
                      {formatMoneyWhole(item.balance)}
                    </span>
                    {item.unreconciledCount > 0 ? (
                      <span className="mt-1 inline-block text-[10.5px] text-delta-down">
                        {item.unreconciledCount} unreconciled entries
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <PanelFooter>
          <span>Total cash and bank</span>
          <span className="font-medium tnum text-ink">
            {formatMoneyWhole(accounts.reduce((sum, item) => sum + toNumber(item.balance), 0))}
          </span>
        </PanelFooter>
      </Panel>

      <div className="flex flex-col gap-3 xl:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs
            tabs={[
              { id: "book", label: account?.kind === "bank" ? "Bank book" : "Cash book", count: entries.length },
              { id: "receipts", label: "Receipts", count: receipts.length },
              { id: "payments", label: "Payments", count: payments.length },
            ]}
            active={tab}
            onChange={setTab}
          />
          {account?.lastReconciledOn ? (
            <p className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <Lock className="size-3" aria-hidden />
              Reconciled up to {formatDate(account.lastReconciledOn)}
            </p>
          ) : null}
        </div>

        <Panel>
          {tab === "book" ? (
            <>
              <Toolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search particulars or reference"
                filters={[
                  {
                    id: "reconciled",
                    label: "Reconciliation",
                    value: reconciled,
                    onChange: setReconciled,
                    options: [
                      { value: "all", label: "All entries" },
                      { value: "no", label: "Unreconciled" },
                      { value: "yes", label: "Reconciled" },
                    ],
                  },
                ]}
              >
                <ResultCount shown={bookRows.length} total={entries.length} noun="entries" />
              </Toolbar>
              <DataTable columns={bookColumns} rows={bookRows} minWidth="min-w-[900px]" />
              <PanelFooter>
                <span>
                  Unreconciled movement on {account?.name}: closing balance{" "}
                  {formatMoneyWhole(account?.balance ?? 0)}
                </span>
                <span
                  className={cn(
                    "font-medium tnum",
                    unreconciledValue < 0 ? "text-delta-down" : "text-ink",
                  )}
                >
                  {formatMoneyWhole(unreconciledValue)}
                </span>
              </PanelFooter>
            </>
          ) : (
            <>
              <Toolbar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search voucher, party or instrument"
              >
                <ResultCount shown={voucherRows.length} total={vouchers.length} noun="vouchers" />
              </Toolbar>
              <DataTable columns={voucherColumns} rows={voucherRows} minWidth="min-w-[920px]" />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
