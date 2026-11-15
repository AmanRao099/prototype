"use client";

import { useState } from "react";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate, formatMoneyWhole, formatPercent, formatQty, toNumber } from "@/lib/format";
import type { LandedCostShipment, RevaluationRun, StandardCostRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const BASIS_LABEL: Record<RevaluationRun["basis"], string> = {
  standard_to_actual: "Standard to actual",
  market_price: "Market price",
  exchange_rate: "Exchange rate",
};

const ALLOCATION_BASIS: Record<LandedCostShipment["basis"], string> = {
  value: "Goods value",
  weight: "Weight",
  quantity: "Quantity",
};

/** Standard cost against the actual weighted-average cost, with the exposure. */
export function StandardCostView({ rows }: { rows: StandardCostRow[] }) {
  const columns: Array<Column<StandardCostRow>> = [
    {
      key: "item",
      header: "Item",
      cell: (row) => <CellStack primary={row.item} secondary={row.sku} />,
    },
    {
      key: "standard",
      header: "Standard",
      align: "right",
      cell: (row) => formatMoneyWhole(row.standardCost),
    },
    {
      key: "actual",
      header: "Actual (W.Avg)",
      align: "right",
      cell: (row) => formatMoneyWhole(row.actualCost),
    },
    {
      key: "variance",
      header: "Variance / unit",
      align: "right",
      cell: (row) => (
        <span
          className={cn(
            toNumber(row.variance) > 0 && "text-delta-down",
            toNumber(row.variance) < 0 && "text-delta-up",
          )}
        >
          {toNumber(row.variance) === 0 ? "-" : formatMoneyWhole(row.variance)}
        </span>
      ),
    },
    {
      key: "variancePct",
      header: "Variance %",
      align: "right",
      hideBelow: "md",
      cell: (row) => (
        <span
          className={cn(
            "inline-flex items-center gap-1",
            row.variancePct > 0 && "text-delta-down",
            row.variancePct < 0 && "text-delta-up",
          )}
        >
          {row.variancePct > 0 ? (
            <TrendingUp className="size-3" aria-hidden />
          ) : row.variancePct < 0 ? (
            <TrendingDown className="size-3" aria-hidden />
          ) : null}
          {row.variancePct === 0 ? "-" : formatPercent(row.variancePct)}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "On hand",
      align: "right",
      hideBelow: "lg",
      cell: (row) => formatQty(row.quantityOnHand, row.unit),
    },
    {
      key: "exposure",
      header: "Variance value",
      align: "right",
      cell: (row) => {
        const exposure = toNumber(row.variance) * row.quantityOnHand;
        return (
          <span className={cn("font-medium", exposure > 0 ? "text-delta-down" : exposure < 0 ? "text-delta-up" : "")}>
            {exposure === 0 ? "-" : formatMoneyWhole(exposure)}
          </span>
        );
      },
    },
    {
      key: "reviewed",
      header: "Reviewed",
      align: "right",
      hideBelow: "xl",
      cell: (row) => formatDate(row.lastReviewedOn),
    },
  ];

  const exposure = rows.reduce(
    (total, row) => total + toNumber(row.variance) * row.quantityOnHand,
    0,
  );
  const stale = rows.filter((row) => row.lastReviewedOn < "2026-10-01").length;

  return (
    <Panel>
      <PanelHeader
        title="Standard cost variance"
        subtitle="Where the standard has drifted from the cost the ledger is actually carrying"
      />
      <DataTable
        columns={columns}
        rows={rows}
        minWidth="min-w-[1020px]"
        footer={
          <>
            <td className="px-4 py-2" colSpan={6}>
              Total variance held in stock
            </td>
            <td className={cn("px-3 py-2 text-right tnum", exposure > 0 && "text-delta-down")}>
              {formatMoneyWhole(exposure)}
            </td>
            <td className="hidden px-4 py-2 xl:table-cell" />
          </>
        }
      />
      <PanelFooter>
        <span>
          {stale > 0
            ? `${stale} items have not been reviewed since the last quarter`
            : "All standards reviewed this quarter"}
        </span>
        <span className="text-ink-secondary">Revalue to clear the variance</span>
      </PanelFooter>
    </Panel>
  );
}

/** History of revaluation runs and what each one did to the stock value. */
export function RevaluationView({ runs }: { runs: RevaluationRun[] }) {
  const columns: Array<Column<RevaluationRun>> = [
    {
      key: "reference",
      header: "Run",
      cell: (run) => <CellStack primary={run.reference} secondary={formatDate(run.runOn)} />,
    },
    { key: "basis", header: "Basis", cell: (run) => BASIS_LABEL[run.basis] },
    { key: "items", header: "Items", align: "right", hideBelow: "md", cell: (run) => run.itemsAffected },
    {
      key: "before",
      header: "Value before",
      align: "right",
      hideBelow: "lg",
      cell: (run) => formatMoneyWhole(run.valueBefore),
    },
    {
      key: "after",
      header: "Value after",
      align: "right",
      hideBelow: "lg",
      cell: (run) => formatMoneyWhole(run.valueAfter),
    },
    {
      key: "impact",
      header: "P&L impact",
      align: "right",
      cell: (run) => {
        const impact = toNumber(run.valueAfter) - toNumber(run.valueBefore);
        return (
          <span className={cn("font-medium", impact < 0 ? "text-delta-down" : "text-delta-up")}>
            {impact < 0 ? "-" : "+"}
            {formatMoneyWhole(Math.abs(impact))}
          </span>
        );
      },
    },
    { key: "runBy", header: "Run by", hideBelow: "xl", cell: (run) => run.runBy },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (run) => <StatusPill status={run.status} />,
    },
  ];

  return (
    <Panel>
      <PanelHeader
        title="Revaluation runs"
        subtitle="Each run posts the difference to cost of goods sold and leaves an audit trail"
      />
      <DataTable columns={columns} rows={runs} minWidth="min-w-[1020px]" />
    </Panel>
  );
}

/** Shipment charges apportioned across the items that arrived on them. */
export function LandedCostView({ shipments }: { shipments: LandedCostShipment[] }) {
  const [selectedId, setSelectedId] = useState(shipments[0]?.id ?? "");
  const selected = shipments.find((shipment) => shipment.id === selectedId) ?? shipments[0];

  const charges = (shipment: LandedCostShipment) =>
    toNumber(shipment.freight) +
    toNumber(shipment.duty) +
    toNumber(shipment.insurance) +
    toNumber(shipment.handling);

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <Panel>
        <PanelHeader title="Shipments" subtitle="Charges waiting to be carried into stock" />
        <ul className="divide-y divide-hairline">
          {shipments.map((shipment) => {
            const active = shipment.id === selected?.id;
            return (
              <li key={shipment.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(shipment.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors",
                    active ? "bg-accent-wash" : "hover:bg-surface-2/60",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("text-[12.5px] font-medium", active ? "text-accent" : "text-ink")}>
                      {shipment.reference}
                    </span>
                    <Badge tone={shipment.status === "posted" ? "good" : "neutral"} dot>
                      {shipment.status === "posted"
                        ? "Posted"
                        : shipment.status === "allocated"
                          ? "Allocated"
                          : "Draft"}
                    </Badge>
                  </span>
                  <span className="mt-0.5 block text-[10.5px] text-ink-muted">
                    {shipment.supplier} · arrived {formatDate(shipment.arrivedOn)}
                  </span>
                  <span className="mt-1.5 block text-[11.5px] tnum text-ink-secondary">
                    {formatMoneyWhole(charges(shipment))} charges on{" "}
                    {formatMoneyWhole(shipment.goodsValue)} goods
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      {selected ? (
        <Panel className="xl:col-span-2">
          <PanelHeader
            title={`${selected.reference} apportionment`}
            subtitle={`Allocated on ${ALLOCATION_BASIS[selected.basis].toLowerCase()}`}
          />
          <PanelBody className="grid grid-cols-2 gap-x-6 gap-y-2 border-b border-hairline sm:grid-cols-4">
            {[
              { label: "Freight", value: selected.freight },
              { label: "Duty", value: selected.duty },
              { label: "Insurance", value: selected.insurance },
              { label: "Handling", value: selected.handling },
            ].map((charge) => (
              <div key={charge.label}>
                <p className="t-eyebrow">{charge.label}</p>
                <p className="mt-1.5 text-[13px] font-medium tnum text-ink">
                  {formatMoneyWhole(charge.value)}
                </p>
              </div>
            ))}
          </PanelBody>

          <DataTable
            columns={[
              {
                key: "item",
                header: "Item",
                cell: (row) => <CellStack primary={row.item} secondary={row.sku} />,
              },
              {
                key: "basis",
                header: `Basis (${ALLOCATION_BASIS[selected.basis].toLowerCase()})`,
                align: "right",
                cell: (row) =>
                  selected.basis === "value"
                    ? formatMoneyWhole(row.basisValue)
                    : formatQty(row.basisValue),
              },
              {
                key: "share",
                header: "Share",
                align: "right",
                hideBelow: "md",
                cell: (row) => {
                  const total = selected.allocations.reduce(
                    (sum, allocation) => sum + allocation.basisValue,
                    0,
                  );
                  return `${((row.basisValue / total) * 100).toFixed(1)}%`;
                },
              },
              {
                key: "allocated",
                header: "Cost added",
                align: "right",
                cell: (row) => (
                  <span className="font-medium">{formatMoneyWhole(row.allocated)}</span>
                ),
              },
            ]}
            rows={selected.allocations.map((allocation) => ({ ...allocation, id: allocation.sku }))}
            minWidth="min-w-[620px]"
            footer={
              <>
                <td className="px-4 py-2" colSpan={2}>
                  Total apportioned
                </td>
                <td className="hidden px-3 py-2 md:table-cell" />
                <td className="px-4 py-2 text-right tnum">
                  {formatMoneyWhole(
                    selected.allocations.reduce(
                      (sum, allocation) => sum + toNumber(allocation.allocated),
                      0,
                    ),
                  )}
                </td>
              </>
            }
          />

          <PanelFooter>
            <span className="flex items-center gap-1.5">
              Goods value {formatMoneyWhole(selected.goodsValue)}
              <ArrowRight className="size-3" aria-hidden />
              landed {formatMoneyWhole(toNumber(selected.goodsValue) + charges(selected))}
            </span>
            {Math.abs(
              selected.allocations.reduce(
                (sum, allocation) => sum + toNumber(allocation.allocated),
                0,
              ) - charges(selected),
            ) < 1 ? (
              <span className="text-ink-secondary">
                {((charges(selected) / toNumber(selected.goodsValue)) * 100).toFixed(1)}% uplift,
                fully apportioned
              </span>
            ) : (
              <span className="text-delta-down">
                Apportionment is short of the charges on this shipment
              </span>
            )}
          </PanelFooter>
        </Panel>
      ) : null}
    </div>
  );
}
