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
import {
  MOCK_ADJUSTMENTS,
  MOCK_GOODS_RECEIPTS,
  MOCK_INVENTORY_REPORTS,
  MOCK_ITEMS,
  MOCK_STOCK_ISSUES,
  MOCK_STOCK_LEDGER,
  MOCK_TRANSFERS,
  MOCK_VALUATION,
  MOCK_WAREHOUSES,
} from "@/lib/mock/inventory";
import {
  MOCK_APPROVAL_RULES,
  MOCK_AUDIT_EVENTS,
  MOCK_BACKUPS,
  MOCK_COMPANIES,
  MOCK_CURRENCIES,
  MOCK_DOCUMENTS,
  MOCK_IMPORT_JOBS,
  MOCK_IMPORT_TEMPLATES,
  MOCK_NOTIFICATIONS,
  MOCK_NUMBERING,
  MOCK_ROLES,
  MOCK_SECURITY_CONTROLS,
  MOCK_USERS,
} from "@/lib/mock/system";
import type {
  Account,
  ApprovalRule,
  AuditEvent,
  BackupRecord,
  CashBankAccount,
  CashBankEntry,
  Company,
  CompanyEntity,
  CurrencySetting,
  DashboardData,
  DocumentFile,
  ExpenseVoucher,
  GoodsReceipt,
  ImportJob,
  ImportTemplate,
  InventoryAlert,
  Item,
  NotificationItem,
  NumberingSeries,
  JournalEntry,
  LedgerRow,
  Party,
  PaymentDocument,
  PeriodKey,
  PurchaseInvoice,
  ReportDefinition,
  Role,
  SalesInvoice,
  SecurityControl,
  SessionUser,
  StockAdjustmentDoc,
  StockIssue,
  StockLedgerRow,
  StockTransferDoc,
  SystemUser,
  TaxCode,
  TrialBalanceRow,
  ValuationRow,
  VatBox,
  VatReturnPeriod,
  Warehouse,
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

/* ------------------------------------------------------------------------- *
 * Inventory & Stock
 *
 * Planned endpoints (Django REST Framework, `inventory` app):
 *   GET /api/inventory/items/           GET /api/inventory/warehouses/
 *   GET /api/inventory/goods-receipts/  GET /api/inventory/issues/
 *   GET /api/inventory/transfers/       GET /api/inventory/adjustments/
 *   GET /api/inventory/valuation/       GET /api/inventory/ledger/
 *   GET /api/inventory/alerts/          GET /api/inventory/reports/
 * ------------------------------------------------------------------------- */

export async function getItems(): Promise<Item[]> {
  if (USING_MOCK_DATA) return MOCK_ITEMS;
  return request<Item[]>("/api/inventory/items/");
}

export async function getWarehouses(): Promise<Warehouse[]> {
  if (USING_MOCK_DATA) return MOCK_WAREHOUSES;
  return request<Warehouse[]>("/api/inventory/warehouses/");
}

export async function getGoodsReceipts(): Promise<GoodsReceipt[]> {
  if (USING_MOCK_DATA) return MOCK_GOODS_RECEIPTS;
  return request<GoodsReceipt[]>("/api/inventory/goods-receipts/");
}

export async function getStockIssues(): Promise<StockIssue[]> {
  if (USING_MOCK_DATA) return MOCK_STOCK_ISSUES;
  return request<StockIssue[]>("/api/inventory/issues/");
}

export async function getStockTransfers(): Promise<StockTransferDoc[]> {
  if (USING_MOCK_DATA) return MOCK_TRANSFERS;
  return request<StockTransferDoc[]>("/api/inventory/transfers/");
}

export async function getStockAdjustments(): Promise<StockAdjustmentDoc[]> {
  if (USING_MOCK_DATA) return MOCK_ADJUSTMENTS;
  return request<StockAdjustmentDoc[]>("/api/inventory/adjustments/");
}

export async function getValuation(): Promise<ValuationRow[]> {
  if (USING_MOCK_DATA) return MOCK_VALUATION;
  return request<ValuationRow[]>("/api/inventory/valuation/");
}

export async function getStockLedger(): Promise<StockLedgerRow[]> {
  if (USING_MOCK_DATA) return MOCK_STOCK_LEDGER;
  return request<StockLedgerRow[]>("/api/inventory/ledger/");
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  if (USING_MOCK_DATA) return (await getDashboard("mtd")).alerts;
  return request<InventoryAlert[]>("/api/inventory/alerts/");
}

export async function getInventoryReports(): Promise<typeof MOCK_INVENTORY_REPORTS> {
  if (USING_MOCK_DATA) return MOCK_INVENTORY_REPORTS;
  return request<typeof MOCK_INVENTORY_REPORTS>("/api/inventory/reports/");
}

/* ------------------------------------------------------------------------- *
 * Common System
 *
 * Planned endpoints (Django REST Framework, `common` app):
 *   GET /api/common/users/            GET /api/common/roles/
 *   GET /api/common/approval-rules/   GET /api/common/audit-events/
 *   GET /api/common/documents/        GET /api/common/notifications/
 *   GET /api/common/settings/         GET /api/common/import-export/
 *   GET /api/common/companies/        GET /api/common/backups/
 * ------------------------------------------------------------------------- */

export async function getUsers(): Promise<SystemUser[]> {
  if (USING_MOCK_DATA) return MOCK_USERS;
  return request<SystemUser[]>("/api/common/users/");
}

export async function getRoles(): Promise<Role[]> {
  if (USING_MOCK_DATA) return MOCK_ROLES;
  return request<Role[]>("/api/common/roles/");
}

export async function getApprovalRules(): Promise<ApprovalRule[]> {
  if (USING_MOCK_DATA) return MOCK_APPROVAL_RULES;
  return request<ApprovalRule[]>("/api/common/approval-rules/");
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  if (USING_MOCK_DATA) return MOCK_AUDIT_EVENTS;
  return request<AuditEvent[]>("/api/common/audit-events/");
}

export async function getDocuments(): Promise<DocumentFile[]> {
  if (USING_MOCK_DATA) return MOCK_DOCUMENTS;
  return request<DocumentFile[]>("/api/common/documents/");
}

export async function getNotifications(): Promise<NotificationItem[]> {
  if (USING_MOCK_DATA) return MOCK_NOTIFICATIONS;
  return request<NotificationItem[]>("/api/common/notifications/");
}

export async function getSystemSettings(): Promise<{
  numbering: NumberingSeries[];
  currencies: CurrencySetting[];
}> {
  if (USING_MOCK_DATA) return { numbering: MOCK_NUMBERING, currencies: MOCK_CURRENCIES };
  return request<{ numbering: NumberingSeries[]; currencies: CurrencySetting[] }>(
    "/api/common/settings/",
  );
}

export async function getImportExport(): Promise<{
  templates: ImportTemplate[];
  jobs: ImportJob[];
}> {
  if (USING_MOCK_DATA) return { templates: MOCK_IMPORT_TEMPLATES, jobs: MOCK_IMPORT_JOBS };
  return request<{ templates: ImportTemplate[]; jobs: ImportJob[] }>("/api/common/import-export/");
}

export async function getCompanies(): Promise<CompanyEntity[]> {
  if (USING_MOCK_DATA) return MOCK_COMPANIES;
  return request<CompanyEntity[]>("/api/common/companies/");
}

export async function getBackups(): Promise<{
  backups: BackupRecord[];
  controls: SecurityControl[];
}> {
  if (USING_MOCK_DATA) return { backups: MOCK_BACKUPS, controls: MOCK_SECURITY_CONTROLS };
  return request<{ backups: BackupRecord[]; controls: SecurityControl[] }>("/api/common/backups/");
}
