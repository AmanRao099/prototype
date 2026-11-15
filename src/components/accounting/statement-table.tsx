import { formatMoneyWhole } from "@/lib/format";
import type { StatementLine } from "@/lib/statements";
import { cn } from "@/lib/utils";

/**
 * Renders a financial statement: account lines, subtotals and totals, with the
 * period beside the year to date. Negative figures are shown in brackets, the
 * convention finance teams read fastest.
 */
export function StatementTable({
  lines,
  periodLabel,
  ytdLabel = "Year to date",
  showYtd = true,
}: {
  lines: StatementLine[];
  periodLabel: string;
  ytdLabel?: string;
  showYtd?: boolean;
}) {
  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-hairline text-left">
            <th
              scope="col"
              className="px-4 py-2.5 text-[11.5px] font-medium text-ink-muted"
            >
              Account
            </th>
            <th
              scope="col"
              className="px-3 py-2.5 text-right text-[11.5px] font-medium text-ink-muted"
            >
              {periodLabel}
            </th>
            {showYtd ? (
              <th
                scope="col"
                className="px-4 py-2.5 text-right text-[11.5px] font-medium text-ink-muted"
              >
                {ytdLabel}
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const isHeading = line.kind === "line" && !line.code && line.period === 0;
            return (
              <tr
                key={`${line.label}-${index}`}
                className={cn(
                  "border-b border-hairline/50 last:border-0",
                  line.kind === "subtotal" && "bg-surface-2/30",
                  line.kind === "total" && "bg-surface-2/60",
                )}
              >
                <td
                  className={cn(
                    "px-4 py-2",
                    line.depth ? "pl-8" : "",
                    isHeading && "t-eyebrow pt-3.5",
                    line.kind === "subtotal" && "font-medium text-ink",
                    line.kind === "total" && "font-semibold text-ink",
                    !line.kind && "text-ink-secondary",
                  )}
                >
                  {line.label}
                  {line.code ? (
                    <span className="ml-2 text-[10.5px] tnum text-ink-muted">{line.code}</span>
                  ) : null}
                </td>
                <td
                  className={cn(
                    "px-3 py-2 text-right tnum",
                    line.kind === "total" ? "font-semibold text-ink" : "text-ink",
                    line.kind === "subtotal" && "font-medium",
                  )}
                >
                  {isHeading ? "" : formatSigned(line.period)}
                </td>
                {showYtd ? (
                  <td
                    className={cn(
                      "px-4 py-2 text-right tnum",
                      line.kind === "total" ? "font-semibold text-ink" : "text-ink-secondary",
                      line.kind === "subtotal" && "font-medium text-ink",
                    )}
                  >
                    {isHeading ? "" : formatSigned(line.ytd)}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatSigned(value: number): string {
  if (value < 0) return `(${formatMoneyWhole(Math.abs(value))})`;
  return formatMoneyWhole(value);
}
