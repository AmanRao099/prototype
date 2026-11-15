import type { AgeingRow } from "@/components/accounting/party-ledger-view";

/** Figures are quoted as at this date while the UI runs on sample data. */
export const AS_OF = new Date("2026-11-15T09:40:00+05:30");

export function daysOverdue(dueDate: string, asOf: Date = AS_OF): number {
  const diff = asOf.getTime() - new Date(dueDate).getTime();
  return Math.max(Math.floor(diff / 86_400_000), 0);
}

/** Standard 30/60/90 ageing split used by both receivable and payable screens. */
export function bucketise(
  documents: Array<{ dueDate: string; balance: number }>,
  asOf: Date = AS_OF,
): AgeingRow[] {
  const buckets: AgeingRow[] = [
    { label: "Not yet due", amount: 0 },
    { label: "1-30 days", amount: 0 },
    { label: "31-60 days", amount: 0 },
    { label: "61-90 days", amount: 0 },
    { label: "90+ days", amount: 0 },
  ];

  for (const document of documents) {
    if (document.balance <= 0) continue;
    const overdue = daysOverdue(document.dueDate, asOf);
    const index =
      overdue === 0 ? 0 : overdue <= 30 ? 1 : overdue <= 60 ? 2 : overdue <= 90 ? 3 : 4;
    buckets[index].amount += document.balance;
  }

  return buckets.filter((bucket) => bucket.amount > 0);
}
