import type { DeliveryPhase } from "@/lib/types";

export interface NavItem {
  /** Module name exactly as it appears in Accounts & Inventory Modules.xlsx. */
  label: string;
  href: string;
  /** lucide-react icon name, resolved in the sidebar. */
  icon: string;
  phase: DeliveryPhase;
  /** Key features transcribed from the source workbook. */
  features: string;
  badge?: string;
}

export interface NavGroup {
  /** Workbook category, which is also the Django app boundary. */
  title: string;
  app: "accounting" | "inventory" | "common";
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Accounting & Finance",
    app: "accounting",
    items: [
      {
        label: "Chart of Accounts",
        href: "/accounting/chart-of-accounts",
        icon: "Network",
        phase: "mvp",
        features:
          "Account groups; assets, liabilities, income and expenses; cash/bank accounts; opening balances; account hierarchy",
      },
      {
        label: "General Ledger",
        href: "/accounting/general-ledger",
        icon: "BookOpen",
        phase: "mvp",
        features:
          "Journal entries; debit/credit postings; ledger statements; reconciliation; opening/closing balances; transaction references",
      },
      {
        label: "Accounts Receivable",
        href: "/accounting/accounts-receivable",
        icon: "HandCoins",
        phase: "mvp",
        features:
          "Customer accounts; invoices; receipts; partial/advance payments; credit notes; outstanding statements; ageing; credit limits",
      },
      {
        label: "Accounts Payable",
        href: "/accounting/accounts-payable",
        icon: "ReceiptText",
        phase: "mvp",
        features:
          "Supplier accounts; supplier invoices; payment vouchers; partial/advance payments; debit notes; outstanding statements; ageing",
      },
      {
        label: "Sales & Invoicing",
        href: "/accounting/sales-invoicing",
        icon: "FileText",
        phase: "mvp",
        features:
          "Cash/credit invoices; proforma and tax invoices; discounts; VAT; sales returns; credit notes; invoice status; PDF printing",
      },
      {
        label: "Purchase & Supplier Invoicing",
        href: "/accounting/purchase-invoicing",
        icon: "ShoppingCart",
        phase: "mvp",
        features:
          "Purchase invoices; cash/credit purchases; purchase returns; debit notes; VAT; additional charges; landed cost",
      },
      {
        label: "Cash & Bank",
        href: "/accounting/cash-bank",
        icon: "Landmark",
        phase: "limited",
        features:
          "Cash/bank accounts; receipts; payments; fund transfers; petty cash; bank reconciliation; cash book; bank book; daily closing",
        badge: "Bank rec. Phase 2",
      },
      {
        label: "Expense Management",
        href: "/accounting/expenses",
        icon: "Wallet",
        phase: "phase2",
        features:
          "Expense categories; expense vouchers; recurring expenses; department allocation; approvals; attachments; expense reports",
      },
      {
        label: "Tax & VAT",
        href: "/accounting/tax-vat",
        icon: "Percent",
        phase: "limited",
        features:
          "VAT configuration; standard/zero-rated/exempt transactions; input/output VAT; adjustments; VAT return and transaction reports",
        badge: "One jurisdiction",
      },
      {
        label: "Financial Reporting",
        href: "/accounting/financial-reporting",
        icon: "ChartNoAxesCombined",
        phase: "limited",
        features:
          "Trial balance; profit & loss; balance sheet; cash flow; general ledger; receivable/payable ageing; sales/purchase registers; VAT reports",
        badge: "Core reports",
      },
    ],
  },
  {
    title: "Inventory & Stock",
    app: "inventory",
    items: [
      {
        label: "Item & Product Master",
        href: "/inventory/items",
        icon: "Package",
        phase: "mvp",
        features:
          "Item/SKU codes; barcode/QR; descriptions; categories; brands; units and conversions; purchase/selling prices; VAT; batch/serial tracking",
      },
      {
        label: "Warehouse Management",
        href: "/inventory/warehouses",
        icon: "Warehouse",
        phase: "mvp",
        features:
          "Multiple warehouses; locations/bins; warehouse-wise stock; stock allocation; warehouse reports and valuation",
      },
      {
        label: "Stock Inward",
        href: "/inventory/stock-inward",
        icon: "ArrowDownToLine",
        phase: "mvp",
        features:
          "Goods receipt notes; purchase receipts; direct stock entry; opening stock; quantity verification; batch/serial and expiry details",
      },
      {
        label: "Stock Outward",
        href: "/inventory/stock-outward",
        icon: "ArrowUpFromLine",
        phase: "mvp",
        features:
          "Stock issue; sales delivery; delivery notes; reservations; allocation; internal consumption; damaged stock; outward history",
      },
      {
        label: "Stock Transfer",
        href: "/inventory/stock-transfer",
        icon: "ArrowLeftRight",
        phase: "mvp",
        features:
          "Warehouse transfers; transfer requests and approvals; dispatch; receipt confirmation; in-transit tracking; transfer history",
      },
      {
        label: "Stock Adjustment",
        href: "/inventory/stock-adjustment",
        icon: "SlidersHorizontal",
        phase: "mvp",
        features:
          "Positive/negative adjustments; damaged/expired stock; physical verification; reconciliation; approvals; adjustment history",
      },
      {
        label: "Valuation & Costing",
        href: "/inventory/valuation",
        icon: "Scale",
        phase: "limited",
        features:
          "FIFO; weighted average; optional standard costing; item/warehouse valuation; landed cost allocation; movement costing",
        badge: "FIFO / W.Avg",
      },
      {
        label: "Inventory Alerts",
        href: "/inventory/alerts",
        icon: "BellRing",
        phase: "mvp",
        features:
          "Low stock; reorder level; overstock; expiry; non-moving stock; negative stock; reservation alerts",
      },
      {
        label: "Inventory Reporting",
        href: "/inventory/reporting",
        icon: "ClipboardList",
        phase: "limited",
        features:
          "Current stock; stock summary/ledger; movement; item/warehouse reports; valuation; ageing; batch/serial; expiry; slow/dead stock; reorder; reconciliation",
        badge: "Core reports",
      },
    ],
  },
  {
    title: "Common System",
    app: "common",
    items: [
      {
        label: "Users & Roles",
        href: "/system/users-roles",
        icon: "Users",
        phase: "mvp",
        features: "User accounts; role-based access; module and action permissions; data-level restrictions",
      },
      {
        label: "Approval Workflow",
        href: "/system/approvals",
        icon: "CheckCheck",
        phase: "limited",
        features:
          "Invoice, payment, purchase and stock-adjustment approvals; multi-level approvals; delegation; approval history",
        badge: "Basic states",
      },
      {
        label: "Audit Trail",
        href: "/system/audit-trail",
        icon: "History",
        phase: "mvp",
        features: "User activity logs; transaction history; record change tracking",
      },
      {
        label: "Documents",
        href: "/system/documents",
        icon: "Paperclip",
        phase: "limited",
        features:
          "Attachments for invoices, receipts and supporting documents; document search and access control",
      },
      {
        label: "Notifications",
        href: "/system/notifications",
        icon: "Bell",
        phase: "mvp",
        features: "Payment due; low stock; expiry; pending approval and system alerts",
      },
      {
        label: "System Configuration",
        href: "/system/configuration",
        icon: "Settings",
        phase: "mvp",
        features:
          "Company/branch settings; financial year; currencies; tax settings; document numbering; master data",
      },
      {
        label: "Import & Export",
        href: "/system/import-export",
        icon: "ArrowDownUp",
        phase: "mvp",
        features: "Excel/CSV import; Excel/PDF export; bulk data upload",
      },
      {
        label: "Multi-company & Branch",
        href: "/system/multi-company",
        icon: "Building2",
        phase: "phase2",
        features: "Company-wise and branch-wise transactions, reporting and stock control",
      },
      {
        label: "Backup & Security",
        href: "/system/backup-security",
        icon: "ShieldCheck",
        phase: "mvp",
        features: "Automated backups; access security; password policies; recovery controls",
      },
    ],
  },
];

export const DASHBOARD_ITEM: NavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: "LayoutDashboard",
  phase: "mvp",
  features: "Financial overview; sales/purchase summary; receivables/payables; stock summary and alerts",
};

export const ALL_NAV_ITEMS: NavItem[] = [
  DASHBOARD_ITEM,
  ...NAV_GROUPS.flatMap((group) => group.items),
];

export function findNavItem(href: string): { item: NavItem; group?: NavGroup } | undefined {
  if (href === DASHBOARD_ITEM.href) return { item: DASHBOARD_ITEM };
  for (const group of NAV_GROUPS) {
    const item = group.items.find((candidate) => candidate.href === href);
    if (item) return { item, group };
  }
  return undefined;
}

export const PHASE_LABEL: Record<DeliveryPhase, string> = {
  mvp: "Phase 1 MVP",
  limited: "Phase 1 - limited",
  phase2: "Phase 2",
};
