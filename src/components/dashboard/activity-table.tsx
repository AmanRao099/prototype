import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDateTime, formatMoneyWhole } from "@/lib/format";
import type { LedgerActivity } from "@/lib/types";

/**
 * Posted documents with their journal totals. Debit equals credit on every
 * posted row - the balance check is visible, not implied.
 */
export function ActivityTable({ rows }: { rows: LedgerActivity[] }) {
  const columns: Array<Column<LedgerActivity>> = [
    {
      key: "reference",
      header: "Reference",
      cell: (row) => <CellStack primary={row.reference} secondary={formatDateTime(row.postedAt)} />,
    },
    { key: "document", header: "Document", hideBelow: "md", cell: (row) => row.documentType },
    { key: "party", header: "Party / narration", cell: (row) => row.party },
    {
      key: "debit",
      header: "Debit",
      align: "right",
      cell: (row) => formatMoneyWhole(row.debit),
    },
    {
      key: "credit",
      header: "Credit",
      align: "right",
      cell: (row) => formatMoneyWhole(row.credit),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (row) => <StatusPill status={row.status} />,
    },
  ];

  return <DataTable columns={columns} rows={rows} minWidth="min-w-[660px]" />;
}
