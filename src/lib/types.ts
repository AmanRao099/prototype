/**
 * API contract types. These mirror the Django REST Framework serializers
 * planned for Phase 1 (see ERP proposal §3, §5). Money crosses the wire as a
 * decimal string so no precision is lost in JSON.
 */

export type Money = string | number;

export type DeliveryPhase = "mvp" | "limited" | "phase2";

export type StatusLevel = "good" | "warning" | "serious" | "critical" | "neutral";

export interface Company {
  id: string;
  name: string;
  legalName: string;
  branches: Branch[];
  baseCurrency: string;
  financialYears: FinancialYear[];
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface FinancialYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isLocked: boolean;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  initials: string;
}

export type PeriodKey = "mtd" | "last30" | "qtd" | "fytd";

export interface Kpi {
  key: string;
  label: string;
  value: Money;
  /** Percent change vs the comparable previous period. */
  deltaPct?: number;
  /** true when a rising value is good (sales); false when it is bad (payables). */
  riseIsGood?: boolean;
  caption?: string;
  href?: string;
  /** 8-12 points for the tile sparkline, oldest first. */
  trend?: number[];
}

export interface SeriesPoint {
  label: string;
  values: number[];
}

export interface TimeSeries {
  seriesNames: string[];
  points: SeriesPoint[];
  unit: "INR" | "QTY";
}

export interface AgeingBucket {
  label: string;
  receivable: number;
  payable: number;
}

export interface WarehouseStock {
  warehouseId: string;
  warehouse: string;
  stockValue: number;
  skuCount: number;
  utilisationPct: number;
}

export interface InventoryAlert {
  id: string;
  type: "low_stock" | "reorder" | "expiry" | "negative_stock" | "overstock" | "non_moving";
  level: StatusLevel;
  item: string;
  sku: string;
  warehouse: string;
  detail: string;
}

export interface ApprovalRequest {
  id: string;
  documentType: "Sales Invoice" | "Purchase Invoice" | "Payment Voucher" | "Stock Adjustment" | "Stock Transfer";
  reference: string;
  party: string;
  amount?: Money;
  requestedBy: string;
  requestedAt: string;
  step: string;
  level: StatusLevel;
}

export interface LedgerActivity {
  id: string;
  postedAt: string;
  reference: string;
  documentType: string;
  party: string;
  debit: Money;
  credit: Money;
  status: "posted" | "draft" | "pending_approval" | "reversed";
}

export interface PartyOutstanding {
  id: string;
  name: string;
  outstanding: Money;
  overdue: Money;
  creditLimit?: Money;
  oldestDays: number;
}

export interface StockMovementSummary {
  label: string;
  inward: number;
  outward: number;
}

export interface DashboardData {
  generatedAt: string;
  period: PeriodKey;
  kpis: Kpi[];
  salesVsPurchase: TimeSeries;
  ageing: AgeingBucket[];
  warehouses: WarehouseStock[];
  stockMovement: StockMovementSummary[];
  alerts: InventoryAlert[];
  approvals: ApprovalRequest[];
  activity: LedgerActivity[];
  topReceivables: PartyOutstanding[];
  vat: {
    outputVat: Money;
    inputVat: Money;
    netPayable: Money;
    periodLabel: string;
    returnDueOn: string;
  };
  trialBalance: {
    totalDebit: Money;
    totalCredit: Money;
    balanced: boolean;
    unpostedJournals: number;
  };
}

/* ------------------------------------------------------------------------- *
 * Accounting & Finance
 * Entities mirror the planned DRF serializers for the `accounting` app.
 * ------------------------------------------------------------------------- */

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  group: string;
  /** Depth in the account hierarchy, 0 for top-level groups. */
  level: number;
  isGroup: boolean;
  openingBalance: Money;
  balance: Money;
  /** "debit" or "credit" side of the closing balance. */
  side: "debit" | "credit";
  isActive: boolean;
  isBankOrCash?: boolean;
}

export type DocumentStatus =
  | "draft"
  | "pending_approval"
  | "posted"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "reversed";

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: Money;
  credit: Money;
  narration?: string;
  party?: string;
}

export interface JournalEntry {
  id: string;
  voucherNo: string;
  date: string;
  voucherType: string;
  sourceDocument?: string;
  narration: string;
  totalDebit: Money;
  totalCredit: Money;
  status: DocumentStatus;
  createdBy: string;
  postedBy?: string;
  lines: JournalLine[];
}

export interface LedgerRow {
  id: string;
  date: string;
  voucherNo: string;
  voucherType: string;
  narration: string;
  debit: Money;
  credit: Money;
  runningBalance: Money;
}

export interface Party {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  outstanding: Money;
  overdue: Money;
  creditLimit?: Money;
  creditDays: number;
  lastTransactionOn: string;
  isActive: boolean;
}

export interface SalesInvoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  customer: string;
  customerId: string;
  invoiceType: "tax" | "cash" | "proforma" | "credit_note";
  subtotal: Money;
  discount: Money;
  vat: Money;
  total: Money;
  received: Money;
  balance: Money;
  status: DocumentStatus;
  salesperson: string;
}

export interface PurchaseInvoice {
  id: string;
  number: string;
  supplierRef: string;
  date: string;
  dueDate: string;
  supplier: string;
  supplierId: string;
  invoiceType: "tax" | "cash" | "debit_note";
  subtotal: Money;
  additionalCharges: Money;
  vat: Money;
  total: Money;
  paid: Money;
  balance: Money;
  status: DocumentStatus;
  grnReference?: string;
}

export interface PaymentDocument {
  id: string;
  number: string;
  date: string;
  party: string;
  mode: "cash" | "bank_transfer" | "cheque" | "card";
  instrumentRef?: string;
  account: string;
  amount: Money;
  allocated: Money;
  unallocated: Money;
  status: DocumentStatus;
}

export interface CashBankAccount {
  id: string;
  name: string;
  kind: "bank" | "cash" | "petty_cash";
  institution?: string;
  accountNumberMasked?: string;
  balance: Money;
  unreconciledCount: number;
  lastReconciledOn?: string;
}

export interface CashBankEntry {
  id: string;
  date: string;
  reference: string;
  entryType: "receipt" | "payment" | "transfer" | "charge";
  particulars: string;
  inflow: Money;
  outflow: Money;
  runningBalance: Money;
  reconciled: boolean;
}

export interface ExpenseVoucher {
  id: string;
  number: string;
  date: string;
  category: string;
  department: string;
  paidFrom: string;
  amount: Money;
  vat: Money;
  total: Money;
  status: DocumentStatus;
  recurring: boolean;
  attachments: number;
  requestedBy: string;
}

export interface VatBox {
  code: string;
  label: string;
  amount: Money;
  vatAmount: Money;
  treatment: "standard" | "zero_rated" | "exempt" | "reverse_charge";
}

export interface VatReturnPeriod {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  outputVat: Money;
  inputVat: Money;
  netPayable: Money;
  status: "open" | "ready" | "filed";
}

export interface TaxCode {
  code: string;
  label: string;
  ratePct: number;
  treatment: VatBox["treatment"];
  appliesTo: string;
  isActive: boolean;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  type: AccountType;
  openingDebit: Money;
  openingCredit: Money;
  periodDebit: Money;
  periodCredit: Money;
  closingDebit: Money;
  closingCredit: Money;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: "Financial" | "Receivable & Payable" | "Registers" | "Tax";
  phase: DeliveryPhase;
  lastRunOn?: string;
  href?: string;
}

/* ------------------------------------------------------------------------- *
 * Inventory & Stock
 * Entities mirror the planned DRF serializers for the `inventory` app.
 * ------------------------------------------------------------------------- */

export type TrackingMode = "none" | "batch" | "serial";

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  /** Alternate unit and how many base units it holds, e.g. BOX = 12 PCS. */
  altUnit?: string;
  conversion?: number;
  barcode: string;
  purchasePrice: Money;
  sellingPrice: Money;
  taxCode: string;
  tracking: TrackingMode;
  reorderLevel: number;
  onHand: number;
  reserved: number;
  available: number;
  stockValue: Money;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  kind: "main" | "depot" | "bonded" | "retail" | "transit";
  location: string;
  binCount: number;
  skuCount: number;
  stockValue: Money;
  utilisationPct: number;
  manager: string;
  isActive: boolean;
}

export type MovementStatus =
  | "draft"
  | "pending_approval"
  | "posted"
  | "in_transit"
  | "received"
  | "cancelled";

export interface GoodsReceipt {
  id: string;
  number: string;
  date: string;
  sourceType: "purchase_receipt" | "direct_entry" | "opening_stock" | "sales_return";
  reference?: string;
  party: string;
  warehouse: string;
  lineCount: number;
  quantity: number;
  value: Money;
  tracked: TrackingMode;
  status: MovementStatus;
  receivedBy: string;
}

export interface StockIssue {
  id: string;
  number: string;
  date: string;
  issueType: "sales_delivery" | "internal_consumption" | "damaged" | "sample";
  reference?: string;
  party: string;
  warehouse: string;
  lineCount: number;
  quantity: number;
  value: Money;
  status: MovementStatus;
  issuedBy: string;
}

export interface StockTransferDoc {
  id: string;
  number: string;
  date: string;
  fromWarehouse: string;
  toWarehouse: string;
  lineCount: number;
  quantity: number;
  value: Money;
  status: MovementStatus;
  dispatchedOn?: string;
  receivedOn?: string;
  requestedBy: string;
}

export interface StockAdjustmentDoc {
  id: string;
  number: string;
  date: string;
  warehouse: string;
  reason: "damage" | "expiry" | "physical_count" | "shortage" | "reclassification";
  direction: "increase" | "decrease";
  lineCount: number;
  quantity: number;
  value: Money;
  status: MovementStatus;
  requestedBy: string;
  approvedBy?: string;
}

export interface ValuationRow {
  id: string;
  sku: string;
  item: string;
  warehouse: string;
  quantity: number;
  unit: string;
  weightedAvgRate: Money;
  fifoRate: Money;
  landedCost: Money;
  value: Money;
  lastMovementOn: string;
}

export interface StockLedgerRow {
  id: string;
  date: string;
  reference: string;
  movementType: string;
  item: string;
  sku: string;
  warehouse: string;
  inQty: number;
  outQty: number;
  balanceQty: number;
  rate: Money;
  value: Money;
}

/* ------------------------------------------------------------------------- *
 * Common System
 * Entities mirror the planned DRF serializers for the `common` app.
 * ------------------------------------------------------------------------- */

export type UserStatus = "active" | "invited" | "suspended";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  branches: string[];
  status: UserStatus;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type PermissionAction = "view" | "create" | "edit" | "approve" | "delete";

export interface RolePermission {
  module: string;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  scope: "company" | "branch";
  isSystem: boolean;
  permissions: RolePermission[];
}

export interface ApprovalRule {
  id: string;
  documentType: string;
  condition: string;
  levels: Array<{ level: number; approver: string }>;
  delegation?: string;
  isActive: boolean;
  phase: DeliveryPhase;
}

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "post"
  | "approve"
  | "login"
  | "export"
  | "settings";

export interface AuditEvent {
  id: string;
  at: string;
  user: string;
  action: AuditAction;
  module: string;
  entity: string;
  reference: string;
  summary: string;
  ipAddress: string;
  changedFields: number;
}

export interface DocumentFile {
  id: string;
  name: string;
  fileType: "pdf" | "image" | "spreadsheet" | "document";
  sizeKb: number;
  module: string;
  linkedTo: string;
  uploadedBy: string;
  uploadedAt: string;
  access: "all_users" | "finance_only" | "managers" | "restricted";
}

export interface NotificationItem {
  id: string;
  at: string;
  channel: "in_app" | "email";
  category: "payment_due" | "low_stock" | "expiry" | "approval" | "system";
  title: string;
  body: string;
  level: StatusLevel;
  read: boolean;
  audience: string;
}

export interface NumberingSeries {
  id: string;
  documentType: string;
  prefix: string;
  nextNumber: number;
  format: string;
  resetRule: "never" | "yearly" | "monthly";
  branchSpecific: boolean;
}

export interface CurrencySetting {
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  rateToBase: number;
  updatedOn: string;
}

export interface ImportTemplate {
  id: string;
  name: string;
  module: string;
  columns: number;
  description: string;
  phase: DeliveryPhase;
}

export interface ImportJob {
  id: string;
  template: string;
  fileName: string;
  rows: number;
  imported: number;
  failed: number;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  runBy: string;
}

export interface CompanyEntity {
  id: string;
  name: string;
  legalName: string;
  baseCurrency: string;
  branchCount: number;
  userCount: number;
  stockValue: Money;
  revenueYtd: Money;
  status: "live" | "setup" | "archived";
}

export interface BackupRecord {
  id: string;
  at: string;
  kind: "full" | "incremental" | "snapshot";
  sizeMb: number;
  destination: string;
  status: "completed" | "failed" | "running";
  retentionDays: number;
  restoreTestedOn?: string;
}

export interface SecurityControl {
  id: string;
  name: string;
  detail: string;
  state: "enforced" | "partial" | "not_configured";
  owner: string;
}
