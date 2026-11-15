"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { formatDate, formatMoneyWhole, toNumber } from "@/lib/format";
import type { TaxCode, VatBox, VatReturnPeriod } from "@/lib/types";

const TREATMENT_LABEL: Record<VatBox["treatment"], string> = {
  standard: "Standard rated",
  zero_rated: "Zero rated",
  exempt: "Exempt",
  reverse_charge: "Reverse charge",
};

const STATUS_TONE: Record<VatReturnPeriod["status"], "neutral" | "warning" | "good"> = {
  open: "warning",
  ready: "neutral",
  filed: "good",
};

export function VatView({
  boxes,
  periods,
  codes,
}: {
  boxes: VatBox[];
  periods: VatReturnPeriod[];
  codes: TaxCode[];
}) {
  const [tab, setTab] = useState("return");
  const [periodId, setPeriodId] = useState(periods[0]?.id ?? "");

  const period = periods.find((item) => item.id === periodId) ?? periods[0];
  const outputBoxes = boxes.filter((box) => box.code.startsWith("1"));
  const inputBoxes = boxes.filter((box) => box.code.startsWith("2"));

  const boxColumns: Array<Column<VatBox & { id: string }>> = [
    { key: "code", header: "Box", width: "w-[64px]", cell: (box) => <span className="tnum">{box.code}</span> },
    { key: "label", header: "Description", cell: (box) => <span className="text-ink">{box.label}</span> },
    {
      key: "treatment",
      header: "Treatment",
      hideBelow: "md",
      cell: (box) => <Badge tone="neutral">{TREATMENT_LABEL[box.treatment]}</Badge>,
    },
    {
      key: "amount",
      header: "Net amount",
      align: "right",
      cell: (box) => formatMoneyWhole(box.amount),
    },
    {
      key: "vat",
      header: "VAT",
      align: "right",
      cell: (box) => <span className="font-medium">{formatMoneyWhole(box.vatAmount)}</span>,
    },
  ];

  const codeColumns: Array<Column<TaxCode & { id: string }>> = [
    { key: "code", header: "Code", cell: (code) => <span className="font-medium text-ink">{code.code}</span> },
    { key: "label", header: "Description", cell: (code) => code.label },
    {
      key: "rate",
      header: "Rate",
      align: "right",
      cell: (code) => <span className="tnum">{code.ratePct.toFixed(2)}%</span>,
    },
    {
      key: "treatment",
      header: "Treatment",
      hideBelow: "md",
      cell: (code) => TREATMENT_LABEL[code.treatment],
    },
    { key: "applies", header: "Applies to", hideBelow: "lg", cell: (code) => code.appliesTo },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (code) =>
        code.isActive ? <Badge tone="good">Active</Badge> : <Badge tone="neutral">Disabled</Badge>,
    },
  ];

  const periodColumns: Array<Column<VatReturnPeriod & { id: string }>> = [
    { key: "label", header: "Period", cell: (row) => <span className="font-medium text-ink">{row.label}</span> },
    {
      key: "range",
      header: "Covering",
      hideBelow: "md",
      cell: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
    },
    { key: "due", header: "Due", hideBelow: "sm", cell: (row) => formatDate(row.dueDate) },
    { key: "output", header: "Output VAT", align: "right", cell: (row) => formatMoneyWhole(row.outputVat) },
    { key: "input", header: "Input VAT", align: "right", cell: (row) => formatMoneyWhole(row.inputVat) },
    {
      key: "net",
      header: "Net payable",
      align: "right",
      cell: (row) => <span className="font-medium">{formatMoneyWhole(row.netPayable)}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (row) => (
        <Badge tone={STATUS_TONE[row.status]}>
          {row.status === "open" ? "Open" : row.status === "ready" ? "Ready to file" : "Filed"}
        </Badge>
      ),
    },
  ];

  const outputVat = outputBoxes.reduce((sum, box) => sum + toNumber(box.vatAmount), 0);
  const inputVat = inputBoxes.reduce((sum, box) => sum + toNumber(box.vatAmount), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          tabs={[
            { id: "return", label: "Return workings" },
            { id: "codes", label: "Tax codes", count: codes.length },
            { id: "history", label: "Filing history", count: periods.length },
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === "return" ? (
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Return period</span>
            <select
              value={periodId}
              onChange={(event) => setPeriodId(event.target.value)}
              className="rounded-lg border border-hairline bg-surface px-2 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none"
            >
              {periods.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {tab === "return" ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <div className="flex flex-col gap-3 xl:col-span-2">
            <Panel>
              <PanelHeader title="Output VAT on sales" subtitle="Boxes 1a to 1c" />
              <DataTable
                columns={boxColumns}
                rows={outputBoxes.map((box) => ({ ...box, id: box.code }))}
                minWidth="min-w-[680px]"
                footer={
                  <>
                    <td className="px-4 py-2" colSpan={3}>
                      Total output VAT
                    </td>
                    <td className="px-3 py-2 text-right tnum">
                      {formatMoneyWhole(outputBoxes.reduce((sum, box) => sum + toNumber(box.amount), 0))}
                    </td>
                    <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(outputVat)}</td>
                  </>
                }
              />
            </Panel>

            <Panel>
              <PanelHeader title="Input VAT on purchases" subtitle="Boxes 2a to 2c" />
              <DataTable
                columns={boxColumns}
                rows={inputBoxes.map((box) => ({ ...box, id: box.code }))}
                minWidth="min-w-[680px]"
                footer={
                  <>
                    <td className="px-4 py-2" colSpan={3}>
                      Total recoverable input VAT
                    </td>
                    <td className="px-3 py-2 text-right tnum">
                      {formatMoneyWhole(inputBoxes.reduce((sum, box) => sum + toNumber(box.amount), 0))}
                    </td>
                    <td className="px-4 py-2 text-right tnum">{formatMoneyWhole(inputVat)}</td>
                  </>
                }
              />
            </Panel>
          </div>

          <Panel>
            <PanelHeader title="Return summary" subtitle={period?.label} />
            <PanelBody className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
                  Net VAT payable
                </p>
                <p className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight text-ink">
                  {formatMoneyWhole(outputVat - inputVat)}
                </p>
              </div>

              <dl className="space-y-1.5 border-t border-hairline pt-2.5 text-[11.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Output VAT</dt>
                  <dd className="font-medium tnum text-ink">{formatMoneyWhole(outputVat)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Input VAT</dt>
                  <dd className="font-medium tnum text-ink">{formatMoneyWhole(inputVat)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Filing due</dt>
                  <dd className="font-medium text-ink">
                    {period ? formatDate(period.dueDate) : "-"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Status</dt>
                  <dd>
                    {period ? (
                      <Badge tone={STATUS_TONE[period.status]}>
                        {period.status === "open" ? "Open" : period.status === "ready" ? "Ready to file" : "Filed"}
                      </Badge>
                    ) : null}
                  </dd>
                </div>
              </dl>

              <p className="rounded-lg border border-hairline bg-plane p-2.5 text-[11px] text-ink-secondary">
                Phase 1 produces the return workings and the transaction report behind each box.
                Submission to the tax portal is out of scope and stays a manual filing step.
              </p>
            </PanelBody>
            <PanelFooter>
              <span>Transactions behind these boxes</span>
              <span className="font-medium text-ink">Export to Excel</span>
            </PanelFooter>
          </Panel>
        </div>
      ) : null}

      {tab === "codes" ? (
        <Panel>
          <PanelHeader
            title="Tax codes"
            subtitle="One jurisdiction in Phase 1; codes drive invoice and purchase tax calculation"
          />
          <DataTable
            columns={codeColumns}
            rows={codes.map((code) => ({ ...code, id: code.code }))}
            minWidth="min-w-[760px]"
          />
        </Panel>
      ) : null}

      {tab === "history" ? (
        <Panel>
          <PanelHeader title="Filing history" subtitle="Return periods and their net position" />
          <DataTable
            columns={periodColumns}
            rows={periods.map((item) => ({ ...item, id: item.id }))}
            minWidth="min-w-[880px]"
          />
        </Panel>
      ) : null}
    </div>
  );
}
