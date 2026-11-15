import { Check, X } from "lucide-react";
import { StatusChip } from "@/components/ui/badge";
import { formatMoneyWhole, formatRelative } from "@/lib/format";
import type { ApprovalRequest } from "@/lib/types";

/**
 * Phase 1 shows the queue and the two terminal actions. The multi-level matrix
 * and delegation land in Phase 2 (proposal §2, §12).
 */
export function ApprovalsPanel({ approvals }: { approvals: ApprovalRequest[] }) {
  return (
    <ul className="divide-y divide-hairline">
      {approvals.map((approval) => (
        <li key={approval.id} className="px-4 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-ink">
                {approval.documentType}{" "}
                <span className="font-normal text-ink-secondary">{approval.reference}</span>
              </p>
              <p className="mt-0.5 truncate text-[11px] text-ink-secondary">{approval.party}</p>
            </div>
            <div className="shrink-0 text-right">
              {approval.amount !== undefined ? (
                <p className="text-[12.5px] font-medium tnum text-ink">
                  {formatMoneyWhole(approval.amount)}
                </p>
              ) : null}
              <StatusChip level={approval.level} label={approval.step.split(" - ")[0]} />
            </div>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="truncate text-[10.5px] text-ink-muted">
              {approval.requestedBy} - {formatRelative(approval.requestedAt, new Date("2026-11-15T09:40:00+05:30"))}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md border border-hairline px-1.5 py-0.5 text-[10.5px] font-medium text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-3" aria-hidden />
                Reject
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10.5px] font-medium text-white transition-opacity hover:opacity-90"
              >
                <Check className="size-3" aria-hidden />
                Approve
              </button>
            </div>
          </div>
        </li>
      ))}
      {approvals.length === 0 ? (
        <li className="px-4 py-8 text-center text-[12px] text-ink-muted">Approval queue is clear.</li>
      ) : null}
    </ul>
  );
}
