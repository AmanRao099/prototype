"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileSpreadsheet } from "lucide-react";
import { Badge, PhaseBadge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { DeliveryPhase, StockLedgerRow } from "@/lib/types";

export interface InventoryReport {
  id: string;
  name: string;
  description: string;
  category: string;
  phase: DeliveryPhase;
  lastRunOn?: string;
  href?: string;
}

export function InventoryReportingView({
  ledger,
  reports,
}: {
  ledger: StockLedgerRow[];
  reports: InventoryReport[];
}) {
  const [tab, setTab] = useState("ledger");
  const [search, setSearch] = useState("");

  const needle = search.trim().toLowerCase();
  const rows = ledger.filter((row) => {
    if (!needle) return true;
    return (
      row.item.toLowerCase().includes(needle) ||
      row.sku.toLowerCase().includes(needle) ||
      row.reference.toLowerCase().includes(needle) ||
      row.movementType.toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<StockLedgerRow>> = [
    { key: "date", header: "Date", width: "w-[104px]", cell: (row) => formatDate(row.date) },
    {
      key: "reference",
      header: "Reference",
      cell: (row) => <CellStack primary={row.reference} secondary={row.movementType} />,
    },
    {
      key: "item",
      header: "Item",
      hideBelow: "md",
      cell: (row) => <CellStack primary={row.item} secondary={row.sku} />,
    },
    { key: "warehouse", header: "Warehouse", hideBelow: "lg", cell: (row) => row.warehouse },
    {
      key: "in",
      header: "In",
      align: "right",
      cell: (row) => (row.inQty ? formatQty(row.inQty) : <span className="text-ink-muted">-</span>),
    },
    {
      key: "out",
      header: "Out",
      align: "right",
      cell: (row) => (row.outQty ? formatQty(row.outQty) : <span className="text-ink-muted">-</span>),
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      cell: (row) => <span className="font-medium">{formatQty(row.balanceQty)}</span>,
    },
    {
      key: "rate",
      header: "Rate",
      align: "right",
      hideBelow: "xl",
      cell: (row) => formatMoneyWhole(row.rate),
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      cell: (row) => formatMoneyWhole(row.value),
    },
  ];

  const categories = Array.from(new Set(reports.map((report) => report.category)));
  const closing = rows[rows.length - 1];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "ledger", label: "Stock ledger", count: ledger.length },
          { id: "catalogue", label: "Report catalogue", count: reports.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "ledger" ? (
        <Panel>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search item, SKU, reference or movement type"
          >
            <ResultCount shown={rows.length} total={ledger.length} noun="movements" />
          </Toolbar>
          <DataTable
            columns={columns}
            rows={rows}
            minWidth="min-w-[1100px]"
            footer={
              closing ? (
                <>
                  <td className="px-4 py-2" colSpan={6}>
                    Closing position for the filtered movements
                  </td>
                  <td className="px-3 py-2 text-right tnum">{formatQty(closing.balanceQty)}</td>
                  <td className="hidden px-3 py-2 text-right tnum xl:table-cell">
                    {formatMoneyWhole(closing.rate)}
                  </td>
                  <td className="px-4 py-2 text-right tnum">
                    {formatMoneyWhole(toNumber(closing.value))}
                  </td>
                </>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <Panel key={category}>
              <PanelHeader
                title={category}
                subtitle={`${reports.filter((report) => report.category === category).length} reports`}
              />
              <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {reports
                  .filter((report) => report.category === category)
                  .map((report) => {
                    const body = (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                            <FileSpreadsheet className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                            {report.name}
                          </p>
                          {report.phase !== "mvp" ? <PhaseBadge phase={report.phase} /> : null}
                        </div>
                        <p className="mt-1 text-[11px] text-ink-secondary">{report.description}</p>
                        <p className="mt-2 flex items-center justify-between gap-2 text-[10.5px] text-ink-muted">
                          <span>
                            {report.lastRunOn ? `Last run ${formatDate(report.lastRunOn)}` : "Not run yet"}
                          </span>
                          {report.href ? (
                            <span className="inline-flex items-center gap-0.5 text-accent">
                              Open
                              <ArrowUpRight className="size-3" aria-hidden />
                            </span>
                          ) : (
                            <Badge tone="neutral">Scheduled</Badge>
                          )}
                        </p>
                      </>
                    );

                    const shell =
                      "rounded-lg border border-hairline bg-plane p-3 transition-colors hover:border-hairline-strong";

                    return report.href ? (
                      <Link key={report.id} href={report.href} className={shell}>
                        {body}
                      </Link>
                    ) : (
                      <div key={report.id} className={shell}>
                        {body}
                      </div>
                    );
                  })}
              </PanelBody>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
