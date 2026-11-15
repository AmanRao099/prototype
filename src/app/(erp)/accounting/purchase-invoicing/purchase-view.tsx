"use client";

import { useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { PurchaseInvoice } from "@/lib/types";

const TYPE_LABEL: Record<PurchaseInvoice["invoiceType"], string> = {
  tax: "Tax invoice",
  cash: "Cash purchase",
  debit_note: "Debit note",
};

export function PurchaseView({ invoices }: { invoices: PurchaseInvoice[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [matching, setMatching] = useState("all");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (status !== "all" && invoice.status !== status) return false;
      if (matching === "matched" && !invoice.grnReference) return false;
      if (matching === "unmatched" && invoice.grnReference) return false;
      if (!needle) return true;
      return (
        invoice.number.toLowerCase().includes(needle) ||
        invoice.supplier.toLowerCase().includes(needle) ||
        invoice.supplierRef.toLowerCase().includes(needle)
      );
    });
  }, [invoices, matching, search, status]);

  const columns: Array<Column<PurchaseInvoice>> = [
    {
      key: "number",
      header: "Document",
      cell: (invoice) => <CellStack primary={invoice.number} secondary={formatDate(invoice.date)} />,
    },
    {
      key: "supplier",
      header: "Supplier",
      cell: (invoice) => <CellStack primary={invoice.supplier} secondary={`Ref ${invoice.supplierRef}`} />,
    },
    {
      key: "type",
      header: "Type",
      hideBelow: "lg",
      cell: (invoice) => (
        <span className={invoice.invoiceType === "debit_note" ? "text-ink" : undefined}>
          {TYPE_LABEL[invoice.invoiceType]}
        </span>
      ),
    },
    {
      key: "grn",
      header: "Goods receipt",
      hideBelow: "lg",
      cell: (invoice) =>
        invoice.grnReference ? (
          <span className="inline-flex items-center gap-1 text-ink">
            <PackageCheck className="size-3.5 shrink-0 text-good" aria-hidden />
            {invoice.grnReference}
          </span>
        ) : (
          <span className="text-ink-muted">Not matched</span>
        ),
    },
    { key: "due", header: "Due", hideBelow: "md", cell: (invoice) => formatDate(invoice.dueDate) },
    {
      key: "subtotal",
      header: "Net",
      align: "right",
      hideBelow: "xl",
      cell: (invoice) => formatMoneyWhole(invoice.subtotal),
    },
    {
      key: "charges",
      header: "Charges",
      align: "right",
      hideBelow: "xl",
      cell: (invoice) =>
        toNumber(invoice.additionalCharges) ? (
          formatMoneyWhole(invoice.additionalCharges)
        ) : (
          <span className="text-ink-muted">-</span>
        ),
    },
    {
      key: "vat",
      header: "Input VAT",
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
        searchPlaceholder="Search document, supplier or supplier reference"
        filters={[
          {
            id: "matching",
            label: "Goods receipt matching",
            value: matching,
            onChange: setMatching,
            options: [
              { value: "all", label: "All documents" },
              { value: "matched", label: "Matched to GRN" },
              { value: "unmatched", label: "Without GRN" },
            ],
          },
          {
            id: "status",
            label: "Status",
            value: status,
            onChange: setStatus,
            options: [
              { value: "all", label: "All statuses" },
              { value: "pending_approval", label: "Pending approval" },
              { value: "posted", label: "Posted" },
              { value: "partially_paid", label: "Part paid" },
              { value: "overdue", label: "Overdue" },
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={invoices.length} noun="documents" />
      </Toolbar>

      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1140px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={8}>
              Listed documents
            </td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.total)}</td>
            <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totals.balance)}</td>
            <td className="px-4 py-2" />
          </>
        }
      />
    </Panel>
  );
}
