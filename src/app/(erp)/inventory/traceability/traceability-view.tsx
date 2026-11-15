"use client";

import { useState } from "react";
import { CircleAlert, ShieldAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { AS_OF } from "@/lib/ageing";
import { formatDate, formatDateTime, formatMoneyWhole, formatQty, toNumber } from "@/lib/format";
import type { BatchRecord, SerialRecord, TraceEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const BATCH_STATUS: Record<
  BatchRecord["status"],
  { label: string; tone: "good" | "warning" | "critical" | "neutral" }
> = {
  active: { label: "Active", tone: "good" },
  quarantined: { label: "Quarantined", tone: "warning" },
  expiring: { label: "Expiring", tone: "critical" },
  expired: { label: "Expired", tone: "critical" },
  consumed: { label: "Consumed", tone: "neutral" },
};

const SERIAL_STATUS: Record<
  SerialRecord["status"],
  { label: string; tone: "good" | "warning" | "critical" | "neutral" | "accent" }
> = {
  in_stock: { label: "In stock", tone: "good" },
  reserved: { label: "Reserved", tone: "accent" },
  delivered: { label: "Delivered", tone: "neutral" },
  returned: { label: "Returned", tone: "warning" },
  scrapped: { label: "Scrapped", tone: "critical" },
};

function daysUntil(date?: string): number | undefined {
  if (!date) return undefined;
  return Math.round((new Date(date).getTime() - AS_OF.getTime()) / 86_400_000);
}

export function TraceabilityView({
  batches,
  serials,
  trace,
  tracedBatchId,
}: {
  batches: BatchRecord[];
  serials: SerialRecord[];
  trace: TraceEvent[];
  tracedBatchId: string;
}) {
  const [tab, setTab] = useState("batches");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState(tracedBatchId);

  const needle = search.trim().toLowerCase();

  const batchRows = batches.filter((batch) => {
    if (status !== "all" && batch.status !== status) return false;
    if (!needle) return true;
    return (
      batch.batchNumber.toLowerCase().includes(needle) ||
      batch.item.toLowerCase().includes(needle) ||
      batch.sku.toLowerCase().includes(needle) ||
      batch.supplier.toLowerCase().includes(needle)
    );
  });

  const serialRows = serials.filter((serial) => {
    if (status !== "all" && serial.status !== status) return false;
    if (!needle) return true;
    return (
      serial.serialNumber.toLowerCase().includes(needle) ||
      serial.item.toLowerCase().includes(needle) ||
      (serial.customer ?? "").toLowerCase().includes(needle)
    );
  });

  const batchColumns: Array<Column<BatchRecord>> = [
    {
      key: "batch",
      header: "Batch",
      cell: (batch) => (
        <button type="button" onClick={() => setSelectedBatch(batch.id)} className="text-left">
          <CellStack primary={batch.batchNumber} secondary={`${batch.item} · ${batch.sku}`} />
        </button>
      ),
    },
    { key: "warehouse", header: "Warehouse", hideBelow: "md", cell: (batch) => batch.warehouse },
    {
      key: "expiry",
      header: "Expiry",
      cell: (batch) => {
        const days = daysUntil(batch.expiresOn);
        if (!batch.expiresOn) return <span className="text-ink-muted">No shelf life</span>;
        return (
          <span>
            {formatDate(batch.expiresOn)}
            <span
              className={cn(
                "block text-[10.5px]",
                days !== undefined && days < 0
                  ? "text-delta-down"
                  : days !== undefined && days <= 30
                    ? "text-delta-down"
                    : "text-ink-muted",
              )}
            >
              {days !== undefined && days < 0
                ? `${Math.abs(days)} days past expiry`
                : `${days} days remaining`}
            </span>
          </span>
        );
      },
    },
    {
      key: "received",
      header: "Received",
      align: "right",
      hideBelow: "lg",
      cell: (batch) => formatQty(batch.receivedQty, batch.unit),
    },
    {
      key: "remaining",
      header: "Remaining",
      align: "right",
      cell: (batch) => (
        <span className="font-medium">{formatQty(batch.remainingQty, batch.unit)}</span>
      ),
    },
    {
      key: "value",
      header: "Value at risk",
      align: "right",
      cell: (batch) => {
        const value = batch.remainingQty * toNumber(batch.unitCost);
        const days = daysUntil(batch.expiresOn);
        const atRisk = days !== undefined && days <= 30;
        return (
          <span className={cn(atRisk && value > 0 && "text-delta-down")}>
            {value ? formatMoneyWhole(value) : "-"}
          </span>
        );
      },
    },
    {
      key: "source",
      header: "Source",
      hideBelow: "xl",
      cell: (batch) => <CellStack primary={batch.supplier} secondary={batch.grnReference} />,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (batch) => (
        <Badge tone={BATCH_STATUS[batch.status].tone} dot>
          {BATCH_STATUS[batch.status].label}
        </Badge>
      ),
    },
  ];

  const serialColumns: Array<Column<SerialRecord>> = [
    {
      key: "serial",
      header: "Serial",
      cell: (serial) => (
        <CellStack primary={serial.serialNumber} secondary={`${serial.item} · ${serial.sku}`} />
      ),
    },
    { key: "warehouse", header: "Location", hideBelow: "md", cell: (serial) => serial.warehouse },
    {
      key: "customer",
      header: "Customer",
      cell: (serial) => serial.customer ?? <span className="text-ink-muted">-</span>,
    },
    {
      key: "delivered",
      header: "Delivered",
      hideBelow: "lg",
      cell: (serial) =>
        serial.deliveredOn ? formatDate(serial.deliveredOn) : <span className="text-ink-muted">-</span>,
    },
    {
      key: "warranty",
      header: "Warranty to",
      hideBelow: "lg",
      cell: (serial) => {
        if (!serial.warrantyUntil) return <span className="text-ink-muted">-</span>;
        const days = daysUntil(serial.warrantyUntil);
        return (
          <span className={cn(days !== undefined && days < 0 && "text-ink-muted")}>
            {formatDate(serial.warrantyUntil)}
          </span>
        );
      },
    },
    { key: "grn", header: "Receipt", hideBelow: "xl", cell: (serial) => serial.grnReference },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (serial) => (
        <Badge tone={SERIAL_STATUS[serial.status].tone} dot>
          {SERIAL_STATUS[serial.status].label}
        </Badge>
      ),
    },
  ];

  const batch = batches.find((entry) => entry.id === selectedBatch);
  const traceEvents = selectedBatch === tracedBatchId ? trace : [];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "batches", label: "Batches", count: batches.length },
          { id: "serials", label: "Serial numbers", count: serials.length },
          { id: "trace", label: "Movement trace" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "batches" ? (
        <Panel>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search batch, item, SKU or supplier"
            filters={[
              {
                id: "status",
                label: "Status",
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: "All batches" },
                  { value: "active", label: "Active" },
                  { value: "expiring", label: "Expiring" },
                  { value: "expired", label: "Expired" },
                  { value: "quarantined", label: "Quarantined" },
                  { value: "consumed", label: "Consumed" },
                ],
              },
            ]}
          >
            <ResultCount shown={batchRows.length} total={batches.length} noun="batches" />
          </Toolbar>
          <DataTable columns={batchColumns} rows={batchRows} minWidth="min-w-[1080px]" />
          <PanelFooter>
            <span>Select a batch number to open its movement trace</span>
            <span className="text-ink-secondary">
              FIFO picking follows the earliest expiry first
            </span>
          </PanelFooter>
        </Panel>
      ) : null}

      {tab === "serials" ? (
        <Panel>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search serial, item or customer"
            filters={[
              {
                id: "status",
                label: "Status",
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: "All serials" },
                  { value: "in_stock", label: "In stock" },
                  { value: "reserved", label: "Reserved" },
                  { value: "delivered", label: "Delivered" },
                  { value: "returned", label: "Returned" },
                  { value: "scrapped", label: "Scrapped" },
                ],
              },
            ]}
          >
            <ResultCount shown={serialRows.length} total={serials.length} noun="serials" />
          </Toolbar>
          <DataTable columns={serialColumns} rows={serialRows} minWidth="min-w-[1000px]" />
        </Panel>
      ) : null}

      {tab === "trace" ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <Panel>
            <PanelHeader title="Batch" subtitle="Pick a batch to trace" />
            <ul className="divide-y divide-hairline">
              {batches.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedBatch(entry.id)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left transition-colors",
                      entry.id === selectedBatch ? "bg-accent-wash" : "hover:bg-surface-2/60",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[12.5px] font-medium",
                          entry.id === selectedBatch ? "text-accent" : "text-ink",
                        )}
                      >
                        {entry.batchNumber}
                      </span>
                      <Badge tone={BATCH_STATUS[entry.status].tone} dot>
                        {BATCH_STATUS[entry.status].label}
                      </Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-ink-muted">
                      {entry.item}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="xl:col-span-2">
            <PanelHeader
              title={batch ? `${batch.batchNumber} movement trace` : "Movement trace"}
              subtitle={
                batch
                  ? `${batch.item} · received ${formatDate(batch.receivedOn)} on ${batch.grnReference}`
                  : undefined
              }
            />
            {traceEvents.length > 0 ? (
              <PanelBody>
                <ol className="relative space-y-4 border-l border-hairline pl-5">
                  {traceEvents.map((event) => (
                    <li key={event.id} className="relative">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute top-1.5 -left-[23px] size-2 rounded-full ring-4 ring-surface",
                          event.quantity > 0
                            ? "bg-good"
                            : event.quantity < 0
                              ? "bg-series-2"
                              : "bg-warning",
                        )}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-[12.5px] font-medium text-ink">
                          {event.movement}
                          <span className="ml-2 font-normal text-ink-muted">{event.reference}</span>
                        </p>
                        <p
                          className={cn(
                            "text-[12.5px] font-medium tnum",
                            event.quantity > 0
                              ? "text-ink"
                              : event.quantity < 0
                                ? "text-delta-down"
                                : "text-ink-muted",
                          )}
                        >
                          {event.quantity === 0
                            ? "-"
                            : `${event.quantity > 0 ? "+" : ""}${formatQty(event.quantity)}`}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[10.5px] text-ink-muted">
                        {formatDateTime(event.at)} · {event.warehouse}
                        {event.party ? ` · ${event.party}` : ""}
                      </p>
                      {event.note ? (
                        <p className="mt-1 text-[11.5px] text-ink-secondary">{event.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </PanelBody>
            ) : (
              <PanelBody>
                <p className="flex items-start gap-2 text-[12px] text-ink-secondary">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
                  No trace loaded for this batch in the sample data. The trace view is wired to
                  <span className="mx-1 font-medium text-ink">GET /api/inventory/trace/</span>
                  and shows every movement that touched the batch, in order.
                </p>
              </PanelBody>
            )}
            {batch ? (
              <PanelFooter>
                <span className="flex items-center gap-1.5">
                  {batch.status === "quarantined" ? (
                    <>
                      <ShieldAlert className="size-3.5 text-warning" aria-hidden />
                      Quarantined - cannot be picked until released
                    </>
                  ) : batch.status === "expiring" || batch.status === "expired" ? (
                    <>
                      <TriangleAlert className="size-3.5 text-critical" aria-hidden />
                      {formatQty(batch.remainingQty, batch.unit)} still on hand
                    </>
                  ) : (
                    <>Remaining {formatQty(batch.remainingQty, batch.unit)}</>
                  )}
                </span>
                <span className="font-medium text-ink">
                  {formatMoneyWhole(batch.remainingQty * toNumber(batch.unitCost))}
                </span>
              </PanelFooter>
            ) : null}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
