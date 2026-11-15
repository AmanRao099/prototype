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
 * The register table. Dense but not cramped: a sticky header, hairline row
 * rules at half strength, tabular figures on every right-aligned column, and
 * no zebra striping - the hover tint is the only row chrome.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  footer,
  emptyMessage = "No records match the current filters.",
  minWidth = "min-w-[720px]",
  maxHeight,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  footer?: ReactNode;
  emptyMessage?: string;
  minWidth?: string;
  maxHeight?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-4 py-14 text-center">
        <p className="text-[12.5px] text-ink-secondary">{emptyMessage}</p>
        <p className="t-caption mt-1">Adjust the search or filters above.</p>
      </div>
    );
  }

  return (
    <div className={cn("scroll-thin overflow-x-auto", maxHeight && "overflow-y-auto", maxHeight)}>
      <table className={cn("w-full border-collapse text-[12.5px]", minWidth)}>
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-hairline text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-3 py-2.5 text-[10px] font-semibold tracking-[0.07em] text-ink-muted uppercase first:pl-4 last:pr-4",
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
              className="border-b border-hairline/60 transition-colors last:border-0 hover:bg-surface-2/60"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-3 py-2.5 align-middle whitespace-nowrap first:pl-4 last:pr-4",
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
          <tfoot className="sticky bottom-0 bg-surface-2/80 backdrop-blur">
            <tr className="border-t border-hairline text-[11.5px] font-medium text-ink">{footer}</tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

/** Two-line cell used across the registers: a primary value and a quiet note. */
export function CellStack({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate font-medium text-ink">{primary}</span>
      {secondary ? (
        <span className="mt-0.5 block truncate text-[10.5px] text-ink-muted">{secondary}</span>
      ) : null}
    </span>
  );
}
