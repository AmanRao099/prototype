import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/types";

const STATUS: Record<
  DocumentStatus,
  { label: string; tone: "neutral" | "good" | "warning" | "serious" | "critical" | "accent" }
> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_approval: { label: "Pending approval", tone: "warning" },
  posted: { label: "Posted", tone: "good" },
  partially_paid: { label: "Part paid", tone: "accent" },
  paid: { label: "Paid", tone: "good" },
  overdue: { label: "Overdue", tone: "critical" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  reversed: { label: "Reversed", tone: "critical" },
};

/** Document state, always as text plus tone - never a bare coloured dot. */
export function StatusPill({ status }: { status: DocumentStatus }) {
  const meta = STATUS[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
