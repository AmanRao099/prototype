"use client";

import { useMemo, useState } from "react";
import { RankedBars } from "@/components/charts/ranked-bars";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDate, formatMoneyCompact, formatMoneyWhole, toNumber } from "@/lib/format";
import type { DocumentStatus, Money, Party } from "@/lib/types";

/** A receivable or payable document reduced to what the ledger screens show. */
export interface OpenDocument {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  party: string;
  total: Money;
  settled: Money;
  balance: Money;
  status: DocumentStatus;
  daysOverdue: number;
}

export interface AgeingRow {
  label: string;
  amount: number;
}

/**
 * Shared screen body for Accounts Receivable and Accounts Payable: the two
 * modules carry the same workflow with the party and the settlement direction
 * swapped, so they share one view and differ only in labels.
 */
export function PartyLedgerView({
  parties,
  documents,
  ageing,
  partyNoun,
  documentNoun,
  settledLabel,
  showCreditLimit = false,
}: {
  parties: Party[];
  documents: OpenDocument[];
  ageing: AgeingRow[];
  partyNoun: string;
  documentNoun: string;
  settledLabel: string;
  showCreditLimit?: boolean;
}) {
  const [tab, setTab] = useState("parties");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredParties = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return parties;
    return parties.filter(
      (party) =>
        party.name.toLowerCase().includes(needle) ||
        party.code.toLowerCase().includes(needle) ||
        party.contact.toLowerCase().includes(needle),
    );
  }, [parties, search]);

  const filteredDocuments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return documents.filter((document) => {
      if (status === "overdue" && document.daysOverdue <= 0) return false;
      if (status === "open" && toNumber(document.balance) <= 0) return false;
      if (status === "part" && document.status !== "partially_paid") return false;
      if (!needle) return true;
      return (
        document.number.toLowerCase().includes(needle) ||
        document.party.toLowerCase().includes(needle)
      );
    });
  }, [documents, search, status]);

  const partyColumns: Array<Column<Party>> = [
    {
      key: "name",
      header: partyNoun,
      cell: (party) => (
        <span>
          <span className="block font-medium text-ink">{party.name}</span>
          <span className="block text-[10.5px] text-ink-muted">
            {party.code} - {party.contact}
          </span>
        </span>
      ),
    },
    { key: "phone", header: "Contact", hideBelow: "lg", cell: (party) => party.phone },
    {
      key: "terms",
      header: "Terms",
      hideBelow: "md",
      cell: (party) => `${party.creditDays} days`,
    },
    {
      key: "outstanding",
      header: "Outstanding",
      align: "right",
      cell: (party) => <span className="font-medium">{formatMoneyWhole(party.outstanding)}</span>,
    },
    {
      key: "overdue",
      header: "Overdue",
      align: "right",
      cell: (party) =>
        toNumber(party.overdue) > 0 ? (
          <span className="text-delta-down">{formatMoneyWhole(party.overdue)}</span>
        ) : (
          <span className="text-ink-muted">-</span>
        ),
    },
    ...(showCreditLimit
      ? [
          {
            key: "limit",
            header: "Credit limit",
            align: "right" as const,
            hideBelow: "sm" as const,
            cell: (party: Party) => {
              if (!party.creditLimit) return <span className="text-ink-muted">Not set</span>;
              const used = (toNumber(party.outstanding) / toNumber(party.creditLimit)) * 100;
              return (
                <span>
                  {formatMoneyWhole(party.creditLimit)}
                  <span
                    className={`block text-[10px] ${used >= 90 ? "text-delta-down" : "text-ink-muted"}`}
                  >
                    {used.toFixed(0)}% used
                  </span>
                </span>
              );
            },
          },
        ]
      : []),
    {
      key: "last",
      header: "Last transaction",
      align: "right",
      hideBelow: "lg",
      cell: (party) => formatDate(party.lastTransactionOn),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      hideBelow: "md",
      cell: (party) =>
        party.isActive ? <Badge tone="good">Active</Badge> : <Badge tone="neutral">On hold</Badge>,
    },
  ];

  const documentColumns: Array<Column<OpenDocument>> = [
    {
      key: "number",
      header: documentNoun,
      cell: (document) => (
        <span>
          <span className="block font-medium text-ink">{document.number}</span>
          <span className="block text-[10.5px] text-ink-muted">{formatDate(document.date)}</span>
        </span>
      ),
    },
    { key: "party", header: partyNoun, cell: (document) => document.party },
    {
      key: "due",
      header: "Due date",
      hideBelow: "md",
      cell: (document) => (
        <span>
          {formatDate(document.dueDate)}
          {document.daysOverdue > 0 ? (
            <span className="block text-[10.5px] text-delta-down tnum">
              {document.daysOverdue} days overdue
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "total",
      header: "Document total",
      align: "right",
      hideBelow: "sm",
      cell: (document) => formatMoneyWhole(document.total),
    },
    {
      key: "settled",
      header: settledLabel,
      align: "right",
      hideBelow: "sm",
      cell: (document) => formatMoneyWhole(document.settled),
    },
    {
      key: "balance",
      header: "Balance",
      align: "right",
      cell: (document) => <span className="font-medium">{formatMoneyWhole(document.balance)}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (document) => <StatusPill status={document.status} />,
    },
  ];

  const totalOutstanding = filteredDocuments.reduce(
    (sum, document) => sum + toNumber(document.balance),
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader
            title={`Top ${partyNoun.toLowerCase()} exposure`}
            subtitle="Outstanding balance by party"
          />
          <PanelBody>
            <RankedBars
              bars={parties.slice(0, 6).map((party) => ({
                id: party.id,
                label: party.name,
                value: toNumber(party.outstanding),
                meta:
                  toNumber(party.overdue) > 0
                    ? `${formatMoneyCompact(party.overdue)} overdue`
                    : "Nothing overdue",
              }))}
              formatValue={formatMoneyCompact}
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Ageing" subtitle="Balance by days outstanding" />
          <PanelBody>
            <RankedBars
              bars={ageing.map((bucket) => ({
                id: bucket.label,
                label: bucket.label,
                value: bucket.amount,
              }))}
              formatValue={formatMoneyCompact}
              color="var(--series-2)"
            />
          </PanelBody>
        </Panel>
      </div>

      <Tabs
        tabs={[
          { id: "parties", label: partyNoun, count: parties.length },
          { id: "documents", label: `Open ${documentNoun.toLowerCase()}s`, count: documents.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Panel>
        {tab === "parties" ? (
          <>
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={`Search ${partyNoun.toLowerCase()} by name, code or contact`}
            >
              <ResultCount
                shown={filteredParties.length}
                total={parties.length}
                noun={partyNoun.toLowerCase()}
              />
            </Toolbar>
            <DataTable columns={partyColumns} rows={filteredParties} minWidth="min-w-[900px]" />
          </>
        ) : (
          <>
            <Toolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder={`Search ${documentNoun.toLowerCase()} or party`}
              filters={[
                {
                  id: "status",
                  label: "Filter",
                  value: status,
                  onChange: setStatus,
                  options: [
                    { value: "all", label: "All documents" },
                    { value: "open", label: "With balance" },
                    { value: "overdue", label: "Overdue only" },
                    { value: "part", label: "Partly settled" },
                  ],
                },
              ]}
            >
              <ResultCount
                shown={filteredDocuments.length}
                total={documents.length}
                noun="documents"
              />
            </Toolbar>
            <DataTable
              columns={documentColumns}
              rows={filteredDocuments}
              minWidth="min-w-[920px]"
              footer={
                <>
                  <td className="px-4 py-2" colSpan={5}>
                    Total balance for the listed documents
                  </td>
                  <td className="px-3 py-2 text-right tnum">{formatMoneyWhole(totalOutstanding)}</td>
                  <td className="px-4 py-2" />
                </>
              }
            />
          </>
        )}
      </Panel>
    </div>
  );
}
