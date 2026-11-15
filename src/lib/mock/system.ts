import type {
  ApprovalRule,
  AuditEvent,
  BackupRecord,
  CompanyEntity,
  CurrencySetting,
  DocumentFile,
  ImportJob,
  ImportTemplate,
  NotificationItem,
  NumberingSeries,
  Role,
  SecurityControl,
  SystemUser,
} from "@/lib/types";

/** Mock payloads for the Common System module screens. */

export const MOCK_ROLES: Role[] = [
  {
    id: "rl-01",
    name: "Finance Controller",
    description: "Full accounting access, posting and approval rights, no user administration.",
    userCount: 2,
    scope: "company",
    isSystem: false,
    permissions: [
      { module: "Accounting", actions: ["view", "create", "edit", "approve"] },
      { module: "Inventory", actions: ["view"] },
      { module: "Reporting", actions: ["view", "create"] },
      { module: "System", actions: ["view"] },
    ],
  },
  {
    id: "rl-02",
    name: "Accountant",
    description: "Day-to-day posting of invoices, receipts and payments without approval rights.",
    userCount: 4,
    scope: "branch",
    isSystem: false,
    permissions: [
      { module: "Accounting", actions: ["view", "create", "edit"] },
      { module: "Reporting", actions: ["view"] },
    ],
  },
  {
    id: "rl-03",
    name: "Warehouse Manager",
    description: "Receipts, issues, transfers and counts for the assigned warehouses.",
    userCount: 3,
    scope: "branch",
    isSystem: false,
    permissions: [
      { module: "Inventory", actions: ["view", "create", "edit", "approve"] },
      { module: "Reporting", actions: ["view"] },
    ],
  },
  {
    id: "rl-04",
    name: "Sales Executive",
    description: "Raises invoices and delivery notes; cannot post payments or edit master data.",
    userCount: 5,
    scope: "branch",
    isSystem: false,
    permissions: [
      { module: "Accounting", actions: ["view", "create"] },
      { module: "Inventory", actions: ["view"] },
    ],
  },
  {
    id: "rl-05",
    name: "Auditor",
    description: "Read-only access to every module including the audit trail and reports.",
    userCount: 1,
    scope: "company",
    isSystem: true,
    permissions: [
      { module: "Accounting", actions: ["view"] },
      { module: "Inventory", actions: ["view"] },
      { module: "Reporting", actions: ["view"] },
      { module: "System", actions: ["view"] },
    ],
  },
  {
    id: "rl-06",
    name: "System Administrator",
    description: "User and role administration, configuration, backups and integrations.",
    userCount: 1,
    scope: "company",
    isSystem: true,
    permissions: [
      { module: "Accounting", actions: ["view"] },
      { module: "Inventory", actions: ["view"] },
      { module: "Reporting", actions: ["view"] },
      { module: "System", actions: ["view", "create", "edit", "delete"] },
    ],
  },
];

export const MOCK_USERS: SystemUser[] = [
  { id: "us-01", name: "R. Menon", email: "finance.controller@example.com", roleId: "rl-01", roleName: "Finance Controller", branches: ["Head Office"], status: "active", mfaEnabled: true, lastLoginAt: "2026-11-15T09:12:00+05:30", createdAt: "2026-04-02" },
  { id: "us-02", name: "A. Fernandes", email: "a.fernandes@example.com", roleId: "rl-02", roleName: "Accountant", branches: ["Head Office"], status: "active", mfaEnabled: true, lastLoginAt: "2026-11-15T08:46:00+05:30", createdAt: "2026-04-02" },
  { id: "us-03", name: "N. Shaikh", email: "n.shaikh@example.com", roleId: "rl-02", roleName: "Accountant", branches: ["Head Office", "Port Branch"], status: "active", mfaEnabled: false, lastLoginAt: "2026-11-15T07:40:00+05:30", createdAt: "2026-05-11" },
  { id: "us-04", name: "S. Iyer", email: "s.iyer@example.com", roleId: "rl-03", roleName: "Warehouse Manager", branches: ["Head Office"], status: "active", mfaEnabled: true, lastLoginAt: "2026-11-15T08:05:00+05:30", createdAt: "2026-04-18" },
  { id: "us-05", name: "M. Qureshi", email: "m.qureshi@example.com", roleId: "rl-03", roleName: "Warehouse Manager", branches: ["North Depot"], status: "active", mfaEnabled: false, lastLoginAt: "2026-11-14T18:22:00+05:30", createdAt: "2026-04-18" },
  { id: "us-06", name: "F. Dias", email: "f.dias@example.com", roleId: "rl-03", roleName: "Warehouse Manager", branches: ["Port Branch"], status: "active", mfaEnabled: true, lastLoginAt: "2026-11-14T16:10:00+05:30", createdAt: "2026-06-01" },
  { id: "us-07", name: "D. Rao", email: "d.rao@example.com", roleId: "rl-04", roleName: "Sales Executive", branches: ["Head Office"], status: "active", mfaEnabled: false, lastLoginAt: "2026-11-15T09:28:00+05:30", createdAt: "2026-04-25" },
  { id: "us-08", name: "S. Kapoor", email: "s.kapoor@example.com", roleId: "rl-04", roleName: "Sales Executive", branches: ["North Depot"], status: "active", mfaEnabled: false, lastLoginAt: "2026-11-14T17:55:00+05:30", createdAt: "2026-05-04" },
  { id: "us-09", name: "H. Mathew", email: "h.mathew@example.com", roleId: "rl-04", roleName: "Sales Executive", branches: ["Head Office"], status: "suspended", mfaEnabled: false, lastLoginAt: "2026-10-28T11:02:00+05:30", createdAt: "2026-05-04" },
  { id: "us-10", name: "External Auditor", email: "audit@example.com", roleId: "rl-05", roleName: "Auditor", branches: ["Head Office", "North Depot", "Port Branch"], status: "invited", mfaEnabled: false, createdAt: "2026-11-12" },
  { id: "us-11", name: "IT Administrator", email: "it.admin@example.com", roleId: "rl-06", roleName: "System Administrator", branches: ["Head Office"], status: "active", mfaEnabled: true, lastLoginAt: "2026-11-13T20:14:00+05:30", createdAt: "2026-04-01" },
];

export const MOCK_APPROVAL_RULES: ApprovalRule[] = [
  { id: "ar-01", documentType: "Sales Invoice", condition: "Credit limit exceeded", levels: [{ level: 1, approver: "Finance Controller" }], isActive: true, phase: "mvp" },
  { id: "ar-02", documentType: "Purchase Invoice", condition: "Value above 10,00,000", levels: [{ level: 1, approver: "Purchase Head" }, { level: 2, approver: "Finance Controller" }], isActive: true, phase: "mvp" },
  { id: "ar-03", documentType: "Payment Voucher", condition: "Any bank payment", levels: [{ level: 1, approver: "Accountant" }, { level: 2, approver: "Finance Controller" }], isActive: true, phase: "mvp" },
  { id: "ar-04", documentType: "Stock Adjustment", condition: "Value above 50,000", levels: [{ level: 1, approver: "Warehouse Manager" }, { level: 2, approver: "Finance Controller" }], isActive: true, phase: "mvp" },
  { id: "ar-05", documentType: "Stock Transfer", condition: "Between branches", levels: [{ level: 1, approver: "Warehouse Manager" }], isActive: true, phase: "mvp" },
  { id: "ar-06", documentType: "Expense Voucher", condition: "Above department budget", levels: [{ level: 1, approver: "Department Head" }, { level: 2, approver: "Finance Controller" }], delegation: "Delegates to Accountant when out of office", isActive: false, phase: "phase2" },
  { id: "ar-07", documentType: "Credit Note", condition: "Above 1,00,000", levels: [{ level: 1, approver: "Finance Controller" }], delegation: "No delegation configured", isActive: false, phase: "phase2" },
];

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  { id: "ae-01", at: "2026-11-15T09:40:00+05:30", user: "D. Rao", action: "create", module: "Accounting", entity: "Sales Invoice", reference: "SI/26/4418", summary: "Invoice raised for Oceanic Builders", ipAddress: "103.21.58.14", changedFields: 14 },
  { id: "ae-02", at: "2026-11-15T09:28:00+05:30", user: "R. Menon", action: "post", module: "Accounting", entity: "Journal Entry", reference: "JV/26/0812", summary: "Posted balanced journal, Dr 8,64,200 / Cr 8,64,200", ipAddress: "103.21.58.02", changedFields: 3 },
  { id: "ae-03", at: "2026-11-15T09:06:00+05:30", user: "S. Iyer", action: "create", module: "Inventory", entity: "Goods Receipt", reference: "GRN/26/1872", summary: "Received 2,380 units into Central Store", ipAddress: "103.21.58.77", changedFields: 9 },
  { id: "ae-04", at: "2026-11-15T08:52:00+05:30", user: "A. Fernandes", action: "post", module: "Accounting", entity: "Customer Receipt", reference: "RCT/26/3301", summary: "Receipt allocated against two invoices", ipAddress: "103.21.58.21", changedFields: 5 },
  { id: "ae-05", at: "2026-11-15T08:31:00+05:30", user: "S. Iyer", action: "update", module: "Inventory", entity: "Stock Adjustment", reference: "ADJ/26/0094", summary: "Reason changed from shortage to damage", ipAddress: "103.21.58.77", changedFields: 2 },
  { id: "ae-06", at: "2026-11-15T08:12:00+05:30", user: "N. Shaikh", action: "login", module: "System", entity: "Session", reference: "-", summary: "Signed in from a new device", ipAddress: "49.37.120.88", changedFields: 0 },
  { id: "ae-07", at: "2026-11-14T18:44:00+05:30", user: "R. Menon", action: "approve", module: "Accounting", entity: "Purchase Invoice", reference: "PI/26/2270", summary: "Approved at level 2 and posted", ipAddress: "103.21.58.02", changedFields: 1 },
  { id: "ae-08", at: "2026-11-14T17:31:00+05:30", user: "R. Menon", action: "settings", module: "System", entity: "Numbering Series", reference: "SI series", summary: "Next number advanced after a cancelled document", ipAddress: "103.21.58.02", changedFields: 1 },
  { id: "ae-09", at: "2026-11-14T16:58:00+05:30", user: "A. Fernandes", action: "export", module: "Reporting", entity: "Receivable Ageing", reference: "XLSX export", summary: "Exported 8 customers, 10 open invoices", ipAddress: "103.21.58.21", changedFields: 0 },
  { id: "ae-10", at: "2026-11-14T15:36:00+05:30", user: "R. Menon", action: "delete", module: "Accounting", entity: "Payment Voucher", reference: "PV/26/0879", summary: "Reversed, wrong bank account selected", ipAddress: "103.21.58.02", changedFields: 1 },
  { id: "ae-11", at: "2026-11-13T20:14:00+05:30", user: "IT Administrator", action: "settings", module: "System", entity: "User", reference: "H. Mathew", summary: "Account suspended pending review", ipAddress: "103.21.58.05", changedFields: 2 },
  { id: "ae-12", at: "2026-11-13T11:22:00+05:30", user: "M. Qureshi", action: "create", module: "Inventory", entity: "Stock Transfer", reference: "TRF/26/0608", summary: "Transfer raised from Central Store to North Depot", ipAddress: "49.37.98.140", changedFields: 7 },
];

export const MOCK_DOCUMENTS: DocumentFile[] = [
  { id: "doc-01", name: "SI-26-4418-tax-invoice.pdf", fileType: "pdf", sizeKb: 184, module: "Sales & Invoicing", linkedTo: "SI/26/4418", uploadedBy: "System", uploadedAt: "2026-11-15T09:30:00+05:30", access: "all_users" },
  { id: "doc-02", name: "vertex-polymers-invoice-88421.pdf", fileType: "pdf", sizeKb: 412, module: "Purchase Invoicing", linkedTo: "PI/26/2271", uploadedBy: "N. Shaikh", uploadedAt: "2026-11-15T08:20:00+05:30", access: "finance_only" },
  { id: "doc-03", name: "grn-1872-weighbridge.jpg", fileType: "image", sizeKb: 2_480, module: "Stock Inward", linkedTo: "GRN/26/1872", uploadedBy: "S. Iyer", uploadedAt: "2026-11-15T09:10:00+05:30", access: "all_users" },
  { id: "doc-04", name: "bank-advice-rtgs-220934.pdf", fileType: "pdf", sizeKb: 96, module: "Cash & Bank", linkedTo: "RCT/26/3301", uploadedBy: "A. Fernandes", uploadedAt: "2026-11-15T08:55:00+05:30", access: "finance_only" },
  { id: "doc-05", name: "physical-count-nov-central.xlsx", fileType: "spreadsheet", sizeKb: 318, module: "Stock Adjustment", linkedTo: "ADJ/26/0091", uploadedBy: "S. Iyer", uploadedAt: "2026-11-12T17:40:00+05:30", access: "managers" },
  { id: "doc-06", name: "kinetic-infra-credit-agreement.pdf", fileType: "pdf", sizeKb: 1_240, module: "Accounts Receivable", linkedTo: "CU-018", uploadedBy: "R. Menon", uploadedAt: "2026-11-10T12:05:00+05:30", access: "restricted" },
  { id: "doc-07", name: "warehouse-rent-nov.pdf", fileType: "pdf", sizeKb: 148, module: "Expenses", linkedTo: "EXP/26/0455", uploadedBy: "M. Qureshi", uploadedAt: "2026-11-13T10:18:00+05:30", access: "finance_only" },
  { id: "doc-08", name: "vat-return-oct-nov-workings.xlsx", fileType: "spreadsheet", sizeKb: 642, module: "Tax & VAT", linkedTo: "VAT Oct-Nov 2026", uploadedBy: "R. Menon", uploadedAt: "2026-11-14T19:02:00+05:30", access: "finance_only" },
  { id: "doc-09", name: "transfer-0608-dispatch-note.pdf", fileType: "pdf", sizeKb: 132, module: "Stock Transfer", linkedTo: "TRF/26/0608", uploadedBy: "M. Qureshi", uploadedAt: "2026-11-13T12:44:00+05:30", access: "all_users" },
  { id: "doc-10", name: "supplier-onboarding-orion.docx", fileType: "document", sizeKb: 86, module: "Accounts Payable", linkedTo: "SP-028", uploadedBy: "N. Shaikh", uploadedAt: "2026-11-04T15:28:00+05:30", access: "managers" },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: "nt-01", at: "2026-11-15T09:35:00+05:30", channel: "in_app", category: "approval", title: "Stock adjustment ADJ/26/0094 needs your approval", body: "Port Bonded write-down of 2,18,400 raised by S. Iyer.", level: "critical", read: false, audience: "Finance Controller" },
  { id: "nt-02", at: "2026-11-15T09:00:00+05:30", channel: "in_app", category: "low_stock", title: "HDPE Pipe 63mm below reorder level", body: "18 MTR on hand at North Depot against a reorder level of 150 MTR.", level: "serious", read: false, audience: "Warehouse Manager" },
  { id: "nt-03", at: "2026-11-15T08:30:00+05:30", channel: "email", category: "expiry", title: "Batch B-2291 expires in 9 days", body: "Epoxy Sealant 5L, 96 units at Central Store.", level: "critical", read: false, audience: "Warehouse Manager" },
  { id: "nt-04", at: "2026-11-15T08:00:00+05:30", channel: "email", category: "payment_due", title: "14 supplier bills fall due this week", body: "Total 23,42,800 across Vertex Polymers, Allied Metals and Harbour Logistics.", level: "warning", read: true, audience: "Finance Controller" },
  { id: "nt-05", at: "2026-11-14T18:10:00+05:30", channel: "in_app", category: "approval", title: "Purchase invoice PI/26/2271 waiting at level 1", body: "14,86,200 from Vertex Polymers, raised by N. Shaikh.", level: "serious", read: true, audience: "Purchase Head" },
  { id: "nt-06", at: "2026-11-14T12:00:00+05:30", channel: "email", category: "payment_due", title: "Customer statement run completed", body: "Statements issued to 8 customers with outstanding balances.", level: "neutral", read: true, audience: "Accountant" },
  { id: "nt-07", at: "2026-11-14T06:00:00+05:30", channel: "in_app", category: "system", title: "Nightly backup completed", body: "Full backup 1.8 GB stored to S3 with 30-day retention.", level: "good", read: true, audience: "System Administrator" },
  { id: "nt-08", at: "2026-11-13T20:16:00+05:30", channel: "email", category: "system", title: "User account suspended", body: "H. Mathew suspended by IT Administrator pending review.", level: "warning", read: true, audience: "System Administrator" },
  { id: "nt-09", at: "2026-11-13T09:15:00+05:30", channel: "in_app", category: "low_stock", title: "Negative stock detected", body: "Copper Lug 16mm shows -42 PCS at Port Bonded after issue INV/26/1184.", level: "critical", read: true, audience: "Warehouse Manager" },
];

export const MOCK_NUMBERING: NumberingSeries[] = [
  { id: "ns-01", documentType: "Sales Invoice", prefix: "SI", nextNumber: 4_419, format: "SI/{YY}/{####}", resetRule: "yearly", branchSpecific: false },
  { id: "ns-02", documentType: "Credit Note", prefix: "CN", nextNumber: 143, format: "CN/{YY}/{####}", resetRule: "yearly", branchSpecific: false },
  { id: "ns-03", documentType: "Purchase Invoice", prefix: "PI", nextNumber: 2_272, format: "PI/{YY}/{####}", resetRule: "yearly", branchSpecific: false },
  { id: "ns-04", documentType: "Payment Voucher", prefix: "PV", nextNumber: 882, format: "PV/{YY}/{####}", resetRule: "yearly", branchSpecific: true },
  { id: "ns-05", documentType: "Customer Receipt", prefix: "RCT", nextNumber: 3_303, format: "RCT/{YY}/{####}", resetRule: "yearly", branchSpecific: true },
  { id: "ns-06", documentType: "Journal Entry", prefix: "JV", nextNumber: 813, format: "JV/{YY}/{####}", resetRule: "yearly", branchSpecific: false },
  { id: "ns-07", documentType: "Goods Receipt", prefix: "GRN", nextNumber: 1_873, format: "GRN/{YY}/{####}", resetRule: "yearly", branchSpecific: true },
  { id: "ns-08", documentType: "Stock Issue", prefix: "ISS", nextNumber: 4_419, format: "ISS/{YY}/{####}", resetRule: "yearly", branchSpecific: true },
  { id: "ns-09", documentType: "Stock Transfer", prefix: "TRF", nextNumber: 613, format: "TRF/{YY}/{####}", resetRule: "yearly", branchSpecific: false },
  { id: "ns-10", documentType: "Stock Adjustment", prefix: "ADJ", nextNumber: 95, format: "ADJ/{YY}/{####}", resetRule: "yearly", branchSpecific: false },
];

export const MOCK_CURRENCIES: CurrencySetting[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", isBase: true, rateToBase: 1, updatedOn: "2026-11-15" },
  { code: "AED", name: "UAE Dirham", symbol: "AED", isBase: false, rateToBase: 24.12, updatedOn: "2026-11-15" },
  { code: "USD", name: "US Dollar", symbol: "$", isBase: false, rateToBase: 88.6, updatedOn: "2026-11-15" },
  { code: "EUR", name: "Euro", symbol: "€", isBase: false, rateToBase: 96.4, updatedOn: "2026-11-14" },
];

export const MOCK_IMPORT_TEMPLATES: ImportTemplate[] = [
  { id: "tp-01", name: "Chart of accounts", module: "Accounting", columns: 9, description: "Account code, name, type, parent group and opening balance.", phase: "mvp" },
  { id: "tp-02", name: "Customers", module: "Accounts Receivable", columns: 12, description: "Code, name, contact, credit limit, credit days and opening balance.", phase: "mvp" },
  { id: "tp-03", name: "Suppliers", module: "Accounts Payable", columns: 11, description: "Code, name, contact, credit days and opening balance.", phase: "mvp" },
  { id: "tp-04", name: "Item master", module: "Inventory", columns: 18, description: "SKU, description, category, units, prices, tax code and tracking mode.", phase: "mvp" },
  { id: "tp-05", name: "Opening stock", module: "Inventory", columns: 8, description: "SKU, warehouse, quantity, rate, batch and expiry.", phase: "mvp" },
  { id: "tp-06", name: "Opening balances", module: "Accounting", columns: 6, description: "Account, party, debit, credit and document reference.", phase: "mvp" },
  { id: "tp-07", name: "Price lists", module: "Sales & Invoicing", columns: 7, description: "Customer group, SKU, price, discount and validity window.", phase: "phase2" },
  { id: "tp-08", name: "Bank statement", module: "Cash & Bank", columns: 6, description: "Date, narration, reference, debit, credit and balance.", phase: "phase2" },
];

export const MOCK_IMPORT_JOBS: ImportJob[] = [
  { id: "ij-01", template: "Item master", fileName: "items-batch-nov.xlsx", rows: 486, imported: 486, failed: 0, status: "completed", startedAt: "2026-11-14T11:20:00+05:30", runBy: "S. Iyer" },
  { id: "ij-02", template: "Customers", fileName: "customers-master.xlsx", rows: 42, imported: 40, failed: 2, status: "completed", startedAt: "2026-11-12T15:02:00+05:30", runBy: "A. Fernandes" },
  { id: "ij-03", template: "Opening stock", fileName: "opening-stock-central.xlsx", rows: 486, imported: 486, failed: 0, status: "completed", startedAt: "2026-10-01T09:30:00+05:30", runBy: "R. Menon" },
  { id: "ij-04", template: "Opening balances", fileName: "opening-tb.xlsx", rows: 23, imported: 23, failed: 0, status: "completed", startedAt: "2026-10-01T09:05:00+05:30", runBy: "R. Menon" },
  { id: "ij-05", template: "Suppliers", fileName: "suppliers-nov-additions.xlsx", rows: 7, imported: 0, failed: 7, status: "failed", startedAt: "2026-11-15T07:55:00+05:30", runBy: "N. Shaikh" },
];

export const MOCK_COMPANIES: CompanyEntity[] = [
  { id: "co-001", name: "Meridian Trading", legalName: "Meridian Trading & Distribution Pvt. Ltd.", baseCurrency: "INR", branchCount: 3, userCount: 11, stockValue: 2_41_06_800, revenueYtd: 14_86_42_000, status: "live" },
  { id: "co-002", name: "Meridian Logistics", legalName: "Meridian Logistics Services Pvt. Ltd.", baseCurrency: "INR", branchCount: 2, userCount: 0, stockValue: 0, revenueYtd: 0, status: "setup" },
  { id: "co-003", name: "Meridian Gulf", legalName: "Meridian Gulf Trading FZE", baseCurrency: "AED", branchCount: 1, userCount: 0, stockValue: 0, revenueYtd: 0, status: "setup" },
];

export const MOCK_BACKUPS: BackupRecord[] = [
  { id: "bk-01", at: "2026-11-15T02:00:00+05:30", kind: "full", sizeMb: 1_840, destination: "S3 - ap-south-1", status: "completed", retentionDays: 30, restoreTestedOn: "2026-11-01" },
  { id: "bk-02", at: "2026-11-14T14:00:00+05:30", kind: "incremental", sizeMb: 212, destination: "S3 - ap-south-1", status: "completed", retentionDays: 14 },
  { id: "bk-03", at: "2026-11-14T02:00:00+05:30", kind: "full", sizeMb: 1_812, destination: "S3 - ap-south-1", status: "completed", retentionDays: 30 },
  { id: "bk-04", at: "2026-11-13T14:00:00+05:30", kind: "incremental", sizeMb: 198, destination: "S3 - ap-south-1", status: "completed", retentionDays: 14 },
  { id: "bk-05", at: "2026-11-13T02:00:00+05:30", kind: "snapshot", sizeMb: 2_140, destination: "RDS automated snapshot", status: "completed", retentionDays: 7 },
  { id: "bk-06", at: "2026-11-12T02:00:00+05:30", kind: "full", sizeMb: 0, destination: "S3 - ap-south-1", status: "failed", retentionDays: 30 },
];

export const MOCK_SECURITY_CONTROLS: SecurityControl[] = [
  { id: "sc-01", name: "Password policy", detail: "12 characters, mixed case, number and symbol, 90-day rotation.", state: "enforced", owner: "IT Administrator" },
  { id: "sc-02", name: "Two-factor authentication", detail: "Enforced for Finance Controller and System Administrator roles only.", state: "partial", owner: "IT Administrator" },
  { id: "sc-03", name: "Session timeout", detail: "Idle sessions end after 30 minutes; absolute limit 12 hours.", state: "enforced", owner: "IT Administrator" },
  { id: "sc-04", name: "Transport security", detail: "HTTPS enforced, HSTS enabled, TLS 1.2 minimum.", state: "enforced", owner: "DevOps" },
  { id: "sc-05", name: "Document access control", detail: "Attachments served from private storage with per-role checks.", state: "enforced", owner: "IT Administrator" },
  { id: "sc-06", name: "Restore rehearsal", detail: "Documented restore into staging, completed 01 Nov 2026.", state: "enforced", owner: "DevOps" },
  { id: "sc-07", name: "IP allow list for admin", detail: "Not configured; admin console reachable from any network.", state: "not_configured", owner: "DevOps" },
  { id: "sc-08", name: "Audit log retention", detail: "Retained 12 months online; archive policy pending sign-off.", state: "partial", owner: "Finance Controller" },
];
