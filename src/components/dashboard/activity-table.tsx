import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMoneyWhole } from "@/lib/format";
import type { LedgerActivity } from "@/lib/types";

const STATUS_META: Record<
  LedgerActivity["status"],
  { label: string; tone: "neutral" | "good" | "warning" | "critical" }
> = {
  posted: { label: "Posted", tone: "good" },
  draft: { label: "Draft", tone: "neutral" },
  pending_approval: { label: "Pending approval", tone: "warning" },
  reversed: { label: "Reversed", tone: "critical" },
};

/**
 * Posted documents with their journal totals. Debit equals credit on every
 * posted row - the balance check is visible, not implied.
 */
export function ActivityTable({ rows }: { rows: LedgerActivity[] }) {
  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-hairline text-left text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
            <th scope="col" className="px-4 py-2 font-medium">
              Reference
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Document
            </th>
            <th scope="col" className="px-2 py-2 font-medium">
              Party / narration
            </th>
            <th scope="col" className="px-2 py-2 text-right font-medium">
              Debit
            </th>
            <th scope="col" className="px-2 py-2 text-right font-medium">
              Credit
            </th>
            <th scope="col" className="px-4 py-2 text-right font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-hairline/60 last:border-0 hover:bg-surface-2/50">
              <td className="px-4 py-2">
                <p className="font-medium text-ink">{row.reference}</p>
                <p className="text-[10.5px] text-ink-muted">{formatDateTime(row.postedAt)}</p>
              </td>
              <td className="px-2 py-2 text-ink-secondary">{row.documentType}</td>
              <td className="px-2 py-2 text-ink-secondary">{row.party}</td>
              <td className="px-2 py-2 text-right tnum text-ink">{formatMoneyWhole(row.debit)}</td>
              <td className="px-2 py-2 text-right tnum text-ink">{formatMoneyWhole(row.credit)}</td>
              <td className="px-4 py-2 text-right">
                <Badge tone={STATUS_META[row.status].tone}>{STATUS_META[row.status].label}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
