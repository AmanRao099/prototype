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
  /** Leave this column out of the phone card - reference detail nobody taps. */
  hideOnCard?: boolean;
  cell: (row: T) => ReactNode;
}

const HIDE_CLASS: Record<NonNullable<Column<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

/**
 * The register, in two shapes.
 *
 * From `md` up it is a table: dense but not cramped - sticky header, hairline
 * row rules at half strength, tabular figures on every right-aligned column,
 * no zebra striping, the hover tint is the only row chrome.
 *
 * Below `md` a forty-column register cannot be a table without a horizontal
 * scrollbar nobody finds, so each row becomes a card built from the same
 * column definitions: the first column is the title, the last money column is
 * the headline figure, everything else is a label/value pair, and action
 * columns (those with an empty header) sit at the foot of the card.
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
  /** Totals row. Shown with the table; the phone cards rely on the figures above. */
  footer?: ReactNode;
  emptyMessage?: string;
  minWidth?: string;
  maxHeight?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-[13.5px] text-ink-secondary">{emptyMessage}</p>
        <p className="t-caption mt-1">Adjust the search or filters above.</p>
      </div>
    );
  }

  const [title, ...others] = columns;
  const cardColumns = others.filter((column) => !column.hideOnCard);
  const actionColumns = cardColumns.filter((column) => column.header === "");
  const valueColumns = cardColumns.filter((column) => column.header !== "");
  const trailing = [...valueColumns].reverse().find((column) => column.align === "right");
  const detailColumns = valueColumns.filter((column) => column !== trailing);

  return (
    <>
      {/* phone: one card per record */}
      <ul
        className={cn(
          "divide-y divide-hairline md:hidden",
          maxHeight && "scroll-thin overflow-y-auto",
          maxHeight,
        )}
      >
        {rows.map((row) => (
          <li key={row.id} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">{title.cell(row)}</div>
              {trailing ? (
                <div className="shrink-0 text-right">
                  <p className="text-[10.5px] text-ink-muted">{trailing.header}</p>
                  <p className="mt-0.5 text-[13.5px] font-medium tnum text-ink">
                    {trailing.cell(row)}
                  </p>
                </div>
              ) : null}
            </div>

            {detailColumns.length > 0 ? (
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {detailColumns.map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-[10.5px] text-ink-muted">{column.header}</dt>
                    <dd
                      className={cn(
                        "mt-0.5 min-w-0 truncate text-[12.5px] text-ink-secondary",
                        column.align === "right" && "tnum",
                      )}
                    >
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {actionColumns.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {actionColumns.map((column) => (
                  <span key={column.key}>{column.cell(row)}</span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {/* tablet and up: the register as a table */}
      <div
        className={cn(
          "scroll-thin hidden overflow-x-auto md:block",
          maxHeight && "overflow-y-auto",
          maxHeight,
        )}
      >
        <table className={cn("w-full border-collapse text-[13px]", minWidth)}>
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-hairline text-left">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-3.5 py-3 text-[11.5px] font-medium text-ink-muted first:pl-5 last:pr-5",
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
                      "px-3.5 py-3 align-middle whitespace-nowrap first:pl-5 last:pr-5",
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
              <tr className="border-t border-hairline text-[12.5px] font-medium text-ink">
                {footer}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
    </>
  );
}

/** Two-line cell used across the registers: a primary value and a quiet note. */
export function CellStack({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate font-medium text-ink">{primary}</span>
      {secondary ? (
        <span className="mt-0.5 block truncate text-[11.5px] text-ink-muted">{secondary}</span>
      ) : null}
    </span>
  );
}
