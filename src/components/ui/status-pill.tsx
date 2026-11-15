import type { DocumentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS: Record<DocumentStatus, { label: string; dot: string; emphatic?: boolean }> = {
  draft: { label: "Draft", dot: "bg-axis" },
  pending_approval: { label: "Pending approval", dot: "bg-warning" },
  posted: { label: "Posted", dot: "bg-good" },
  partially_paid: { label: "Part paid", dot: "bg-accent" },
  paid: { label: "Paid", dot: "bg-good" },
  overdue: { label: "Overdue", dot: "bg-critical", emphatic: true },
  cancelled: { label: "Cancelled", dot: "bg-axis" },
  reversed: { label: "Reversed", dot: "bg-critical", emphatic: true },
};

/**
 * Document state as a dot plus the word. Only states that need a reader to act
 * (overdue, reversed) take coloured text; everything else stays in ink so a
 * long register reads calmly.
 */
export function StatusPill({ status }: { status: DocumentStatus }) {
  const meta = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium">
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
      <span className={meta.emphatic ? "text-delta-down" : "text-ink-secondary"}>{meta.label}</span>
    </span>
  );
}
