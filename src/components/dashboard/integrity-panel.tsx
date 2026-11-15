import Link from "next/link";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { formatDate, formatMoneyCompact, formatMoneyWhole, toNumber } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

/**
 * The control panel the proposal's acceptance checklist asks for: posted
 * journals balance, unposted work is visible, and the VAT position for the
 * open return period is stated with its due date.
 */
export function IntegrityPanel({
  trialBalance,
  vat,
}: {
  trialBalance: DashboardData["trialBalance"];
  vat: DashboardData["vat"];
}) {
  const balanced = trialBalance.balanced;
  const difference = Math.abs(toNumber(trialBalance.totalDebit) - toNumber(trialBalance.totalCredit));

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-lg border border-hairline bg-plane p-3">
        <div className="flex items-center gap-2">
          {balanced ? (
            <ShieldCheck className="size-4 shrink-0 text-good" aria-hidden />
          ) : (
            <CircleAlert className="size-4 shrink-0 text-critical" aria-hidden />
          )}
          <p className="text-[12px] font-semibold text-ink">
            {balanced ? "Trial balance is balanced" : "Trial balance is out by " + formatMoneyWhole(difference)}
          </p>
        </div>
        <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <dt className="text-ink-muted">Total debit</dt>
          <dd className="text-right font-medium tnum text-ink">
            {formatMoneyWhole(trialBalance.totalDebit)}
          </dd>
          <dt className="text-ink-muted">Total credit</dt>
          <dd className="text-right font-medium tnum text-ink">
            {formatMoneyWhole(trialBalance.totalCredit)}
          </dd>
          <dt className="text-ink-muted">Unposted journals</dt>
          <dd className="text-right font-medium tnum text-ink">{trialBalance.unpostedJournals}</dd>
        </dl>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="t-eyebrow">Net VAT payable</p>
          <p className="text-[10.5px] text-ink-muted">{vat.periodLabel}</p>
        </div>
        <p className="t-figure mt-2 tnum" title={formatMoneyWhole(vat.netPayable)}>
          {formatMoneyCompact(vat.netPayable)}
        </p>
        <dl className="mt-3 space-y-1.5 border-t border-hairline pt-2.5 text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-muted">Output VAT on sales</dt>
            <dd className="font-medium tnum text-ink">{formatMoneyWhole(vat.outputVat)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-muted">Input VAT on purchases</dt>
            <dd className="font-medium tnum text-ink">{formatMoneyWhole(vat.inputVat)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-muted">Return due</dt>
            <dd className="font-medium text-ink">{formatDate(vat.returnDueOn)}</dd>
          </div>
        </dl>
      </div>

      <Link
        href="/accounting/tax-vat"
        className="rounded-lg border border-hairline px-3 py-1.5 text-center text-[11.5px] font-medium text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
      >
        Open VAT return workings
      </Link>
    </div>
  );
}
