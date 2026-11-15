import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  /** Tailwind width utility, e.g. "w-[140px]". */
  width?: string;
  /** Hide below the given breakpoint to keep narrow screens readable. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  cell: (row: T) => ReactNode;
}

const HIDE_CLASS: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

/**
 * The table every register and list screen uses. Dense rows, tabular figures on
 * the right-aligned columns, hairline rules - no zebra striping or heavy chrome.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  footer,
  emptyMessage = "No records for the current filters.",
  minWidth = "min-w-[720px]",
}: {
  columns: Array<Column<T>>;
  rows: T[];
  footer?: ReactNode;
  emptyMessage?: string;
  minWidth?: string;
}) {
  if (rows.length === 0) {
    return <p className="px-4 py-10 text-center text-[12px] text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className={cn("w-full border-collapse text-[12px]", minWidth)}>
        <thead>
          <tr className="border-b border-hairline text-left text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-3 py-2 font-medium first:pl-4 last:pr-4",
                  column.align === "right" && "text-right",
                  column.width,
                  column.hideBelow && HIDE_CLASS[column.hideBelow],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-hairline/60 last:border-0 hover:bg-surface-2/50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-3 py-2 align-top first:pl-4 last:pr-4",
                    column.align === "right" ? "text-right tnum text-ink" : "text-ink-secondary",
                    column.hideBelow && HIDE_CLASS[column.hideBelow],
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot>
            <tr className="border-t border-hairline bg-surface-2/40 text-[11.5px] font-medium text-ink">
              {footer}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
