"use client";

import { useState } from "react";
import { Paperclip, Repeat } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { ExpenseVoucher } from "@/lib/types";

export function ExpensesView({ expenses }: { expenses: ExpenseVoucher[] }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");

  const departments = Array.from(new Set(expenses.map((expense) => expense.department))).sort();

  // The React Compiler memoizes this derivation; no manual useMemo needed.
  const needle = search.trim().toLowerCase();
  const rows = expenses.filter((expense) => {
    if (department !== "all" && expense.department !== department) return false;
    if (status !== "all" && expense.status !== status) return false;
    if (!needle) return true;
    return (
      expense.number.toLowerCase().includes(needle) ||
      expense.category.toLowerCase().includes(needle) ||
      expense.requestedBy.toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<ExpenseVoucher>> = [
    {
      key: "number",
      header: "Voucher",
      cell: (expense) => (
        <span>
          <span className="block font-medium text-ink">{expense.number}</span>
          <span className="block text-[10.5px] text-ink-muted">{formatDate(expense.date)}</span>
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (expense) => (
        <span className="flex items-center gap-1.5 text-ink">
          {expense.category}
          {expense.recurring ? (
            <Repeat className="size-3 shrink-0 text-ink-muted" aria-label="Recurring expense" />
          ) : null}
        </span>
      ),
    },
    { key: "department", header: "Department", hideBelow: "md", cell: (expense) => expense.department },
    { key: "paidFrom", header: "Paid from", hideBelow: "lg", cell: (expense) => expense.paidFrom },
    {
      key: "amount",
      header: "Net",
      align: "right",
      hideBelow: "sm",
      cell: (expense) => formatMoneyWhole(expense.amount),
    },
    {
      key: "vat",
      header: "VAT",
      align: "right",
      hideBelow: "lg",
      cell: (expense) => formatMoneyWhole(expense.vat),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (expense) => <span className="font-medium">{formatMoneyWhole(expense.total)}</span>,
    },
    {
      key: "attachments",
      header: "Docs",
      align: "right",
      hideBelow: "md",
      cell: (expense) =>
        expense.attachments > 0 ? (
          <span className="inline-flex items-center gap-1 text-ink">
            <Paperclip className="size-3 shrink-0" aria-hidden />
            {expense.attachments}
          </span>
        ) : (
          <span className="text-delta-down">None</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (expense) => <StatusPill status={expense.status} />,
    },
  ];

  const total = rows.reduce((sum, expense) => sum + toNumber(expense.total), 0);

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search voucher, category or requester"
        filters={[
          {
            id: "department",
            label: "Department",
            value: department,
            onChange: setDepartment,
            options: [
              { value: "all", label: "All departments" },
              ...departments.map((value) => ({ value, label: value })),
            ],
          },
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All statuses" },
              { value: "draft", label: "Draft" },
              { value: "pending_approval", label: "Pending approval" },
              { value: "posted", label: "Posted" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={expenses.length} noun="vouchers" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[980px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={6}>
              Listed vouchers
            </td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(total)}</td>
            <td className="px-3 py-2" colSpan={2} />
          </>
        }
      />
    </Panel>
  );
}
