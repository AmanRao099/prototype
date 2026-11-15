"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { SalesInvoice } from "@/lib/types";

const TYPE_LABEL: Record<SalesInvoice["invoiceType"], string> = {
  tax: "Tax invoice",
  cash: "Cash invoice",
  proforma: "Proforma",
  credit_note: "Credit note",
};

export function SalesView({ invoices }: { invoices: SalesInvoice[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      if (type !== "all" && invoice.invoiceType !== type) return false;
      if (!needle) return true;
      return (
        invoice.number.toLowerCase().includes(needle) ||
        invoice.customer.toLowerCase().includes(needle) ||
        invoice.salesperson.toLowerCase().includes(needle)
      );
    });
  }, [invoices, search, status, type]);

  const columns: Array<Column<SalesInvoice>> = [
    {
      key: "number",
      header: "Invoice",
      cell: (invoice) => <CellStack primary={invoice.number} secondary={formatDate(invoice.date)} />,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (invoice) => <CellStack primary={invoice.customer} secondary={invoice.salesperson} />,
    },
    {
      key: "type",
      header: "Type",
      hideBelow: "lg",
      cell: (invoice) => (
        <span className={invoice.invoiceType === "credit_note" ? "text-ink" : undefined}>
          {TYPE_LABEL[invoice.invoiceType]}
        </span>
      ),
    },
    {
      key: "due",
      header: "Due",
      hideBelow: "md",
      cell: (invoice) => formatDate(invoice.dueDate),
    },
    {
      key: "subtotal",
      header: "Net",
      align: "right",
      hideBelow: "xl",
      cell: (invoice) => formatMoneyWhole(invoice.subtotal),
    },
    {
      key: "discount",
      header: "Discount",
      align: "right",
      hideBelow: "xl",
      cell: (invoice) =>
        toNumber(invoice.discount) ? formatMoneyWhole(invoice.discount) : <span className="text-ink-muted">-</span>,
    },
    {
      key: "vat",
      header: "VAT",
      align: "right",
      hideBelow: "lg",
      cell: (invoice) => formatMoneyWhole(invoice.vat),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      cell: (invoice) => <span className="font-medium">{formatMoneyWhole(invoice.total)}</span>,
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      cell: (invoice) =>
        toNumber(invoice.balance) ? (
          formatMoneyWhole(invoice.balance)
        ) : (
          <span className="text-ink-muted">Settled</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (invoice) => <StatusPill status={invoice.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-[52px]",
      cell: () => (
        <button
          type="button"
          aria-label="Print invoice PDF"
          className="rounded-md border border-hairline p-1 text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Printer className="size-3.5" aria-hidden />
        </button>
      ),
    },
  ];

  const totals = rows.reduce(
    (acc, invoice) => ({
      total: acc.total + toNumber(invoice.total),
      balance: acc.balance + toNumber(invoice.balance),
    }),
    { total: 0, balance: 0 },
  );

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice number, customer or salesperson"
        filters={[
          {
            id: "type",
            label: "Document type",
            value: type,
            onChange: setType,
            options: [
              { value: "all", label: "All documents" },
              ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
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
              { value: "partially_paid", label: "Part paid" },
              { value: "paid", label: "Paid" },
              { value: "overdue", label: "Overdue" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={invoices.length} noun="invoices" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1080px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={7}>
              Listed invoices
            </td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.total)}</td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.balance)}</td>
            <td className="px-3 py-2" colSpan={2} />
          </>
        }
      />
    </Panel>
  );
}
