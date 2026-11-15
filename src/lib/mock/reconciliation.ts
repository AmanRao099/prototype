import type { ReconciliationStatement } from "@/lib/types";

/**
 * Imported bank statement for HDFC Bank - Current 4411, November 2026.
 *
 * Built to exercise the real reconciliation cases rather than a clean match:
 *   - eight lines that match posted book entries, two of them only by amount
 *     and date because the narration differs;
 *   - two statement lines with nothing in the books (interest credit and a
 *     standing instruction) which have to be posted before the period closes;
 *   - two book payments the bank has not processed (an uncleared cheque and a
 *     transfer still awaiting approval), which stay as outstanding items.
 *
 * Statement closing 74,16,040 reconciles to the book balance 62,84,200 once
 * the outstanding cheques are deducted and the two unbooked items are posted.
 */
export const MOCK_STATEMENT: ReconciliationStatement = {
  id: "stmt-2611",
  accountId: "cb-01",
  accountName: "HDFC Bank - Current 4411",
  periodLabel: "01 - 15 November 2026",
  openingBalance: 48_10_000,
  closingBalance: 74_16_040,
  importedOn: "2026-11-15T07:05:00+05:30",
  lines: [
    {
      id: "bsl-01",
      date: "2026-11-04",
      description: "NEFT DR PINNACLE PACKAGING",
      reference: "N04112026/4471",
      amount: -42_000,
      runningBalance: 47_68_000,
      suggestedEntryId: "cbe-02",
      suggestionBasis: "amount_and_date",
    },
    {
      id: "bsl-02",
      date: "2026-11-05",
      description: "NEFT CR NORTHLINE RETAIL",
      reference: "NEFT-771220",
      amount: 6_42_000,
      runningBalance: 54_10_000,
      suggestedEntryId: "cbe-03",
      suggestionBasis: "reference",
    },
    {
      id: "bsl-03",
      date: "2026-11-09",
      description: "RTGS DR VERTEX POLYMERS",
      reference: "RTGS-118840",
      amount: -7_00_000,
      runningBalance: 47_10_000,
      suggestedEntryId: "cbe-04",
      suggestionBasis: "reference",
    },
    {
      id: "bsl-04",
      date: "2026-11-11",
      description: "CHQ CR 884120 CLEARING",
      reference: "884120",
      amount: 12_40_000,
      runningBalance: 59_50_000,
      suggestedEntryId: "cbe-05",
      suggestionBasis: "reference",
    },
    {
      id: "bsl-05",
      date: "2026-11-12",
      description: "FUND TRANSFER FROM 7702",
      reference: "FT/26/0118",
      amount: 10_00_000,
      runningBalance: 69_50_000,
      suggestedEntryId: "cbe-06",
      suggestionBasis: "reference",
    },
    {
      id: "bsl-06",
      date: "2026-11-13",
      description: "ACH DR PROPERTY RENT NOV",
      reference: "ACH-5521",
      amount: -2_62_500,
      runningBalance: 66_87_500,
      suggestedEntryId: "cbe-08",
      suggestionBasis: "amount_and_date",
    },
    {
      id: "bsl-07",
      date: "2026-11-14",
      description: "BANK CHARGES AND RTGS FEES",
      reference: "CHG-1114",
      amount: -3_100,
      runningBalance: 66_84_400,
      suggestedEntryId: "cbe-09",
      suggestionBasis: "amount",
    },
    {
      id: "bsl-08",
      date: "2026-11-14",
      description: "SI DR INSURANCE PREMIUM",
      reference: "SI-88213",
      amount: -12_000,
      runningBalance: 66_72_400,
    },
    {
      id: "bsl-09",
      date: "2026-11-15",
      description: "RTGS CR KINETIC INFRA PROJECTS",
      reference: "RTGS-220934",
      amount: 15_00_000,
      runningBalance: 81_72_400,
      suggestedEntryId: "cbe-10",
      suggestionBasis: "reference",
    },
    {
      id: "bsl-10",
      date: "2026-11-15",
      description: "CHQ DR 884102 PRESENTED",
      reference: "884102",
      amount: -7_58_200,
      runningBalance: 74_14_200,
      suggestedEntryId: "cbe-12",
      suggestionBasis: "amount_and_date",
    },
    {
      id: "bsl-11",
      date: "2026-11-15",
      description: "INTEREST CREDIT QUARTER",
      reference: "INT-Q3",
      amount: 1_840,
      runningBalance: 74_16_040,
    },
  ],
};
