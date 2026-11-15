import { formatMoneyWhole, toNumber } from "@/lib/format";
import type { PartyOutstanding } from "@/lib/types";
import { StatusChip } from "@/components/ui/badge";

function creditState(party: PartyOutstanding) {
  const limit = party.creditLimit ? toNumber(party.creditLimit) : 0;
  const used = limit > 0 ? (toNumber(party.outstanding) / limit) * 100 : 0;
  const level = used >= 95 ? "critical" : used >= 80 ? "serious" : used >= 60 ? "warning" : "good";
  return { used, level } as const;
}

/** Top customer exposure: outstanding, overdue and credit-limit utilisation. */
export function ReceivablesPanel({ parties }: { parties: PartyOutstanding[] }) {
  return (
    <ul className="divide-y divide-hairline">
      {parties.map((party) => {
        const { used, level } = creditState(party);
        return (
          <li key={party.id} className="px-4 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-ink">{party.name}</p>
                <p className="mt-0.5 text-[11px] text-ink-secondary">
                  Overdue{" "}
                  <span className="tnum font-medium text-ink">{formatMoneyWhole(party.overdue)}</span>
                  {" - oldest "}
                  {party.oldestDays} days
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-medium tnum text-ink">
                  {formatMoneyWhole(party.outstanding)}
                </p>
                <p className="mt-0.5 text-[10.5px] text-ink-muted tnum">
                  {party.creditLimit ? `${used.toFixed(0)}% of limit` : "No limit set"}
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div
                className="h-1.5 flex-1 rounded-full bg-surface-2"
                role="img"
                aria-label={`${used.toFixed(0)} percent of credit limit used`}
              >
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(used, 100)}%`,
                    background:
                      level === "critical"
                        ? "var(--critical)"
                        : level === "serious"
                          ? "var(--serious)"
                          : "var(--series-1)",
                  }}
                />
              </div>
              {level !== "good" ? (
                <StatusChip
                  level={level}
                  label={level === "critical" ? "Limit breach risk" : "Credit watch"}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
