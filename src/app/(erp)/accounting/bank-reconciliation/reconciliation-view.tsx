"use client";

import { useState } from "react";
import { Check, CircleAlert, Link2, Link2Off, Sparkles, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { Tabs } from "@/components/ui/tabs";
import { formatDate, formatMoneyCompact, formatMoneyWhole, toNumber } from "@/lib/format";
import type { CashBankEntry, ReconciliationStatement } from "@/lib/types";
import { cn } from "@/lib/utils";

const BASIS_LABEL = {
  reference: "reference match",
  amount_and_date: "amount and date",
  amount: "amount only",
} as const;

/**
 * Reconciliation workspace.
 *
 * Matching does not change the bank balance or the book balance: it explains
 * the gap between them. The working at the bottom is the real output - it only
 * reaches zero once every line is either matched, marked as an outstanding
 * item, or queued for posting.
 */
export function ReconciliationView({
  statement,
  entries,
  bookBalance,
}: {
  statement: ReconciliationStatement;
  entries: CashBankEntry[];
  bookBalance: number;
}) {
  // Opening balance is a position, not a movement, so it never reconciles.
  const movements = entries.filter((entry) => entry.reference !== "OPENING");

  const [matched, setMatched] = useState<Record<string, string>>({});
  const [outstanding, setOutstanding] = useState<string[]>([]);
  const [toPost, setToPost] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [filter, setFilter] = useState("open");

  const matchedEntryIds = Object.values(matched);
  const isLineMatched = (id: string) => id in matched;
  const isEntryMatched = (id: string) => matchedEntryIds.includes(id);

  function acceptSuggestions() {
    const next = { ...matched };
    for (const line of statement.lines) {
      if (!line.suggestedEntryId || next[line.id]) continue;
      if (Object.values(next).includes(line.suggestedEntryId)) continue;
      next[line.id] = line.suggestedEntryId;
    }
    setMatched(next);
    setSelectedLine(null);
    setSelectedEntry(null);
  }

  function matchSelected() {
    if (!selectedLine || !selectedEntry) return;
    setMatched((current) => ({ ...current, [selectedLine]: selectedEntry }));
    setOutstanding((current) => current.filter((id) => id !== selectedEntry));
    setToPost((current) => current.filter((id) => id !== selectedLine));
    setSelectedLine(null);
    setSelectedEntry(null);
  }

  function unmatch(lineId: string) {
    setMatched((current) => {
      const next = { ...current };
      delete next[lineId];
      return next;
    });
  }

  function toggle(list: string[], setList: (value: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id]);
  }

  /* ---------------- reconciliation working ---------------- */

  const outstandingEntries = movements.filter(
    (entry) => outstanding.includes(entry.id) && !isEntryMatched(entry.id),
  );
  const outstandingPayments = outstandingEntries.reduce(
    (total, entry) => total + toNumber(entry.outflow),
    0,
  );
  const depositsInTransit = outstandingEntries.reduce(
    (total, entry) => total + toNumber(entry.inflow),
    0,
  );

  const postableLines = statement.lines.filter(
    (line) => toPost.includes(line.id) && !isLineMatched(line.id),
  );
  const unbookedCredits = postableLines
    .filter((line) => toNumber(line.amount) > 0)
    .reduce((total, line) => total + toNumber(line.amount), 0);
  const unbookedDebits = postableLines
    .filter((line) => toNumber(line.amount) < 0)
    .reduce((total, line) => total + Math.abs(toNumber(line.amount)), 0);

  const statementClosing = toNumber(statement.closingBalance);
  const adjustedBank = statementClosing - outstandingPayments + depositsInTransit;
  const adjustedBook = bookBalance + unbookedCredits - unbookedDebits;
  const difference = adjustedBank - adjustedBook;
  const reconciled = Math.abs(difference) < 1;

  const openLines = statement.lines.filter((line) => !isLineMatched(line.id));
  const openEntries = movements.filter((entry) => !isEntryMatched(entry.id));
  const unclassified =
    openLines.filter((line) => !toPost.includes(line.id)).length +
    openEntries.filter((entry) => !outstanding.includes(entry.id)).length;

  const visibleLines = filter === "open" ? openLines : filter === "matched" ? statement.lines.filter((line) => isLineMatched(line.id)) : statement.lines;
  const visibleEntries =
    filter === "open" ? openEntries : filter === "matched" ? movements.filter((entry) => isEntryMatched(entry.id)) : movements;

  const entryById = new Map(movements.map((entry) => [entry.id, entry]));
  const lineByEntryId = new Map(
    Object.entries(matched).map(([lineId, entryId]) => [entryId, lineId]),
  );
  const lineById = new Map(statement.lines.map((line) => [line.id, line]));

  return (
    <div className="flex flex-col gap-4">
      <SummaryStrip
        items={[
          {
            label: "Balance per statement",
            value: formatMoneyCompact(statementClosing),
            caption: `${statement.periodLabel} · ${statement.lines.length} lines`,
          },
          {
            label: "Balance per books",
            value: formatMoneyCompact(bookBalance),
            caption: `${movements.length} posted movements`,
          },
          {
            label: "Matched",
            value: `${Object.keys(matched).length} of ${statement.lines.length}`,
            caption: `${unclassified} items still to classify`,
            tone: unclassified === 0 ? "good" : "muted",
          },
          {
            label: "Difference to explain",
            value: formatMoneyCompact(difference),
            caption: reconciled ? "Reconciled" : "Match or classify the remaining items",
            tone: reconciled ? "good" : "critical",
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          tabs={[
            { id: "open", label: "Open", count: openLines.length + openEntries.length },
            { id: "matched", label: "Matched", count: Object.keys(matched).length },
            { id: "all", label: "All" },
          ]}
          active={filter}
          onChange={setFilter}
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={acceptSuggestions}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-lg border border-hairline px-2.5 text-[11.5px] font-medium text-ink-secondary transition-colors hover:border-hairline-strong hover:text-ink"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Accept suggestions
          </button>
          <button
            type="button"
            onClick={matchSelected}
            disabled={!selectedLine || !selectedEntry}
            className={cn(
              "inline-flex h-[30px] items-center gap-1.5 rounded-lg px-2.5 text-[11.5px] font-medium transition-colors",
              selectedLine && selectedEntry
                ? "bg-accent text-on-accent hover:bg-accent-hover"
                : "border border-hairline text-ink-muted",
            )}
          >
            <Link2 className="size-3.5" aria-hidden />
            Match selected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {/* bank statement side */}
        <Panel>
          <PanelHeader
            title="Bank statement"
            subtitle={`${statement.accountName} · imported ${formatDate(statement.importedOn)}`}
          />
          <ul className="divide-y divide-hairline">
            {visibleLines.map((line) => {
              const amount = toNumber(line.amount);
              const isMatched = isLineMatched(line.id);
              const counterpart = isMatched ? entryById.get(matched[line.id]) : undefined;
              const queued = toPost.includes(line.id);
              return (
                <li key={line.id}>
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-2.5 transition-colors",
                      selectedLine === line.id && "bg-accent-wash",
                      isMatched && "opacity-70",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedLine(selectedLine === line.id ? null : line.id)}
                      disabled={isMatched}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[12.5px] font-medium text-ink">
                          {line.description}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[12.5px] font-medium tnum",
                            amount < 0 ? "text-delta-down" : "text-ink",
                          )}
                        >
                          {amount < 0 ? "-" : "+"}
                          {formatMoneyWhole(Math.abs(amount))}
                        </span>
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-ink-muted">
                        <span>{formatDate(line.date)}</span>
                        <span>·</span>
                        <span className="truncate">{line.reference}</span>
                        {line.suggestionBasis && !isMatched ? (
                          <Badge tone="accent" dot>
                            Suggested by {BASIS_LABEL[line.suggestionBasis]}
                          </Badge>
                        ) : null}
                        {counterpart ? (
                          <span className="inline-flex items-center gap-1 text-ink-secondary">
                            <Link2 className="size-3" aria-hidden />
                            {counterpart.reference}
                          </span>
                        ) : null}
                      </span>
                    </button>

                    <div className="flex shrink-0 items-start gap-1">
                      {isMatched ? (
                        <button
                          type="button"
                          onClick={() => unmatch(line.id)}
                          className="inline-flex h-[24px] items-center gap-1 rounded-md px-1.5 text-[10.5px] font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
                        >
                          <Link2Off className="size-3" aria-hidden />
                          Unmatch
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggle(toPost, setToPost, line.id)}
                          className={cn(
                            "inline-flex h-[24px] items-center gap-1 rounded-md border px-1.5 text-[10.5px] font-medium transition-colors",
                            queued
                              ? "border-hairline-strong bg-surface-2 text-ink"
                              : "border-hairline text-ink-muted hover:text-ink",
                          )}
                        >
                          {queued ? <Check className="size-3" aria-hidden /> : null}
                          Post to ledger
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {visibleLines.length === 0 ? (
              <li className="px-4 py-10 text-center text-[12px] text-ink-muted">
                No statement lines in this view.
              </li>
            ) : null}
          </ul>
        </Panel>

        {/* book side */}
        <Panel>
          <PanelHeader
            title="Book entries"
            subtitle="Receipts, payments and transfers posted to this account"
          />
          <ul className="divide-y divide-hairline">
            {visibleEntries.map((entry) => {
              const inflow = toNumber(entry.inflow);
              const outflow = toNumber(entry.outflow);
              const amount = inflow - outflow;
              const isMatched = isEntryMatched(entry.id);
              const counterpartLine = isMatched ? lineById.get(lineByEntryId.get(entry.id) ?? "") : undefined;
              const flagged = outstanding.includes(entry.id);
              return (
                <li key={entry.id}>
                  <div
                    className={cn(
                      "flex gap-3 px-4 py-2.5 transition-colors",
                      selectedEntry === entry.id && "bg-accent-wash",
                      isMatched && "opacity-70",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                      disabled={isMatched}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-[12.5px] font-medium text-ink">
                          {entry.particulars}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[12.5px] font-medium tnum",
                            amount < 0 ? "text-delta-down" : "text-ink",
                          )}
                        >
                          {amount < 0 ? "-" : "+"}
                          {formatMoneyWhole(Math.abs(amount))}
                        </span>
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10.5px] text-ink-muted">
                        <span>{formatDate(entry.date)}</span>
                        <span>·</span>
                        <span className="truncate">{entry.reference}</span>
                        {counterpartLine ? (
                          <span className="inline-flex items-center gap-1 text-ink-secondary">
                            <Link2 className="size-3" aria-hidden />
                            {counterpartLine.reference}
                          </span>
                        ) : null}
                      </span>
                    </button>

                    <div className="flex shrink-0 items-start gap-1">
                      {isMatched ? (
                        <span className="inline-flex h-[24px] items-center gap-1 px-1.5 text-[10.5px] text-ink-muted">
                          <Check className="size-3 text-good" aria-hidden />
                          Matched
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggle(outstanding, setOutstanding, entry.id)}
                          className={cn(
                            "inline-flex h-[24px] items-center gap-1 rounded-md border px-1.5 text-[10.5px] font-medium transition-colors",
                            flagged
                              ? "border-hairline-strong bg-surface-2 text-ink"
                              : "border-hairline text-ink-muted hover:text-ink",
                          )}
                        >
                          {flagged ? <Check className="size-3" aria-hidden /> : null}
                          {outflow > 0 ? "Uncleared cheque" : "In transit"}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {visibleEntries.length === 0 ? (
              <li className="px-4 py-10 text-center text-[12px] text-ink-muted">
                No book entries in this view.
              </li>
            ) : null}
          </ul>
        </Panel>
      </div>

      {/* the formal working */}
      <Panel>
        <PanelHeader
          title="Reconciliation statement"
          subtitle="Bank balance adjusted to the ledger, as it would be signed off"
          action={
            <button
              type="button"
              onClick={() => {
                setMatched({});
                setOutstanding([]);
                setToPost([]);
              }}
              className="inline-flex h-[26px] items-center gap-1 rounded-md px-1.5 text-[10.5px] font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              <Undo2 className="size-3" aria-hidden />
              Reset
            </button>
          }
        />
        <PanelBody className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <dl className="space-y-1.5 text-[12.5px]">
            <Row label="Balance per bank statement" value={statementClosing} bold />
            <Row label="Less: uncleared cheques" value={-outstandingPayments} indent />
            <Row label="Add: deposits in transit" value={depositsInTransit} indent />
            <Row label="Adjusted bank balance" value={adjustedBank} rule bold />
          </dl>

          <dl className="space-y-1.5 text-[12.5px]">
            <Row label="Balance per books" value={bookBalance} bold />
            <Row label="Add: credits not yet posted" value={unbookedCredits} indent />
            <Row label="Less: charges not yet posted" value={-unbookedDebits} indent />
            <Row label="Adjusted book balance" value={adjustedBook} rule bold />
          </dl>
        </PanelBody>
        <PanelFooter>
          <span className="flex items-center gap-1.5">
            {reconciled ? (
              <>
                <Check className="size-3.5 text-good" aria-hidden />
                Both sides agree - the account can be marked reconciled to{" "}
                {formatDate(statement.lines[statement.lines.length - 1].date)}
              </>
            ) : (
              <>
                <CircleAlert className="size-3.5 text-critical" aria-hidden />
                {formatMoneyWhole(Math.abs(difference))} still unexplained
              </>
            )}
          </span>
          <button
            type="button"
            disabled={!reconciled}
            className={cn(
              "inline-flex h-[26px] items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors",
              reconciled
                ? "bg-accent text-on-accent hover:bg-accent-hover"
                : "border border-hairline text-ink-muted",
            )}
          >
            Mark reconciled
          </button>
        </PanelFooter>
      </Panel>
    </div>
  );
}

function Row({
  label,
  value,
  indent,
  bold,
  rule,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  rule?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        rule && "border-t border-hairline pt-1.5",
      )}
    >
      <dt className={cn(indent ? "pl-3 text-ink-muted" : "text-ink-secondary")}>{label}</dt>
      <dd className={cn("tnum", bold ? "font-semibold text-ink" : "text-ink")}>
        {value < 0 ? `(${formatMoneyWhole(Math.abs(value))})` : formatMoneyWhole(value)}
      </dd>
    </div>
  );
}
