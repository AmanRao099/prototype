import { APP_CONFIG } from "@/lib/config";
import { getMockDashboard } from "@/lib/mock/dashboard";
import { MOCK_COMPANY, MOCK_USER } from "@/lib/mock/org";
import {
  MOCK_ACCOUNTS,
  MOCK_CASH_BANK_ACCOUNTS,
  MOCK_CASH_BANK_ENTRIES,
  MOCK_CUSTOMERS,
  MOCK_EXPENSES,
  MOCK_JOURNALS,
  MOCK_LEDGER,
  MOCK_PAYMENTS,
  MOCK_PURCHASE_INVOICES,
  MOCK_RECEIPTS,
  MOCK_REPORTS,
  MOCK_SALES_INVOICES,
  MOCK_SUPPLIERS,
  MOCK_TAX_CODES,
  MOCK_TRIAL_BALANCE,
  MOCK_VAT_BOXES,
  MOCK_VAT_PERIODS,
} from "@/lib/mock/accounting";
import type {
  Account,
  CashBankAccount,
  CashBankEntry,
  Company,
  DashboardData,
  ExpenseVoucher,
  JournalEntry,
  LedgerRow,
  Party,
  PaymentDocument,
  PeriodKey,
  PurchaseInvoice,
  ReportDefinition,
  SalesInvoice,
  SessionUser,
  TaxCode,
  TrialBalanceRow,
  VatBox,
  VatReturnPeriod,
} from "@/lib/types";

/**
 * Thin data-access layer.
 *
 * Phase 1 backend endpoints (Django REST Framework, documented via
 * drf-spectacular):
 *   GET /api/common/session/                  -> { user, company }
 *   GET /api/reporting/dashboard/?period=mtd  -> DashboardData
 *
 * While NEXT_PUBLIC_API_BASE_URL is unset the UI serves typed mock data, so
 * screens can be reviewed before the services exist. No component imports mock
 * data directly - swapping the source happens here only.
 */

export const USING_MOCK_DATA = APP_CONFIG.apiBaseUrl === "";

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    // Dashboard figures are operational; never serve a stale cached payload.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(`${init?.method ?? "GET"} ${path} failed`, response.status);
  }

  return (await response.json()) as T;
}

export async function getDashboard(period: PeriodKey = "mtd"): Promise<DashboardData> {
  if (USING_MOCK_DATA) return getMockDashboard(period);
  return request<DashboardData>(`/api/reporting/dashboard/?period=${period}`);
}

export async function getSession(): Promise<{ user: SessionUser; company: Company }> {
  if (USING_MOCK_DATA) return { user: MOCK_USER, company: MOCK_COMPANY };
  return request<{ user: SessionUser; company: Company }>("/api/common/session/");
}

export { ApiError };

/* ------------------------------------------------------------------------- *
 * Accounting & Finance
 *
 * Planned endpoints (Django REST Framework, `accounting` app):
 *   GET /api/accounting/accounts/            GET /api/accounting/journals/
 *   GET /api/accounting/ledger/?account=     GET /api/accounting/customers/
 *   GET /api/accounting/suppliers/           GET /api/accounting/sales-invoices/
 *   GET /api/accounting/purchase-invoices/   GET /api/accounting/receipts/
 *   GET /api/accounting/payments/            GET /api/accounting/cash-bank/accounts/
 *   GET /api/accounting/cash-bank/entries/   GET /api/accounting/expenses/
 *   GET /api/accounting/tax/return/          GET /api/accounting/reports/
 * ------------------------------------------------------------------------- */

export async function getAccounts(): Promise<Account[]> {
  if (USING_MOCK_DATA) return MOCK_ACCOUNTS;
  return request<Account[]>("/api/accounting/accounts/");
}

export async function getJournals(): Promise<JournalEntry[]> {
  if (USING_MOCK_DATA) return MOCK_JOURNALS;
  return request<JournalEntry[]>("/api/accounting/journals/");
}

export async function getLedger(accountCode: string): Promise<LedgerRow[]> {
  if (USING_MOCK_DATA) return MOCK_LEDGER;
  return request<LedgerRow[]>(`/api/accounting/ledger/?account=${accountCode}`);
}

export async function getCustomers(): Promise<Party[]> {
  if (USING_MOCK_DATA) return MOCK_CUSTOMERS;
  return request<Party[]>("/api/accounting/customers/");
}

export async function getSuppliers(): Promise<Party[]> {
  if (USING_MOCK_DATA) return MOCK_SUPPLIERS;
  return request<Party[]>("/api/accounting/suppliers/");
}

export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  if (USING_MOCK_DATA) return MOCK_SALES_INVOICES;
  return request<SalesInvoice[]>("/api/accounting/sales-invoices/");
}

export async function getPurchaseInvoices(): Promise<PurchaseInvoice[]> {
  if (USING_MOCK_DATA) return MOCK_PURCHASE_INVOICES;
  return request<PurchaseInvoice[]>("/api/accounting/purchase-invoices/");
}

export async function getReceipts(): Promise<PaymentDocument[]> {
  if (USING_MOCK_DATA) return MOCK_RECEIPTS;
  return request<PaymentDocument[]>("/api/accounting/receipts/");
}

export async function getPayments(): Promise<PaymentDocument[]> {
  if (USING_MOCK_DATA) return MOCK_PAYMENTS;
  return request<PaymentDocument[]>("/api/accounting/payments/");
}

export async function getCashBankAccounts(): Promise<CashBankAccount[]> {
  if (USING_MOCK_DATA) return MOCK_CASH_BANK_ACCOUNTS;
  return request<CashBankAccount[]>("/api/accounting/cash-bank/accounts/");
}

export async function getCashBankEntries(accountId: string): Promise<CashBankEntry[]> {
  if (USING_MOCK_DATA) return MOCK_CASH_BANK_ENTRIES;
  return request<CashBankEntry[]>(`/api/accounting/cash-bank/entries/?account=${accountId}`);
}

export async function getExpenses(): Promise<ExpenseVoucher[]> {
  if (USING_MOCK_DATA) return MOCK_EXPENSES;
  return request<ExpenseVoucher[]>("/api/accounting/expenses/");
}

export async function getVatReturn(): Promise<{
  boxes: VatBox[];
  periods: VatReturnPeriod[];
  codes: TaxCode[];
}> {
  if (USING_MOCK_DATA) {
    return { boxes: MOCK_VAT_BOXES, periods: MOCK_VAT_PERIODS, codes: MOCK_TAX_CODES };
  }
  return request<{ boxes: VatBox[]; periods: VatReturnPeriod[]; codes: TaxCode[] }>(
    "/api/accounting/tax/return/",
  );
}

export async function getTrialBalance(): Promise<TrialBalanceRow[]> {
  if (USING_MOCK_DATA) return MOCK_TRIAL_BALANCE;
  return request<TrialBalanceRow[]>("/api/accounting/reports/trial-balance/");
}

export async function getReportCatalogue(): Promise<ReportDefinition[]> {
  if (USING_MOCK_DATA) return MOCK_REPORTS;
  return request<ReportDefinition[]>("/api/accounting/reports/");
}
