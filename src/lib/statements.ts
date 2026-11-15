import { toNumber } from "@/lib/format";
import type { TrialBalanceRow } from "@/lib/types";

/**
 * Financial statements derived from the trial balance.
 *
 * Phase 2 adds profit & loss, balance sheet and cash flow. They are computed
 * from the same rows the trial balance renders rather than stored separately,
 * so a statement can never disagree with the ledger it came from: if the trial
 * balance ties, every statement built here ties too.
 */

export interface StatementLine {
  code?: string;
  label: string;
  period: number;
  ytd: number;
  /** Rendering hint: a subtotal rule, a bold total, or a plain line. */
  kind?: "line" | "subtotal" | "total";
  /** Indent level for nested presentation. */
  depth?: number;
}

const sum = (rows: TrialBalanceRow[], pick: (row: TrialBalanceRow) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

/** Income and equity move on the credit side, assets and expenses on the debit side. */
function creditMovement(row: TrialBalanceRow) {
  return toNumber(row.periodCredit) - toNumber(row.periodDebit);
}

function debitMovement(row: TrialBalanceRow) {
  return toNumber(row.periodDebit) - toNumber(row.periodCredit);
}

function creditClosing(row: TrialBalanceRow) {
  return toNumber(row.closingCredit) - toNumber(row.closingDebit);
}

function debitClosing(row: TrialBalanceRow) {
  return toNumber(row.closingDebit) - toNumber(row.closingCredit);
}

function byCodes(rows: TrialBalanceRow[], codes: string[]) {
  return rows.filter((row) => codes.includes(row.accountCode));
}

function byType(rows: TrialBalanceRow[], type: TrialBalanceRow["type"]) {
  return rows.filter((row) => row.type === type);
}

/* ------------------------------------------------------------------ */
/* Profit & loss                                                       */
/* ------------------------------------------------------------------ */

export interface ProfitAndLoss {
  lines: StatementLine[];
  revenuePeriod: number;
  revenueYtd: number;
  grossProfitPeriod: number;
  grossProfitYtd: number;
  netProfitPeriod: number;
  netProfitYtd: number;
}

const COGS_CODE = "5100";

export function buildProfitAndLoss(rows: TrialBalanceRow[]): ProfitAndLoss {
  const income = byType(rows, "income");
  const expenses = byType(rows, "expense");
  const cogs = byCodes(expenses, [COGS_CODE]);
  const operating = expenses.filter((row) => row.accountCode !== COGS_CODE);
  const depreciation = byCodes(operating, ["5500"]);
  const otherOperating = operating.filter((row) => row.accountCode !== "5500");

  const revenuePeriod = sum(income, creditMovement);
  const revenueYtd = sum(income, creditClosing);
  const cogsPeriod = sum(cogs, debitMovement);
  const cogsYtd = sum(cogs, debitClosing);
  const grossProfitPeriod = revenuePeriod - cogsPeriod;
  const grossProfitYtd = revenueYtd - cogsYtd;
  const opexPeriod = sum(otherOperating, debitMovement);
  const opexYtd = sum(otherOperating, debitClosing);
  const depreciationPeriod = sum(depreciation, debitMovement);
  const depreciationYtd = sum(depreciation, debitClosing);

  const lines: StatementLine[] = [
    ...income.map((row) => ({
      code: row.accountCode,
      label: row.accountName,
      period: creditMovement(row),
      ytd: creditClosing(row),
      depth: 1,
    })),
    { label: "Net revenue", period: revenuePeriod, ytd: revenueYtd, kind: "subtotal" },
    ...cogs.map((row) => ({
      code: row.accountCode,
      label: row.accountName,
      period: -debitMovement(row),
      ytd: -debitClosing(row),
      depth: 1,
    })),
    { label: "Gross profit", period: grossProfitPeriod, ytd: grossProfitYtd, kind: "subtotal" },
    ...otherOperating.map((row) => ({
      code: row.accountCode,
      label: row.accountName,
      period: -debitMovement(row),
      ytd: -debitClosing(row),
      depth: 1,
    })),
    {
      label: "Operating profit before depreciation",
      period: grossProfitPeriod - opexPeriod,
      ytd: grossProfitYtd - opexYtd,
      kind: "subtotal",
    },
    ...depreciation.map((row) => ({
      code: row.accountCode,
      label: row.accountName,
      period: -debitMovement(row),
      ytd: -debitClosing(row),
      depth: 1,
    })),
    {
      label: "Net profit",
      period: grossProfitPeriod - opexPeriod - depreciationPeriod,
      ytd: grossProfitYtd - opexYtd - depreciationYtd,
      kind: "total",
    },
  ];

  return {
    lines,
    revenuePeriod,
    revenueYtd,
    grossProfitPeriod,
    grossProfitYtd,
    netProfitPeriod: grossProfitPeriod - opexPeriod - depreciationPeriod,
    netProfitYtd: grossProfitYtd - opexYtd - depreciationYtd,
  };
}

/* ------------------------------------------------------------------ */
/* Balance sheet                                                       */
/* ------------------------------------------------------------------ */

export interface BalanceSheet {
  lines: StatementLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanced: boolean;
}

const FIXED_ASSET_CODES = ["1510", "1520"];
const LONG_TERM_LIABILITY_CODES = ["2400"];

/** Current-period profit is presented inside equity, as it is before closing. */
export function buildBalanceSheet(rows: TrialBalanceRow[], netProfitYtd: number): BalanceSheet {
  const assets = byType(rows, "asset");
  const currentAssets = assets.filter((row) => !FIXED_ASSET_CODES.includes(row.accountCode));
  const fixedAssets = assets.filter((row) => FIXED_ASSET_CODES.includes(row.accountCode));
  const liabilities = byType(rows, "liability");
  const currentLiabilities = liabilities.filter(
    (row) => !LONG_TERM_LIABILITY_CODES.includes(row.accountCode),
  );
  const longTerm = liabilities.filter((row) => LONG_TERM_LIABILITY_CODES.includes(row.accountCode));
  const equity = byType(rows, "equity");

  const currentAssetsTotal = sum(currentAssets, debitClosing);
  const fixedAssetsTotal = sum(fixedAssets, debitClosing);
  const totalAssets = currentAssetsTotal + fixedAssetsTotal;
  const currentLiabilitiesTotal = sum(currentLiabilities, creditClosing);
  const longTermTotal = sum(longTerm, creditClosing);
  const totalLiabilities = currentLiabilitiesTotal + longTermTotal;
  const equityBrought = sum(equity, creditClosing);
  const totalEquity = equityBrought + netProfitYtd;

  const asLine = (row: TrialBalanceRow, pick: (r: TrialBalanceRow) => number): StatementLine => ({
    code: row.accountCode,
    label: row.accountName,
    period: pick(row),
    ytd: pick(row),
    depth: 1,
  });

  const lines: StatementLine[] = [
    { label: "Current assets", period: 0, ytd: 0, kind: "line" },
    ...currentAssets.map((row) => asLine(row, debitClosing)),
    { label: "Total current assets", period: currentAssetsTotal, ytd: currentAssetsTotal, kind: "subtotal" },
    { label: "Fixed assets", period: 0, ytd: 0, kind: "line" },
    ...fixedAssets.map((row) => asLine(row, debitClosing)),
    { label: "Total fixed assets", period: fixedAssetsTotal, ytd: fixedAssetsTotal, kind: "subtotal" },
    { label: "Total assets", period: totalAssets, ytd: totalAssets, kind: "total" },
    { label: "Current liabilities", period: 0, ytd: 0, kind: "line" },
    ...currentLiabilities.map((row) => asLine(row, creditClosing)),
    {
      label: "Total current liabilities",
      period: currentLiabilitiesTotal,
      ytd: currentLiabilitiesTotal,
      kind: "subtotal",
    },
    { label: "Long-term liabilities", period: 0, ytd: 0, kind: "line" },
    ...longTerm.map((row) => asLine(row, creditClosing)),
    { label: "Equity", period: 0, ytd: 0, kind: "line" },
    ...equity.map((row) => asLine(row, creditClosing)),
    { label: "Profit for the year", period: netProfitYtd, ytd: netProfitYtd, depth: 1 },
    { label: "Total equity", period: totalEquity, ytd: totalEquity, kind: "subtotal" },
    {
      label: "Total liabilities and equity",
      period: totalLiabilities + totalEquity,
      ytd: totalLiabilities + totalEquity,
      kind: "total",
    },
  ];

  return {
    lines,
    totalAssets,
    totalLiabilities,
    totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
  };
}

/* ------------------------------------------------------------------ */
/* Cash flow (indirect method, for the open period)                    */
/* ------------------------------------------------------------------ */

export interface CashFlow {
  lines: StatementLine[];
  operating: number;
  investing: number;
  financing: number;
  netMovement: number;
  openingCash: number;
  closingCash: number;
  ties: boolean;
}

const CASH_CODES = ["1110", "1115", "1120", "1125"];
const WORKING_CAPITAL = [
  { code: "1200", label: "Trade receivables", side: "asset" as const },
  { code: "1300", label: "Inventory", side: "asset" as const },
  { code: "1400", label: "Input VAT recoverable", side: "asset" as const },
  { code: "2100", label: "Trade payables", side: "liability" as const },
  { code: "2200", label: "Output VAT payable", side: "liability" as const },
  { code: "2300", label: "Accrued expenses", side: "liability" as const },
];

export function buildCashFlow(rows: TrialBalanceRow[], netProfitPeriod: number): CashFlow {
  const find = (code: string) => rows.find((row) => row.accountCode === code);

  const cashRows = byCodes(rows, CASH_CODES);
  const openingCash = sum(cashRows, (row) => toNumber(row.openingDebit) - toNumber(row.openingCredit));
  const closingCash = sum(cashRows, debitClosing);

  const depreciation = find("5500");
  const depreciationPeriod = depreciation ? debitMovement(depreciation) : 0;

  const workingCapitalLines: StatementLine[] = WORKING_CAPITAL.map((entry) => {
    const row = find(entry.code);
    if (!row) return { label: entry.label, period: 0, ytd: 0, depth: 1 };
    // Cash improves when an asset falls or a liability rises.
    const movement = entry.side === "asset" ? -debitMovement(row) : creditMovement(row);
    return { code: entry.code, label: entry.label, period: movement, ytd: movement, depth: 1 };
  });
  const workingCapital = workingCapitalLines.reduce((total, line) => total + line.period, 0);

  const operating = netProfitPeriod + depreciationPeriod + workingCapital;

  const fixedAssetAdditions = sum(byCodes(rows, FIXED_ASSET_CODES), (row) =>
    toNumber(row.periodDebit),
  );
  const investing = -fixedAssetAdditions;

  const borrowings = find("2400");
  const borrowingMovement = borrowings ? creditMovement(borrowings) : 0;
  const retained = find("3200");
  const distributions = retained ? creditMovement(retained) : 0;
  const financing = borrowingMovement + distributions;

  const netMovement = operating + investing + financing;

  const lines: StatementLine[] = [
    { label: "Net profit for the period", period: netProfitPeriod, ytd: netProfitPeriod, depth: 1 },
    { label: "Depreciation", period: depreciationPeriod, ytd: depreciationPeriod, depth: 1 },
    ...workingCapitalLines,
    { label: "Net cash from operating activities", period: operating, ytd: operating, kind: "subtotal" },
    { label: "Purchase of fixed assets", period: investing, ytd: investing, depth: 1 },
    { label: "Net cash used in investing activities", period: investing, ytd: investing, kind: "subtotal" },
    { label: "Movement in borrowings", period: borrowingMovement, ytd: borrowingMovement, depth: 1 },
    { label: "Distributions and equity movements", period: distributions, ytd: distributions, depth: 1 },
    { label: "Net cash from financing activities", period: financing, ytd: financing, kind: "subtotal" },
    { label: "Net movement in cash", period: netMovement, ytd: netMovement, kind: "total" },
    { label: "Opening cash and bank", period: openingCash, ytd: openingCash, depth: 1 },
    { label: "Closing cash and bank", period: openingCash + netMovement, ytd: closingCash, kind: "total" },
  ];

  return {
    lines,
    operating,
    investing,
    financing,
    netMovement,
    openingCash,
    closingCash,
    ties: Math.abs(openingCash + netMovement - closingCash) < 1,
  };
}
