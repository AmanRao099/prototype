import type { DeliveryPhase } from "@/lib/types";

/**
 * Navigation model.
 *
 * The source workbook groups its 29 modules into three categories (Accounting &
 * Finance, Inventory & Stock, Common System). That is a good inventory of scope
 * and a poor menu: it puts "Stock Inward" six items away from the purchase
 * invoice it follows, and buries daily screens under administration.
 *
 * The sidebar is therefore arranged by workflow - Sales, Purchases, Inventory,
 * Accounting, Reports, Workflow - with administration behind a Settings area.
 * Every module keeps its workbook category in `workbookCategory`, so the
 * mapping back to the proposal stays visible on the All modules page.
 */

export type WorkbookCategory = "Accounting & Finance" | "Inventory & Stock" | "Common System";

export interface NavItem {
  /** Menu label. Kept short; `moduleName` holds the workbook wording. */
  label: string;
  /** Module name exactly as it appears in Accounts & Inventory Modules.xlsx. */
  moduleName: string;
  href: string;
  /** lucide-react icon name, resolved in the sidebar. */
  icon: string;
  phase: DeliveryPhase;
  /** Key features transcribed from the source workbook. */
  features: string;
  workbookCategory: WorkbookCategory;
  /** Django app that will own the endpoints. */
  app: "accounting" | "inventory" | "common";
  badge?: string;
  /** Words people might search for that are not in the label. */
  keywords?: string;
}

export interface NavSection {
  id: string;
  title: string;
  icon: string;
  /** One line explaining what the section is for, shown on the modules page. */
  blurb: string;
  items: NavItem[];
}

export const DASHBOARD_ITEM: NavItem = {
  label: "Dashboard",
  moduleName: "Dashboard",
  href: "/dashboard",
  icon: "LayoutDashboard",
  phase: "mvp",
  features: "Financial overview; sales/purchase summary; receivables/payables; stock summary and alerts",
  workbookCategory: "Common System",
  app: "common",
  keywords: "home overview kpi summary",
};

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "sell",
    title: "Sell",
    icon: "Receipt",
    blurb: "Order to cash: invoice the customer, deliver the goods, collect the money.",
    items: [
      {
        label: "Invoices",
        moduleName: "Sales & Invoicing",
        href: "/accounting/sales-invoicing",
        icon: "FileText",
        phase: "mvp",
        features:
          "Cash/credit invoices; proforma and tax invoices; discounts; VAT; sales returns; credit notes; invoice status; PDF printing",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "sales invoice proforma credit note tax invoice billing",
      },
      {
        label: "Deliveries",
        moduleName: "Stock Outward",
        href: "/inventory/stock-outward",
        icon: "ArrowUpFromLine",
        phase: "mvp",
        features:
          "Stock issue; sales delivery; delivery notes; reservations; allocation; internal consumption; damaged stock; outward history",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "stock outward issue delivery note dispatch reservation",
      },
      {
        label: "Customer balances",
        moduleName: "Accounts Receivable",
        href: "/accounting/accounts-receivable",
        icon: "HandCoins",
        phase: "mvp",
        features:
          "Customer accounts; invoices; receipts; partial/advance payments; credit notes; outstanding statements; ageing; credit limits",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "receivable debtors ageing credit limit statement collection",
      },
    ],
  },
  {
    id: "buy",
    title: "Buy",
    icon: "ShoppingCart",
    blurb: "Purchase to pay: receive the goods, book the bill, settle the supplier.",
    items: [
      {
        label: "Goods receipts",
        moduleName: "Stock Inward",
        href: "/inventory/stock-inward",
        icon: "ArrowDownToLine",
        phase: "mvp",
        features:
          "Goods receipt notes; purchase receipts; direct stock entry; opening stock; quantity verification; batch/serial and expiry details",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "grn stock inward receipt opening stock batch expiry",
      },
      {
        label: "Supplier bills",
        moduleName: "Purchase & Supplier Invoicing",
        href: "/accounting/purchase-invoicing",
        icon: "ShoppingCart",
        phase: "mvp",
        features:
          "Purchase invoices; cash/credit purchases; purchase returns; debit notes; VAT; additional charges; landed cost",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "purchase invoice debit note landed cost supplier bill",
      },
      {
        label: "Supplier balances",
        moduleName: "Accounts Payable",
        href: "/accounting/accounts-payable",
        icon: "ReceiptText",
        phase: "mvp",
        features:
          "Supplier accounts; supplier invoices; payment vouchers; partial/advance payments; debit notes; outstanding statements; ageing",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "payable creditors ageing payment voucher settlement",
      },
    ],
  },
  {
    id: "stock",
    title: "Stock",
    icon: "Package",
    blurb: "What you hold, where it sits, what it is worth and what needs attention.",
    items: [
      {
        label: "Items",
        moduleName: "Item & Product Master",
        href: "/inventory/items",
        icon: "Package",
        phase: "mvp",
        features:
          "Item/SKU codes; barcode/QR; descriptions; categories; brands; units and conversions; purchase/selling prices; VAT; batch/serial tracking",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "item product master sku barcode price unit category brand",
      },
      {
        label: "Warehouses",
        moduleName: "Warehouse Management",
        href: "/inventory/warehouses",
        icon: "Warehouse",
        phase: "mvp",
        features:
          "Multiple warehouses; locations/bins; warehouse-wise stock; stock allocation; warehouse reports and valuation",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "warehouse location bin capacity utilisation",
      },
      {
        label: "Transfers",
        moduleName: "Stock Transfer",
        href: "/inventory/stock-transfer",
        icon: "ArrowLeftRight",
        phase: "mvp",
        features:
          "Warehouse transfers; transfer requests and approvals; dispatch; receipt confirmation; in-transit tracking; transfer history",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "transfer in transit dispatch receipt confirmation",
      },
      {
        label: "Adjustments",
        moduleName: "Stock Adjustment",
        href: "/inventory/stock-adjustment",
        icon: "SlidersHorizontal",
        phase: "mvp",
        features:
          "Positive/negative adjustments; damaged/expired stock; physical verification; reconciliation; approvals; adjustment history",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "adjustment damage expiry physical count reconciliation variance",
      },
      {
        label: "Batches & serials",
        moduleName: "Batch, Serial & Expiry Traceability",
        href: "/inventory/traceability",
        icon: "ScanBarcode",
        phase: "phase2",
        features:
          "Batch register with shelf life; serial register with warranty; quarantine and expiry handling; full movement trace per batch; expiry and recall reporting",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "batch serial expiry lot traceability recall warranty quarantine shelf life",
      },
      {
        label: "Valuation",
        moduleName: "Stock Valuation & Costing",
        href: "/inventory/valuation",
        icon: "Scale",
        phase: "limited",
        features:
          "FIFO; weighted average; optional standard costing; item/warehouse valuation; landed cost allocation; movement costing",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        badge: "FIFO / W.Avg",
        keywords: "valuation costing fifo weighted average landed cost",
      },
      {
        label: "Stock alerts",
        moduleName: "Inventory Alerts",
        href: "/inventory/alerts",
        icon: "BellRing",
        phase: "mvp",
        features:
          "Low stock; reorder level; overstock; expiry; non-moving stock; negative stock; reservation alerts",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        keywords: "alert low stock reorder overstock expiry negative non moving",
      },
    ],
  },
  {
    id: "accounting",
    title: "Accounting",
    icon: "BookOpen",
    blurb: "The ledger itself: accounts, journals, money in and out, and tax.",
    items: [
      {
        label: "Chart of accounts",
        moduleName: "Chart of Accounts",
        href: "/accounting/chart-of-accounts",
        icon: "Network",
        phase: "mvp",
        features:
          "Account groups; assets, liabilities, income and expenses; cash/bank accounts; opening balances; account hierarchy",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "chart accounts groups hierarchy opening balance",
      },
      {
        label: "General ledger",
        moduleName: "General Ledger",
        href: "/accounting/general-ledger",
        icon: "BookOpen",
        phase: "mvp",
        features:
          "Journal entries; debit/credit postings; ledger statements; reconciliation; opening/closing balances; transaction references",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "journal voucher posting ledger statement debit credit",
      },
      {
        label: "Cash & bank",
        moduleName: "Cash & Bank Management",
        href: "/accounting/cash-bank",
        icon: "Landmark",
        phase: "limited",
        features:
          "Cash/bank accounts; receipts; payments; fund transfers; petty cash; bank reconciliation; cash book; bank book; daily closing",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        badge: "Bank rec. Phase 2",
        keywords: "cash bank receipt payment petty cash reconciliation day book",
      },
      {
        label: "Bank reconciliation",
        moduleName: "Bank Reconciliation",
        href: "/accounting/bank-reconciliation",
        icon: "GitCompare",
        phase: "phase2",
        features:
          "Statement import; automatic match suggestions; manual matching; outstanding cheques and deposits in transit; unbooked bank items; reconciliation statement and sign-off",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "reconciliation bank statement match outstanding cheque clearing",
      },
      {
        label: "Expenses",
        moduleName: "Expense Management",
        href: "/accounting/expenses",
        icon: "Wallet",
        phase: "phase2",
        features:
          "Expense categories; expense vouchers; recurring expenses; department allocation; approvals; attachments; expense reports",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        keywords: "expense voucher recurring department petty spend",
      },
      {
        label: "Tax & VAT",
        moduleName: "Tax & VAT Management",
        href: "/accounting/tax-vat",
        icon: "Percent",
        phase: "limited",
        features:
          "VAT configuration; standard/zero-rated/exempt transactions; input/output VAT; adjustments; VAT return and transaction reports",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        badge: "One jurisdiction",
        keywords: "vat tax return input output zero rated exempt reverse charge",
      },
    ],
  },
  {
    id: "reports",
    title: "Reports",
    icon: "ChartNoAxesCombined",
    blurb: "Statements and registers for finance and for the warehouse.",
    items: [
      {
        label: "Financial reports",
        moduleName: "Financial Reporting",
        href: "/accounting/financial-reporting",
        icon: "ChartNoAxesCombined",
        phase: "limited",
        features:
          "Trial balance; profit & loss; balance sheet; cash flow; general ledger; receivable/payable ageing; sales/purchase registers; VAT reports",
        workbookCategory: "Accounting & Finance",
        app: "accounting",
        badge: "Core reports",
        keywords: "trial balance profit loss balance sheet cash flow register",
      },
      {
        label: "Inventory reports",
        moduleName: "Inventory Reporting",
        href: "/inventory/reporting",
        icon: "ClipboardList",
        phase: "limited",
        features:
          "Current stock; stock summary/ledger; movement; item/warehouse reports; valuation; ageing; batch/serial; expiry; slow/dead stock; reorder; reconciliation",
        workbookCategory: "Inventory & Stock",
        app: "inventory",
        badge: "Core reports",
        keywords: "stock ledger movement slow dead stock reorder reconciliation",
      },
    ],
  },
  {
    id: "workflow",
    title: "Workflow",
    icon: "CheckCheck",
    blurb: "Everything waiting on a person: approvals, alerts, paperwork and history.",
    items: [
      {
        label: "Approvals",
        moduleName: "Approval Workflow",
        href: "/system/approvals",
        icon: "CheckCheck",
        phase: "limited",
        features:
          "Invoice, payment, purchase and stock-adjustment approvals; multi-level approvals; delegation; approval history",
        workbookCategory: "Common System",
        app: "common",
        badge: "Basic states",
        keywords: "approval queue authorise reject delegation multi level",
      },
      {
        label: "Notifications",
        moduleName: "Notifications",
        href: "/system/notifications",
        icon: "Bell",
        phase: "mvp",
        features: "Payment due; low stock; expiry; pending approval and system alerts",
        workbookCategory: "Common System",
        app: "common",
        keywords: "notification alert email reminder due",
      },
      {
        label: "Documents",
        moduleName: "Document Management",
        href: "/system/documents",
        icon: "Paperclip",
        phase: "limited",
        features:
          "Attachments for invoices, receipts and supporting documents; document search and access control",
        workbookCategory: "Common System",
        app: "common",
        keywords: "attachment file upload document search access",
      },
      {
        label: "Audit trail",
        moduleName: "Audit Trail",
        href: "/system/audit-trail",
        icon: "History",
        phase: "mvp",
        features: "User activity logs; transaction history; record change tracking",
        workbookCategory: "Common System",
        app: "common",
        keywords: "audit log history change tracking who did what",
      },
    ],
  },
];

/** Administration. Reached through Settings rather than the main menu. */
export const SETTINGS_ITEMS: NavItem[] = [
  {
    label: "Company settings",
    moduleName: "System Configuration",
    href: "/system/configuration",
    icon: "Settings",
    phase: "mvp",
    features:
      "Company/branch settings; financial year; currencies; tax settings; document numbering; master data",
    workbookCategory: "Common System",
    app: "common",
    keywords: "configuration company branch financial year currency numbering master data",
  },
  {
    label: "Users & roles",
    moduleName: "User & Role Management",
    href: "/system/users-roles",
    icon: "Users",
    phase: "mvp",
    features: "User accounts; role-based access; module and action permissions; data-level restrictions",
    workbookCategory: "Common System",
    app: "common",
    keywords: "user role permission access security login",
  },
  {
    label: "Import & export",
    moduleName: "Data Import & Export",
    href: "/system/import-export",
    icon: "ArrowDownUp",
    phase: "mvp",
    features: "Excel/CSV import; Excel/PDF export; bulk data upload",
    workbookCategory: "Common System",
    app: "common",
    keywords: "import export excel csv template bulk upload migration",
  },
  {
    label: "Companies & branches",
    moduleName: "Multi-company & Multi-branch",
    href: "/system/multi-company",
    icon: "Building2",
    phase: "phase2",
    features: "Company-wise and branch-wise transactions, reporting and stock control",
    workbookCategory: "Common System",
    app: "common",
    keywords: "multi company branch entity consolidation group",
  },
  {
    label: "Backup & security",
    moduleName: "Backup & Security",
    href: "/system/backup-security",
    icon: "ShieldCheck",
    phase: "mvp",
    features: "Automated backups; access security; password policies; recovery controls",
    workbookCategory: "Common System",
    app: "common",
    keywords: "backup restore security password policy recovery",
  },
];

export const SETTINGS_SECTION: NavSection = {
  id: "settings",
  title: "Settings",
  icon: "Settings",
  blurb: "Administration: configuration, access, data loading and recovery.",
  items: SETTINGS_ITEMS,
};

export const ALL_SECTIONS: NavSection[] = [...NAV_SECTIONS, SETTINGS_SECTION];

export const ALL_NAV_ITEMS: NavItem[] = [
  DASHBOARD_ITEM,
  ...NAV_SECTIONS.flatMap((section) => section.items),
  ...SETTINGS_ITEMS,
];

export function findNavItem(href: string): { item: NavItem; section?: NavSection } | undefined {
  if (href === DASHBOARD_ITEM.href) return { item: DASHBOARD_ITEM };
  for (const section of ALL_SECTIONS) {
    const item = section.items.find((candidate) => candidate.href === href);
    if (item) return { item, section };
  }
  return undefined;
}

export function sectionForPath(pathname: string): NavSection | undefined {
  return ALL_SECTIONS.find((section) => section.items.some((item) => item.href === pathname));
}

/** The workbook's own three categories, rebuilt for the All modules page. */
export const WORKBOOK_CATEGORIES: WorkbookCategory[] = [
  "Accounting & Finance",
  "Inventory & Stock",
  "Common System",
];

export function itemsByWorkbookCategory(category: WorkbookCategory): NavItem[] {
  return ALL_NAV_ITEMS.filter((item) => item.workbookCategory === category);
}

export const PHASE_LABEL: Record<DeliveryPhase, string> = {
  mvp: "Phase 1 MVP",
  limited: "Phase 1 - limited",
  phase2: "Phase 2",
};
