"use client";

import { useMemo, useState } from "react";
import { Folder, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatMoneyWhole } from "@/lib/format";
import type { Account, AccountType } from "@/lib/types";

const TYPE_LABEL: Record<AccountType, string> = {
  asset: "Asset",
  liability: "Liability",
  equity: "Equity",
  income: "Income",
  expense: "Expense",
};

export function AccountsView({ accounts }: { accounts: Account[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [scope, setScope] = useState("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (type !== "all" && account.type !== type) return false;
      if (scope === "groups" && !account.isGroup) return false;
      if (scope === "postable" && account.isGroup) return false;
      if (scope === "bank" && !account.isBankOrCash) return false;
      if (!needle) return true;
      return (
        account.code.includes(needle) ||
        account.name.toLowerCase().includes(needle) ||
        account.group.toLowerCase().includes(needle)
      );
    });
  }, [accounts, scope, search, type]);

  const columns: Array<Column<Account>> = [
    {
      key: "code",
      header: "Code",
      width: "w-[92px]",
      cell: (account) => <span className="tnum text-ink-secondary">{account.code}</span>,
    },
    {
      key: "name",
      header: "Account",
      cell: (account) => (
        <span
          className="flex items-center gap-1.5"
          style={{ paddingLeft: `${account.level * 14}px` }}
        >
          {account.isGroup ? (
            account.level === 0 ? (
              <FolderOpen className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
            ) : (
              <Folder className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
            )
          ) : (
            <span aria-hidden className="ml-1 size-1.5 shrink-0 rounded-full bg-axis" />
          )}
          <span className={account.isGroup ? "font-medium text-ink" : "text-ink"}>
            {account.name}
          </span>
          {account.isBankOrCash ? <Badge tone="accent">Cash / bank</Badge> : null}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      hideBelow: "md",
      cell: (account) => TYPE_LABEL[account.type],
    },
    {
      key: "group",
      header: "Parent group",
      hideBelow: "lg",
      cell: (account) => account.group,
    },
    {
      key: "opening",
      header: "Opening",
      align: "right",
      hideBelow: "sm",
      cell: (account) => formatMoneyWhole(account.openingBalance),
    },
    {
      key: "balance",
      header: "Closing balance",
      align: "right",
      cell: (account) => (
        <span className="font-medium">
          {formatMoneyWhole(account.balance)}
          <span className="ml-1 text-[10px] font-normal text-ink-muted">
            {account.side === "debit" ? "Dr" : "Cr"}
          </span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      hideBelow: "md",
      cell: (account) =>
        account.isActive ? (
          <Badge tone="good">Active</Badge>
        ) : (
          <Badge tone="neutral">Inactive</Badge>
        ),
    },
  ];

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by code, account or group"
        filters={[
          {
            id: "type",
            label: "Account type",
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: "All types" },
              ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
          {
            id: "scope",
            label: "Account scope",
            value: scope,
            onChange: setScope,
            options: [
              { value: "all", label: "All accounts" },
              { value: "groups", label: "Groups only" },
              { value: "postable", label: "Postable only" },
              { value: "bank", label: "Cash & bank" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={accounts.length} noun="accounts" />
      </Toolbar>

      <DataTable columns={columns} rows={rows} minWidth="min-w-[820px]" />
    </Panel>
  );
}
