import type { MovementStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS: Record<MovementStatus, { label: string; dot: string; emphatic?: boolean }> = {
  draft: { label: "Draft", dot: "bg-axis" },
  pending_approval: { label: "Pending approval", dot: "bg-warning" },
  posted: { label: "Posted", dot: "bg-good" },
  in_transit: { label: "In transit", dot: "bg-accent" },
  received: { label: "Received", dot: "bg-good" },
  cancelled: { label: "Cancelled", dot: "bg-axis" },
};

/** Movement state as dot plus word, matching the accounting status pill. */
export function MovementStatusPill({ status }: { status: MovementStatus }) {
  const meta = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-medium">
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
      <span className={meta.emphatic ? "text-delta-down" : "text-ink-secondary"}>{meta.label}</span>
    </span>
  );
}
