/**
 * The table view every chart carries. It satisfies the relief rule for the
 * palette slots that sit under 3:1 on the light surface, and it is the fallback
 * for print, forced colours and screen readers.
 */
export function DataTableView({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: Array<{ key: string; cells: string[] }>;
}) {
  return (
    <details className="group mt-3 border-t border-hairline pt-2">
      <summary className="cursor-pointer list-none text-[11px] font-medium text-ink-secondary hover:text-ink">
        <span className="group-open:hidden">View data table</span>
        <span className="hidden group-open:inline">Hide data table</span>
      </summary>
      <div className="scroll-thin mt-2 max-h-56 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-hairline text-left text-ink-muted">
              {columns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={`py-1.5 pr-3 font-medium ${index === 0 ? "" : "text-right"}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-hairline/60 last:border-0">
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.key}-${index}`}
                    className={`py-1.5 pr-3 ${index === 0 ? "text-ink-secondary" : "text-right tnum text-ink"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
