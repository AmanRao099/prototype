"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import type { CurrencySetting, NumberingSeries } from "@/lib/types";

const RESET_LABEL: Record<NumberingSeries["resetRule"], string> = {
  never: "Never resets",
  yearly: "Resets each financial year",
  monthly: "Resets monthly",
};

export function ConfigurationView({
  numbering,
  currencies,
}: {
  numbering: NumberingSeries[];
  currencies: CurrencySetting[];
}) {
  const [tab, setTab] = useState("numbering");

  const numberingColumns: Array<Column<NumberingSeries>> = [
    {
      key: "document",
      header: "Document type",
      cell: (series) => <CellStack primary={series.documentType} secondary={series.format} />,
    },
    { key: "prefix", header: "Prefix", hideBelow: "md", cell: (series) => series.prefix },
    {
      key: "next",
      header: "Next number",
      align: "right",
      cell: (series) => <span className="font-medium">{series.nextNumber}</span>,
    },
    {
      key: "reset",
      header: "Reset rule",
      hideBelow: "lg",
      cell: (series) => RESET_LABEL[series.resetRule],
    },
    {
      key: "branch",
      header: "Per branch",
      align: "right",
      cell: (series) =>
        series.branchSpecific ? (
          <Badge tone="accent" dot>
            Branch-wise
          </Badge>
        ) : (
          <span className="text-ink-muted">Company-wide</span>
        ),
    },
  ];

  const currencyColumns: Array<Column<CurrencySetting & { id: string }>> = [
    {
      key: "currency",
      header: "Currency",
      cell: (currency) => <CellStack primary={`${currency.code} · ${currency.name}`} secondary={currency.symbol} />,
    },
    {
      key: "base",
      header: "Role",
      hideBelow: "md",
      cell: (currency) =>
        currency.isBase ? (
          <Badge tone="good" dot>
            Base currency
          </Badge>
        ) : (
          <span className="text-ink-muted">Reporting only</span>
        ),
    },
    {
      key: "rate",
      header: "Rate to base",
      align: "right",
      cell: (currency) => (currency.isBase ? "1.0000" : currency.rateToBase.toFixed(4)),
    },
    {
      key: "updated",
      header: "Updated",
      align: "right",
      hideBelow: "lg",
      cell: (currency) => formatDate(currency.updatedOn),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "numbering", label: "Document numbering", count: numbering.length },
          { id: "currencies", label: "Currencies", count: currencies.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Panel>
        {tab === "numbering" ? (
          <DataTable columns={numberingColumns} rows={numbering} minWidth="min-w-[820px]" />
        ) : (
          <DataTable
            columns={currencyColumns}
            rows={currencies.map((currency) => ({ ...currency, id: currency.code }))}
            minWidth="min-w-[680px]"
          />
        )}
      </Panel>
    </div>
  );
}
