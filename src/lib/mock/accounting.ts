import type {
  Account,
  CashBankAccount,
  CashBankEntry,
  ExpenseVoucher,
  JournalEntry,
  LedgerRow,
  Party,
  PaymentDocument,
  PurchaseInvoice,
  ReportDefinition,
  SalesInvoice,
  TaxCode,
  TrialBalanceRow,
  VatBox,
  VatReturnPeriod,
} from "@/lib/types";

/**
 * Mock payloads for the Accounting & Finance module screens.
 *
 * They mirror the planned `GET /api/accounting/...` responses so every screen
 * can be reviewed before the Django services exist. Figures are internally
 * consistent: ledger balances tie to the trial balance, invoice balances tie to
 * the receivable and payable totals.
 */

export const MOCK_ACCOUNTS: Account[] = [
  { id: "a-1000", code: "1000", name: "Assets", type: "asset", group: "Assets", level: 0, isGroup: true, openingBalance: 4_12_60_000, balance: 4_58_94_300, side: "debit", isActive: true },
  { id: "a-1100", code: "1100", name: "Current Assets", type: "asset", group: "Assets", level: 1, isGroup: true, openingBalance: 3_68_20_000, balance: 4_02_18_600, side: "debit", isActive: true },
  { id: "a-1110", code: "1110", name: "Cash in Hand", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 2_40_000, balance: 3_18_400, side: "debit", isActive: true, isBankOrCash: true },
  { id: "a-1115", code: "1115", name: "Petty Cash - Head Office", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 60_000, balance: 42_300, side: "debit", isActive: true, isBankOrCash: true },
  { id: "a-1120", code: "1120", name: "HDFC Bank - Current 4411", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 48_10_000, balance: 62_84_200, side: "debit", isActive: true, isBankOrCash: true },
  { id: "a-1125", code: "1125", name: "ICICI Bank - Collections 7702", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 14_80_000, balance: 19_97_600, side: "debit", isActive: true, isBankOrCash: true },
  { id: "a-1200", code: "1200", name: "Accounts Receivable", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 1_08_40_000, balance: 1_24_86_300, side: "debit", isActive: true },
  { id: "a-1300", code: "1300", name: "Inventory", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 2_32_60_000, balance: 2_41_06_800, side: "debit", isActive: true },
  { id: "a-1400", code: "1400", name: "Input VAT Recoverable", type: "asset", group: "Current Assets", level: 2, isGroup: false, openingBalance: 5_20_000, balance: 6_60_925, side: "debit", isActive: true },
  { id: "a-1500", code: "1500", name: "Fixed Assets", type: "asset", group: "Assets", level: 1, isGroup: true, openingBalance: 44_40_000, balance: 56_75_700, side: "debit", isActive: true },
  { id: "a-1510", code: "1510", name: "Plant & Machinery", type: "asset", group: "Fixed Assets", level: 2, isGroup: false, openingBalance: 32_80_000, balance: 41_26_400, side: "debit", isActive: true },
  { id: "a-1520", code: "1520", name: "Office Equipment", type: "asset", group: "Fixed Assets", level: 2, isGroup: false, openingBalance: 11_60_000, balance: 15_49_300, side: "debit", isActive: true },

  { id: "a-2000", code: "2000", name: "Liabilities", type: "liability", group: "Liabilities", level: 0, isGroup: true, openingBalance: 1_84_20_000, balance: 2_01_89_150, side: "credit", isActive: true },
  { id: "a-2100", code: "2100", name: "Accounts Payable", type: "liability", group: "Liabilities", level: 1, isGroup: false, openingBalance: 88_60_000, balance: 92_14_700, side: "credit", isActive: true },
  { id: "a-2200", code: "2200", name: "Output VAT Payable", type: "liability", group: "Liabilities", level: 1, isGroup: false, openingBalance: 7_80_000, balance: 9_32_100, side: "credit", isActive: true },
  { id: "a-2300", code: "2300", name: "Accrued Expenses", type: "liability", group: "Liabilities", level: 1, isGroup: false, openingBalance: 6_40_000, balance: 8_18_650, side: "credit", isActive: true },
  { id: "a-2400", code: "2400", name: "Short-term Borrowings", type: "liability", group: "Liabilities", level: 1, isGroup: false, openingBalance: 81_40_000, balance: 92_23_700, side: "credit", isActive: true },

  { id: "a-3000", code: "3000", name: "Equity", type: "equity", group: "Equity", level: 0, isGroup: true, openingBalance: 1_90_00_000, balance: 2_04_18_000, side: "credit", isActive: true },
  { id: "a-3100", code: "3100", name: "Share Capital", type: "equity", group: "Equity", level: 1, isGroup: false, openingBalance: 1_50_00_000, balance: 1_50_00_000, side: "credit", isActive: true },
  { id: "a-3200", code: "3200", name: "Retained Earnings", type: "equity", group: "Equity", level: 1, isGroup: false, openingBalance: 40_00_000, balance: 54_18_000, side: "credit", isActive: true },

  { id: "a-4000", code: "4000", name: "Income", type: "income", group: "Income", level: 0, isGroup: true, openingBalance: 0, balance: 14_86_42_000, side: "credit", isActive: true },
  { id: "a-4100", code: "4100", name: "Sales - Goods", type: "income", group: "Income", level: 1, isGroup: false, openingBalance: 0, balance: 14_18_60_000, side: "credit", isActive: true },
  { id: "a-4200", code: "4200", name: "Sales - Services", type: "income", group: "Income", level: 1, isGroup: false, openingBalance: 0, balance: 72_40_000, side: "credit", isActive: true },
  { id: "a-4300", code: "4300", name: "Sales Returns & Discounts", type: "income", group: "Income", level: 1, isGroup: false, openingBalance: 0, balance: 4_58_000, side: "debit", isActive: true },

  { id: "a-5000", code: "5000", name: "Expenses", type: "expense", group: "Expenses", level: 0, isGroup: true, openingBalance: 0, balance: 13_42_18_300, side: "debit", isActive: true },
  { id: "a-5100", code: "5100", name: "Cost of Goods Sold", type: "expense", group: "Expenses", level: 1, isGroup: false, openingBalance: 0, balance: 11_48_60_000, side: "debit", isActive: true },
  { id: "a-5200", code: "5200", name: "Freight & Logistics", type: "expense", group: "Expenses", level: 1, isGroup: false, openingBalance: 0, balance: 68_42_100, side: "debit", isActive: true },
  { id: "a-5300", code: "5300", name: "Salaries & Wages", type: "expense", group: "Expenses", level: 1, isGroup: false, openingBalance: 0, balance: 84_60_000, side: "debit", isActive: true },
  { id: "a-5400", code: "5400", name: "Rent & Utilities", type: "expense", group: "Expenses", level: 1, isGroup: false, openingBalance: 0, balance: 22_84_200, side: "debit", isActive: true },
  { id: "a-5500", code: "5500", name: "Depreciation", type: "expense", group: "Expenses", level: 1, isGroup: false, openingBalance: 0, balance: 17_72_000, side: "debit", isActive: true },
];

export const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: "jv-9912",
    voucherNo: "JV/26/0812",
    date: "2026-11-15",
    voucherType: "Sales Invoice",
    sourceDocument: "SI/26/4418",
    narration: "Sales invoice to Oceanic Builders",
    totalDebit: 8_64_200,
    totalCredit: 8_64_200,
    status: "posted",
    createdBy: "D. Rao",
    postedBy: "R. Menon",
    lines: [
      { id: "l-1", accountCode: "1200", accountName: "Accounts Receivable", debit: 8_64_200, credit: 0, party: "Oceanic Builders" },
      { id: "l-2", accountCode: "4100", accountName: "Sales - Goods", debit: 0, credit: 8_23_048 },
      { id: "l-3", accountCode: "2200", accountName: "Output VAT Payable", debit: 0, credit: 41_152 },
    ],
  },
  {
    id: "jv-9911",
    voucherNo: "JV/26/0811",
    date: "2026-11-15",
    voucherType: "Goods Receipt",
    sourceDocument: "GRN/26/1872",
    narration: "Goods received against PO/26/0914 - Vertex Polymers",
    totalDebit: 12_18_900,
    totalCredit: 12_18_900,
    status: "posted",
    createdBy: "N. Shaikh",
    postedBy: "R. Menon",
    lines: [
      { id: "l-4", accountCode: "1300", accountName: "Inventory", debit: 12_18_900, credit: 0 },
      { id: "l-5", accountCode: "2100", accountName: "Accounts Payable", debit: 0, credit: 12_18_900, party: "Vertex Polymers" },
    ],
  },
  {
    id: "jv-9910",
    voucherNo: "JV/26/0810",
    date: "2026-11-15",
    voucherType: "Customer Receipt",
    sourceDocument: "RCT/26/3301",
    narration: "Receipt against SI/26/4388 and SI/26/4401",
    totalDebit: 15_00_000,
    totalCredit: 15_00_000,
    status: "posted",
    createdBy: "A. Fernandes",
    postedBy: "R. Menon",
    lines: [
      { id: "l-6", accountCode: "1120", accountName: "HDFC Bank - Current 4411", debit: 15_00_000, credit: 0 },
      { id: "l-7", accountCode: "1200", accountName: "Accounts Receivable", debit: 0, credit: 15_00_000, party: "Kinetic Infra Projects" },
    ],
  },
  {
    id: "jv-9909",
    voucherNo: "JV/26/0809",
    date: "2026-11-15",
    voucherType: "Stock Adjustment",
    sourceDocument: "ADJ/26/0094",
    narration: "Write-down of damaged stock at Port Bonded",
    totalDebit: 2_18_400,
    totalCredit: 2_18_400,
    status: "pending_approval",
    createdBy: "S. Iyer",
    lines: [
      { id: "l-8", accountCode: "5100", accountName: "Cost of Goods Sold", debit: 2_18_400, credit: 0 },
      { id: "l-9", accountCode: "1300", accountName: "Inventory", debit: 0, credit: 2_18_400 },
    ],
  },
  {
    id: "jv-9908",
    voucherNo: "JV/26/0808",
    date: "2026-11-14",
    voucherType: "Purchase Invoice",
    sourceDocument: "PI/26/2270",
    narration: "Supplier invoice - Allied Metals",
    totalDebit: 6_72_500,
    totalCredit: 6_72_500,
    status: "posted",
    createdBy: "N. Shaikh",
    postedBy: "R. Menon",
    lines: [
      { id: "l-10", accountCode: "1300", accountName: "Inventory", debit: 6_40_476, credit: 0 },
      { id: "l-11", accountCode: "1400", accountName: "Input VAT Recoverable", debit: 32_024, credit: 0 },
      { id: "l-12", accountCode: "2100", accountName: "Accounts Payable", debit: 0, credit: 6_72_500, party: "Allied Metals" },
    ],
  },
  {
    id: "jv-9907",
    voucherNo: "JV/26/0807",
    date: "2026-11-14",
    voucherType: "Credit Note",
    sourceDocument: "CN/26/0142",
    narration: "Sales return - Oceanic Builders",
    totalDebit: 1_14_600,
    totalCredit: 1_14_600,
    status: "posted",
    createdBy: "D. Rao",
    postedBy: "R. Menon",
    lines: [
      { id: "l-13", accountCode: "4300", accountName: "Sales Returns & Discounts", debit: 1_09_143, credit: 0 },
      { id: "l-14", accountCode: "2200", accountName: "Output VAT Payable", debit: 5_457, credit: 0 },
      { id: "l-15", accountCode: "1200", accountName: "Accounts Receivable", debit: 0, credit: 1_14_600, party: "Oceanic Builders" },
    ],
  },
  {
    id: "jv-9906",
    voucherNo: "JV/26/0806",
    date: "2026-11-14",
    voucherType: "Journal Entry",
    narration: "Depreciation for November 2026",
    totalDebit: 3_42_000,
    totalCredit: 3_42_000,
    status: "draft",
    createdBy: "R. Menon",
    lines: [
      { id: "l-16", accountCode: "5500", accountName: "Depreciation", debit: 3_42_000, credit: 0 },
      { id: "l-17", accountCode: "1510", accountName: "Plant & Machinery", debit: 0, credit: 2_64_000 },
      { id: "l-18", accountCode: "1520", accountName: "Office Equipment", debit: 0, credit: 78_000 },
    ],
  },
  {
    id: "jv-9905",
    voucherNo: "JV/26/0805",
    date: "2026-11-14",
    voucherType: "Payment Voucher",
    sourceDocument: "PV/26/0879",
    narration: "Payment to Harbour Logistics - reversed, wrong bank account",
    totalDebit: 4_18_000,
    totalCredit: 4_18_000,
    status: "reversed",
    createdBy: "A. Fernandes",
    postedBy: "R. Menon",
    lines: [
      { id: "l-19", accountCode: "2100", accountName: "Accounts Payable", debit: 4_18_000, credit: 0, party: "Harbour Logistics" },
      { id: "l-20", accountCode: "1120", accountName: "HDFC Bank - Current 4411", debit: 0, credit: 4_18_000 },
    ],
  },
  {
    id: "jv-9904",
    voucherNo: "JV/26/0804",
    date: "2026-11-13",
    voucherType: "Expense Voucher",
    sourceDocument: "EXP/26/0455",
    narration: "Warehouse rent - November",
    totalDebit: 2_62_500,
    totalCredit: 2_62_500,
    status: "posted",
    createdBy: "M. Qureshi",
    postedBy: "R. Menon",
    lines: [
      { id: "l-21", accountCode: "5400", accountName: "Rent & Utilities", debit: 2_50_000, credit: 0 },
      { id: "l-22", accountCode: "1400", accountName: "Input VAT Recoverable", debit: 12_500, credit: 0 },
      { id: "l-23", accountCode: "1120", accountName: "HDFC Bank - Current 4411", debit: 0, credit: 2_62_500 },
    ],
  },
  {
    id: "jv-9903",
    voucherNo: "JV/26/0803",
    date: "2026-11-12",
    voucherType: "Fund Transfer",
    sourceDocument: "FT/26/0118",
    narration: "Transfer from collections account to current account",
    totalDebit: 10_00_000,
    totalCredit: 10_00_000,
    status: "posted",
    createdBy: "A. Fernandes",
    postedBy: "R. Menon",
    lines: [
      { id: "l-24", accountCode: "1120", accountName: "HDFC Bank - Current 4411", debit: 10_00_000, credit: 0 },
      { id: "l-25", accountCode: "1125", accountName: "ICICI Bank - Collections 7702", debit: 0, credit: 10_00_000 },
    ],
  },
];

/** Statement rows for account 1200 Accounts Receivable. */
export const MOCK_LEDGER: LedgerRow[] = [
  { id: "lr-0", date: "2026-11-01", voucherNo: "OPENING", voucherType: "Opening balance", narration: "Balance brought forward", debit: 1_16_42_800, credit: 0, runningBalance: 1_16_42_800 },
  { id: "lr-1", date: "2026-11-03", voucherNo: "SI/26/4372", voucherType: "Sales Invoice", narration: "Summit Electricals - switchgear supply", debit: 9_84_600, credit: 0, runningBalance: 1_26_27_400 },
  { id: "lr-2", date: "2026-11-05", voucherNo: "RCT/26/3288", voucherType: "Customer Receipt", narration: "Northline Retail - NEFT", debit: 0, credit: 6_42_000, runningBalance: 1_19_85_400 },
  { id: "lr-3", date: "2026-11-06", voucherNo: "SI/26/4388", voucherType: "Sales Invoice", narration: "Kinetic Infra Projects - cable drums", debit: 18_62_400, credit: 0, runningBalance: 1_38_47_800 },
  { id: "lr-4", date: "2026-11-08", voucherNo: "CN/26/0139", voucherType: "Credit Note", narration: "Trident Facility Services - rate difference", debit: 0, credit: 84_200, runningBalance: 1_37_63_600 },
  { id: "lr-5", date: "2026-11-10", voucherNo: "RCT/26/3294", voucherType: "Customer Receipt", narration: "Oceanic Builders - cheque 884120", debit: 0, credit: 12_40_000, runningBalance: 1_25_23_600 },
  { id: "lr-6", date: "2026-11-12", voucherNo: "SI/26/4401", voucherType: "Sales Invoice", narration: "Trident Facility Services - annual supply", debit: 11_26_900, credit: 0, runningBalance: 1_36_50_500 },
  { id: "lr-7", date: "2026-11-14", voucherNo: "CN/26/0142", voucherType: "Credit Note", narration: "Oceanic Builders - sales return", debit: 0, credit: 1_14_600, runningBalance: 1_35_35_900 },
  { id: "lr-8", date: "2026-11-15", voucherNo: "RCT/26/3301", voucherType: "Customer Receipt", narration: "Kinetic Infra Projects - RTGS", debit: 0, credit: 15_00_000, runningBalance: 1_20_35_900 },
  { id: "lr-9", date: "2026-11-15", voucherNo: "SI/26/4418", voucherType: "Sales Invoice", narration: "Oceanic Builders - site delivery", debit: 8_64_200, credit: 0, runningBalance: 1_29_00_100 },
  { id: "lr-10", date: "2026-11-15", voucherNo: "RCT/26/3302", voucherType: "Customer Receipt", narration: "Summit Electricals - part payment", debit: 0, credit: 4_13_800, runningBalance: 1_24_86_300 },
];

export const MOCK_CUSTOMERS: Party[] = [
  { id: "cu-18", code: "CU-018", name: "Kinetic Infra Projects", contact: "P. Deshmukh", phone: "+91 98200 14422", outstanding: 34_18_600, overdue: 12_42_100, creditLimit: 40_00_000, creditDays: 45, lastTransactionOn: "2026-11-15", isActive: true },
  { id: "cu-04", code: "CU-004", name: "Oceanic Builders", contact: "S. Nambiar", phone: "+91 98334 77810", outstanding: 26_74_200, overdue: 8_16_400, creditLimit: 30_00_000, creditDays: 30, lastTransactionOn: "2026-11-15", isActive: true },
  { id: "cu-22", code: "CU-022", name: "Summit Electricals", contact: "H. Bhatt", phone: "+91 97020 33451", outstanding: 18_42_900, overdue: 6_88_700, creditLimit: 20_00_000, creditDays: 30, lastTransactionOn: "2026-11-15", isActive: true },
  { id: "cu-09", code: "CU-009", name: "Trident Facility Services", contact: "R. Kulkarni", phone: "+91 99670 21189", outstanding: 12_86_400, overdue: 2_14_300, creditLimit: 15_00_000, creditDays: 60, lastTransactionOn: "2026-11-12", isActive: true },
  { id: "cu-31", code: "CU-031", name: "Northline Retail", contact: "A. Sequeira", phone: "+91 98677 55012", outstanding: 9_64_200, overdue: 0, creditLimit: 12_00_000, creditDays: 15, lastTransactionOn: "2026-11-05", isActive: true },
  { id: "cu-27", code: "CU-027", name: "Vantage Interiors", contact: "K. Pillai", phone: "+91 90040 66123", outstanding: 8_42_100, overdue: 4_18_600, creditLimit: 8_00_000, creditDays: 30, lastTransactionOn: "2026-11-09", isActive: true },
  { id: "cu-12", code: "CU-012", name: "Greenfield Agro Works", contact: "M. Shetty", phone: "+91 93220 88340", outstanding: 7_18_400, overdue: 1_02_200, creditLimit: 10_00_000, creditDays: 45, lastTransactionOn: "2026-11-07", isActive: true },
  { id: "cu-40", code: "CU-040", name: "Harbour Marine Supplies", contact: "J. D'Souza", phone: "+91 98191 40028", outstanding: 4_26_800, overdue: 0, creditLimit: 6_00_000, creditDays: 30, lastTransactionOn: "2026-11-02", isActive: false },
];

export const MOCK_SUPPLIERS: Party[] = [
  { id: "sp-07", code: "SP-007", name: "Vertex Polymers", contact: "T. Menon", phone: "+91 98451 20011", outstanding: 28_42_600, overdue: 6_12_400, creditDays: 45, lastTransactionOn: "2026-11-15", isActive: true },
  { id: "sp-02", code: "SP-002", name: "Allied Metals", contact: "V. Jain", phone: "+91 98104 33027", outstanding: 21_86_400, overdue: 3_42_000, creditDays: 30, lastTransactionOn: "2026-11-14", isActive: true },
  { id: "sp-15", code: "SP-015", name: "Harbour Logistics", contact: "F. Dias", phone: "+91 99302 71140", outstanding: 14_18_200, overdue: 4_18_000, creditDays: 15, lastTransactionOn: "2026-11-14", isActive: true },
  { id: "sp-21", code: "SP-021", name: "Crestline Electricals", contact: "N. Varma", phone: "+91 96540 11822", outstanding: 11_42_800, overdue: 0, creditDays: 30, lastTransactionOn: "2026-11-11", isActive: true },
  { id: "sp-33", code: "SP-033", name: "Pinnacle Packaging", contact: "G. Rane", phone: "+91 90290 54471", outstanding: 8_64_300, overdue: 1_18_900, creditDays: 30, lastTransactionOn: "2026-11-10", isActive: true },
  { id: "sp-09", code: "SP-009", name: "Summit Tooling", contact: "B. Nair", phone: "+91 98220 66039", outstanding: 5_18_400, overdue: 0, creditDays: 45, lastTransactionOn: "2026-11-06", isActive: true },
  { id: "sp-28", code: "SP-028", name: "Orion Chemicals", contact: "L. Dey", phone: "+91 97110 88204", outstanding: 2_42_000, overdue: 0, creditDays: 60, lastTransactionOn: "2026-11-04", isActive: true },
];

export const MOCK_SALES_INVOICES: SalesInvoice[] = [
  { id: "si-4418", number: "SI/26/4418", date: "2026-11-15", dueDate: "2026-12-15", customer: "Oceanic Builders", customerId: "cu-04", invoiceType: "tax", subtotal: 8_23_048, discount: 0, vat: 41_152, total: 8_64_200, received: 0, balance: 8_64_200, status: "posted", salesperson: "D. Rao" },
  { id: "si-4410", number: "SI/26/4410", date: "2026-11-14", dueDate: "2026-12-29", customer: "Kinetic Infra Projects", customerId: "cu-18", invoiceType: "tax", subtotal: 21_09_333, discount: 0, vat: 1_05_467, total: 22_14_800, received: 0, balance: 22_14_800, status: "pending_approval", salesperson: "D. Rao" },
  { id: "si-4401", number: "SI/26/4401", date: "2026-11-12", dueDate: "2027-01-11", customer: "Trident Facility Services", customerId: "cu-09", invoiceType: "tax", subtotal: 10_73_238, discount: 18_000, vat: 53_662, total: 11_26_900, received: 4_00_000, balance: 7_26_900, status: "partially_paid", salesperson: "S. Kapoor" },
  { id: "si-4396", number: "SI/26/4396", date: "2026-11-10", dueDate: "2026-11-25", customer: "Northline Retail", customerId: "cu-31", invoiceType: "cash", subtotal: 3_64_000, discount: 0, vat: 18_200, total: 3_82_200, received: 3_82_200, balance: 0, status: "paid", salesperson: "S. Kapoor" },
  { id: "si-4388", number: "SI/26/4388", date: "2026-11-06", dueDate: "2026-12-21", customer: "Kinetic Infra Projects", customerId: "cu-18", invoiceType: "tax", subtotal: 17_73_714, discount: 0, vat: 88_686, total: 18_62_400, received: 11_00_000, balance: 7_62_400, status: "partially_paid", salesperson: "D. Rao" },
  { id: "si-4372", number: "SI/26/4372", date: "2026-11-03", dueDate: "2026-12-03", customer: "Summit Electricals", customerId: "cu-22", invoiceType: "tax", subtotal: 9_37_714, discount: 0, vat: 46_886, total: 9_84_600, received: 4_13_800, balance: 5_70_800, status: "partially_paid", salesperson: "H. Mathew" },
  { id: "si-4361", number: "SI/26/4361", date: "2026-10-28", dueDate: "2026-11-12", customer: "Vantage Interiors", customerId: "cu-27", invoiceType: "tax", subtotal: 3_98_667, discount: 0, vat: 19_933, total: 4_18_600, received: 0, balance: 4_18_600, status: "overdue", salesperson: "H. Mathew" },
  { id: "si-4348", number: "SI/26/4348", date: "2026-10-22", dueDate: "2026-11-06", customer: "Greenfield Agro Works", customerId: "cu-12", invoiceType: "tax", subtotal: 97_333, discount: 0, vat: 4_867, total: 1_02_200, received: 0, balance: 1_02_200, status: "overdue", salesperson: "S. Kapoor" },
  { id: "si-4339", number: "SI/26/4339", date: "2026-10-18", dueDate: "2026-11-17", customer: "Oceanic Builders", customerId: "cu-04", invoiceType: "tax", subtotal: 17_29_143, discount: 24_000, vat: 86_457, total: 18_15_600, received: 12_40_000, balance: 5_75_600, status: "partially_paid", salesperson: "D. Rao" },
  { id: "si-4330", number: "SI/26/4330", date: "2026-10-15", dueDate: "2026-11-14", customer: "Summit Electricals", customerId: "cu-22", invoiceType: "tax", subtotal: 12_11_619, discount: 0, vat: 60_581, total: 12_72_200, received: 0, balance: 12_72_200, status: "overdue", salesperson: "H. Mathew" },
  { id: "pf-0184", number: "PF/26/0184", date: "2026-11-13", dueDate: "2026-11-27", customer: "Harbour Marine Supplies", customerId: "cu-40", invoiceType: "proforma", subtotal: 6_18_095, discount: 0, vat: 30_905, total: 6_49_000, received: 0, balance: 6_49_000, status: "draft", salesperson: "S. Kapoor" },
  { id: "cn-0142", number: "CN/26/0142", date: "2026-11-14", dueDate: "2026-11-14", customer: "Oceanic Builders", customerId: "cu-04", invoiceType: "credit_note", subtotal: 1_09_143, discount: 0, vat: 5_457, total: 1_14_600, received: 0, balance: 0, status: "posted", salesperson: "D. Rao" },
];

export const MOCK_PURCHASE_INVOICES: PurchaseInvoice[] = [
  { id: "pi-2271", number: "PI/26/2271", supplierRef: "VP-INV-88421", date: "2026-11-15", dueDate: "2026-12-30", supplier: "Vertex Polymers", supplierId: "sp-07", invoiceType: "tax", subtotal: 13_84_000, additionalCharges: 31_400, vat: 70_800, total: 14_86_200, paid: 0, balance: 14_86_200, status: "pending_approval", grnReference: "GRN/26/1872" },
  { id: "pi-2270", number: "PI/26/2270", supplierRef: "AM/8841", date: "2026-11-14", dueDate: "2026-12-14", supplier: "Allied Metals", supplierId: "sp-02", invoiceType: "tax", subtotal: 6_40_476, additionalCharges: 0, vat: 32_024, total: 6_72_500, paid: 0, balance: 6_72_500, status: "posted", grnReference: "GRN/26/1869" },
  { id: "pi-2264", number: "PI/26/2264", supplierRef: "HL-2026-1180", date: "2026-11-11", dueDate: "2026-11-26", supplier: "Harbour Logistics", supplierId: "sp-15", invoiceType: "tax", subtotal: 3_98_095, additionalCharges: 0, vat: 19_905, total: 4_18_000, paid: 0, balance: 4_18_000, status: "overdue" },
  { id: "pi-2258", number: "PI/26/2258", supplierRef: "CE-7742", date: "2026-11-09", dueDate: "2026-12-09", supplier: "Crestline Electricals", supplierId: "sp-21", invoiceType: "tax", subtotal: 10_88_381, additionalCharges: 12_000, vat: 54_419, total: 11_42_800, paid: 5_00_000, balance: 6_42_800, status: "partially_paid", grnReference: "GRN/26/1861" },
  { id: "pi-2249", number: "PI/26/2249", supplierRef: "PP-INV-3310", date: "2026-11-06", dueDate: "2026-12-06", supplier: "Pinnacle Packaging", supplierId: "sp-33", invoiceType: "tax", subtotal: 8_23_143, additionalCharges: 0, vat: 41_157, total: 8_64_300, paid: 0, balance: 8_64_300, status: "posted", grnReference: "GRN/26/1854" },
  { id: "pi-2240", number: "PI/26/2240", supplierRef: "ST-0912", date: "2026-11-03", dueDate: "2026-12-18", supplier: "Summit Tooling", supplierId: "sp-09", invoiceType: "tax", subtotal: 4_93_714, additionalCharges: 8_400, vat: 24_686, total: 5_18_400, paid: 0, balance: 5_18_400, status: "posted", grnReference: "GRN/26/1848" },
  { id: "pi-2231", number: "PI/26/2231", supplierRef: "OC-55210", date: "2026-10-30", dueDate: "2026-12-29", supplier: "Orion Chemicals", supplierId: "sp-28", invoiceType: "tax", subtotal: 2_30_476, additionalCharges: 0, vat: 11_524, total: 2_42_000, paid: 0, balance: 2_42_000, status: "posted", grnReference: "GRN/26/1840" },
  { id: "pi-2224", number: "PI/26/2224", supplierRef: "VP-INV-88102", date: "2026-10-26", dueDate: "2026-12-10", supplier: "Vertex Polymers", supplierId: "sp-07", invoiceType: "tax", subtotal: 12_91_810, additionalCharges: 24_600, vat: 64_590, total: 13_56_400, paid: 7_00_000, balance: 6_56_400, status: "partially_paid", grnReference: "GRN/26/1832" },
  { id: "dn-0066", number: "DN/26/0066", supplierRef: "AM/CR-114", date: "2026-11-08", dueDate: "2026-11-08", supplier: "Allied Metals", supplierId: "sp-02", invoiceType: "debit_note", subtotal: 1_18_095, additionalCharges: 0, vat: 5_905, total: 1_24_000, paid: 0, balance: 0, status: "posted" },
];

export const MOCK_RECEIPTS: PaymentDocument[] = [
  { id: "rct-3302", number: "RCT/26/3302", date: "2026-11-15", party: "Summit Electricals", mode: "bank_transfer", instrumentRef: "NEFT-884102", account: "HDFC Bank - Current 4411", amount: 4_13_800, allocated: 4_13_800, unallocated: 0, status: "posted" },
  { id: "rct-3301", number: "RCT/26/3301", date: "2026-11-15", party: "Kinetic Infra Projects", mode: "bank_transfer", instrumentRef: "RTGS-220934", account: "HDFC Bank - Current 4411", amount: 15_00_000, allocated: 15_00_000, unallocated: 0, status: "posted" },
  { id: "rct-3294", number: "RCT/26/3294", date: "2026-11-10", party: "Oceanic Builders", mode: "cheque", instrumentRef: "884120", account: "ICICI Bank - Collections 7702", amount: 12_40_000, allocated: 12_40_000, unallocated: 0, status: "posted" },
  { id: "rct-3288", number: "RCT/26/3288", date: "2026-11-05", party: "Northline Retail", mode: "bank_transfer", instrumentRef: "NEFT-771220", account: "ICICI Bank - Collections 7702", amount: 6_42_000, allocated: 3_82_200, unallocated: 2_59_800, status: "posted" },
  { id: "rct-3280", number: "RCT/26/3280", date: "2026-11-02", party: "Trident Facility Services", mode: "cash", account: "Cash in Hand", amount: 4_00_000, allocated: 4_00_000, unallocated: 0, status: "posted" },
];

export const MOCK_PAYMENTS: PaymentDocument[] = [
  { id: "pv-0881", number: "PV/26/0881", date: "2026-11-15", party: "Harbour Logistics", mode: "bank_transfer", instrumentRef: "NEFT-990214", account: "HDFC Bank - Current 4411", amount: 6_42_000, allocated: 4_18_000, unallocated: 2_24_000, status: "pending_approval" },
  { id: "pv-0880", number: "PV/26/0880", date: "2026-11-13", party: "Crestline Electricals", mode: "cheque", instrumentRef: "551402", account: "HDFC Bank - Current 4411", amount: 5_00_000, allocated: 5_00_000, unallocated: 0, status: "posted" },
  { id: "pv-0879", number: "PV/26/0879", date: "2026-11-14", party: "Harbour Logistics", mode: "bank_transfer", instrumentRef: "NEFT-990180", account: "HDFC Bank - Current 4411", amount: 4_18_000, allocated: 4_18_000, unallocated: 0, status: "reversed" },
  { id: "pv-0874", number: "PV/26/0874", date: "2026-11-09", party: "Vertex Polymers", mode: "bank_transfer", instrumentRef: "RTGS-118840", account: "HDFC Bank - Current 4411", amount: 7_00_000, allocated: 7_00_000, unallocated: 0, status: "posted" },
  { id: "pv-0869", number: "PV/26/0869", date: "2026-11-04", party: "Pinnacle Packaging", mode: "cash", account: "Petty Cash - Head Office", amount: 42_000, allocated: 42_000, unallocated: 0, status: "posted" },
];

export const MOCK_CASH_BANK_ACCOUNTS: CashBankAccount[] = [
  { id: "cb-01", name: "HDFC Bank - Current 4411", kind: "bank", institution: "HDFC Bank", accountNumberMasked: "XXXX 4411", balance: 62_84_200, unreconciledCount: 7, lastReconciledOn: "2026-10-31" },
  { id: "cb-02", name: "ICICI Bank - Collections 7702", kind: "bank", institution: "ICICI Bank", accountNumberMasked: "XXXX 7702", balance: 19_97_600, unreconciledCount: 3, lastReconciledOn: "2026-10-31" },
  { id: "cb-03", name: "Cash in Hand", kind: "cash", balance: 3_18_400, unreconciledCount: 0 },
  { id: "cb-04", name: "Petty Cash - Head Office", kind: "petty_cash", balance: 42_300, unreconciledCount: 0 },
];

export const MOCK_CASH_BANK_ENTRIES: CashBankEntry[] = [
  { id: "cbe-01", date: "2026-11-01", reference: "OPENING", entryType: "receipt", particulars: "Opening balance", inflow: 48_10_000, outflow: 0, runningBalance: 48_10_000, reconciled: true },
  { id: "cbe-02", date: "2026-11-04", reference: "PV/26/0869", entryType: "payment", particulars: "Pinnacle Packaging - part settlement", inflow: 0, outflow: 42_000, runningBalance: 47_68_000, reconciled: true },
  { id: "cbe-03", date: "2026-11-05", reference: "RCT/26/3288", entryType: "receipt", particulars: "Northline Retail - NEFT", inflow: 6_42_000, outflow: 0, runningBalance: 54_10_000, reconciled: true },
  { id: "cbe-04", date: "2026-11-09", reference: "PV/26/0874", entryType: "payment", particulars: "Vertex Polymers - RTGS", inflow: 0, outflow: 7_00_000, runningBalance: 47_10_000, reconciled: true },
  { id: "cbe-05", date: "2026-11-10", reference: "RCT/26/3294", entryType: "receipt", particulars: "Oceanic Builders - cheque 884120", inflow: 12_40_000, outflow: 0, runningBalance: 59_50_000, reconciled: false },
  { id: "cbe-06", date: "2026-11-12", reference: "FT/26/0118", entryType: "transfer", particulars: "Transfer from collections account", inflow: 10_00_000, outflow: 0, runningBalance: 69_50_000, reconciled: false },
  { id: "cbe-07", date: "2026-11-13", reference: "PV/26/0880", entryType: "payment", particulars: "Crestline Electricals - cheque 551402", inflow: 0, outflow: 5_00_000, runningBalance: 64_50_000, reconciled: false },
  { id: "cbe-08", date: "2026-11-13", reference: "EXP/26/0455", entryType: "payment", particulars: "Warehouse rent - November", inflow: 0, outflow: 2_62_500, runningBalance: 61_87_500, reconciled: false },
  { id: "cbe-09", date: "2026-11-14", reference: "BANK-CHG", entryType: "charge", particulars: "Bank charges and RTGS fees", inflow: 0, outflow: 3_100, runningBalance: 61_84_400, reconciled: false },
  { id: "cbe-10", date: "2026-11-15", reference: "RCT/26/3301", entryType: "receipt", particulars: "Kinetic Infra Projects - RTGS", inflow: 15_00_000, outflow: 0, runningBalance: 76_84_400, reconciled: false },
  { id: "cbe-11", date: "2026-11-15", reference: "PV/26/0881", entryType: "payment", particulars: "Harbour Logistics - pending approval", inflow: 0, outflow: 6_42_000, runningBalance: 70_42_400, reconciled: false },
  { id: "cbe-12", date: "2026-11-15", reference: "ADJ-BANK", entryType: "payment", particulars: "Cheque 884102 presented and cleared", inflow: 0, outflow: 7_58_200, runningBalance: 62_84_200, reconciled: false },
];

export const MOCK_EXPENSES: ExpenseVoucher[] = [
  { id: "exp-0461", number: "EXP/26/0461", date: "2026-11-15", category: "Travel & Conveyance", department: "Sales", paidFrom: "Petty Cash - Head Office", amount: 18_400, vat: 920, total: 19_320, status: "pending_approval", recurring: false, attachments: 2, requestedBy: "S. Kapoor" },
  { id: "exp-0459", number: "EXP/26/0459", date: "2026-11-14", category: "Vehicle & Fuel", department: "Logistics", paidFrom: "Cash in Hand", amount: 42_600, vat: 2_130, total: 44_730, status: "posted", recurring: false, attachments: 1, requestedBy: "M. Qureshi" },
  { id: "exp-0455", number: "EXP/26/0455", date: "2026-11-13", category: "Rent", department: "Warehouse", paidFrom: "HDFC Bank - Current 4411", amount: 2_50_000, vat: 12_500, total: 2_62_500, status: "posted", recurring: true, attachments: 1, requestedBy: "M. Qureshi" },
  { id: "exp-0452", number: "EXP/26/0452", date: "2026-11-11", category: "Utilities", department: "Warehouse", paidFrom: "HDFC Bank - Current 4411", amount: 86_400, vat: 4_320, total: 90_720, status: "posted", recurring: true, attachments: 3, requestedBy: "M. Qureshi" },
  { id: "exp-0448", number: "EXP/26/0448", date: "2026-11-09", category: "Repairs & Maintenance", department: "Warehouse", paidFrom: "Cash in Hand", amount: 64_200, vat: 3_210, total: 67_410, status: "posted", recurring: false, attachments: 2, requestedBy: "S. Iyer" },
  { id: "exp-0444", number: "EXP/26/0444", date: "2026-11-07", category: "Professional Fees", department: "Finance", paidFrom: "HDFC Bank - Current 4411", amount: 1_20_000, vat: 6_000, total: 1_26_000, status: "posted", recurring: false, attachments: 1, requestedBy: "R. Menon" },
  { id: "exp-0440", number: "EXP/26/0440", date: "2026-11-05", category: "Office Supplies", department: "Administration", paidFrom: "Petty Cash - Head Office", amount: 12_800, vat: 640, total: 13_440, status: "posted", recurring: false, attachments: 1, requestedBy: "A. Fernandes" },
  { id: "exp-0436", number: "EXP/26/0436", date: "2026-11-03", category: "Marketing", department: "Sales", paidFrom: "HDFC Bank - Current 4411", amount: 2_18_000, vat: 10_900, total: 2_28_900, status: "draft", recurring: false, attachments: 0, requestedBy: "D. Rao" },
];

export const MOCK_VAT_BOXES: VatBox[] = [
  { code: "1a", label: "Standard-rated sales", amount: 1_86_42_000, vatAmount: 9_32_100, treatment: "standard" },
  { code: "1b", label: "Zero-rated sales (exports)", amount: 18_42_000, vatAmount: 0, treatment: "zero_rated" },
  { code: "1c", label: "Exempt sales", amount: 4_18_000, vatAmount: 0, treatment: "exempt" },
  { code: "2a", label: "Standard-rated purchases", amount: 1_32_18_500, vatAmount: 6_60_925, treatment: "standard" },
  { code: "2b", label: "Reverse-charge imports", amount: 12_84_000, vatAmount: 64_200, treatment: "reverse_charge" },
  { code: "2c", label: "Purchases without input credit", amount: 3_42_000, vatAmount: 0, treatment: "exempt" },
];

export const MOCK_VAT_PERIODS: VatReturnPeriod[] = [
  { id: "vp-06", label: "Oct - Nov 2026", startDate: "2026-10-01", endDate: "2026-11-30", dueDate: "2026-11-28", outputVat: 9_32_100, inputVat: 6_60_925, netPayable: 2_71_175, status: "open" },
  { id: "vp-05", label: "Aug - Sep 2026", startDate: "2026-08-01", endDate: "2026-09-30", dueDate: "2026-10-28", outputVat: 8_64_200, inputVat: 6_12_400, netPayable: 2_51_800, status: "filed" },
  { id: "vp-04", label: "Jun - Jul 2026", startDate: "2026-06-01", endDate: "2026-07-31", dueDate: "2026-08-28", outputVat: 8_18_600, inputVat: 5_84_200, netPayable: 2_34_400, status: "filed" },
  { id: "vp-03", label: "Apr - May 2026", startDate: "2026-04-01", endDate: "2026-05-31", dueDate: "2026-06-28", outputVat: 7_92_400, inputVat: 5_42_100, netPayable: 2_50_300, status: "filed" },
];

export const MOCK_TAX_CODES: TaxCode[] = [
  { code: "SR5", label: "Standard rated 5%", ratePct: 5, treatment: "standard", appliesTo: "Sales and purchases", isActive: true },
  { code: "ZR0", label: "Zero rated - exports", ratePct: 0, treatment: "zero_rated", appliesTo: "Export sales", isActive: true },
  { code: "EX0", label: "Exempt supply", ratePct: 0, treatment: "exempt", appliesTo: "Exempt sales", isActive: true },
  { code: "RC5", label: "Reverse charge 5%", ratePct: 5, treatment: "reverse_charge", appliesTo: "Imported services", isActive: true },
  { code: "NR0", label: "Out of scope", ratePct: 0, treatment: "exempt", appliesTo: "Non-business items", isActive: true },
  { code: "SR5C", label: "Standard rated 5% - capital goods", ratePct: 5, treatment: "standard", appliesTo: "Fixed asset purchases", isActive: false },
];

export const MOCK_TRIAL_BALANCE: TrialBalanceRow[] = [
  { accountCode: "1110", accountName: "Cash in Hand", type: "asset", openingDebit: 2_40_000, openingCredit: 0, periodDebit: 4_18_400, periodCredit: 3_40_000, closingDebit: 3_18_400, closingCredit: 0 },
  { accountCode: "1115", accountName: "Petty Cash - Head Office", type: "asset", openingDebit: 60_000, openingCredit: 0, periodDebit: 40_000, periodCredit: 57_700, closingDebit: 42_300, closingCredit: 0 },
  { accountCode: "1120", accountName: "HDFC Bank - Current 4411", type: "asset", openingDebit: 48_10_000, openingCredit: 0, periodDebit: 37_42_000, periodCredit: 22_67_800, closingDebit: 62_84_200, closingCredit: 0 },
  { accountCode: "1125", accountName: "ICICI Bank - Collections 7702", type: "asset", openingDebit: 14_80_000, openingCredit: 0, periodDebit: 18_82_000, periodCredit: 13_64_400, closingDebit: 19_97_600, closingCredit: 0 },
  { accountCode: "1200", accountName: "Accounts Receivable", type: "asset", openingDebit: 1_16_42_800, openingCredit: 0, periodDebit: 48_38_100, periodCredit: 39_94_600, closingDebit: 1_24_86_300, closingCredit: 0 },
  { accountCode: "1300", accountName: "Inventory", type: "asset", openingDebit: 2_32_60_000, openingCredit: 0, periodDebit: 41_82_600, periodCredit: 33_35_800, closingDebit: 2_41_06_800, closingCredit: 0 },
  { accountCode: "1400", accountName: "Input VAT Recoverable", type: "asset", openingDebit: 5_20_000, openingCredit: 0, periodDebit: 6_60_925, periodCredit: 5_20_000, closingDebit: 6_60_925, closingCredit: 0 },
  { accountCode: "1510", accountName: "Plant & Machinery", type: "asset", openingDebit: 32_80_000, openingCredit: 0, periodDebit: 11_10_400, periodCredit: 2_64_000, closingDebit: 41_26_400, closingCredit: 0 },
  { accountCode: "1520", accountName: "Office Equipment", type: "asset", openingDebit: 11_60_000, openingCredit: 0, periodDebit: 4_67_300, periodCredit: 78_000, closingDebit: 15_49_300, closingCredit: 0 },
  { accountCode: "2100", accountName: "Accounts Payable", type: "liability", openingDebit: 0, openingCredit: 88_60_000, periodDebit: 28_42_100, periodCredit: 31_96_800, closingDebit: 0, closingCredit: 92_14_700 },
  { accountCode: "2200", accountName: "Output VAT Payable", type: "liability", openingDebit: 0, openingCredit: 7_80_000, periodDebit: 7_80_000, periodCredit: 9_32_100, closingDebit: 0, closingCredit: 9_32_100 },
  { accountCode: "2300", accountName: "Accrued Expenses", type: "liability", openingDebit: 0, openingCredit: 6_40_000, periodDebit: 2_18_400, periodCredit: 3_97_050, closingDebit: 0, closingCredit: 8_18_650 },
  { accountCode: "2400", accountName: "Short-term Borrowings", type: "liability", openingDebit: 0, openingCredit: 81_40_000, periodDebit: 4_16_300, periodCredit: 15_00_000, closingDebit: 0, closingCredit: 92_23_700 },
  { accountCode: "3100", accountName: "Share Capital", type: "equity", openingDebit: 0, openingCredit: 1_50_00_000, periodDebit: 0, periodCredit: 0, closingDebit: 0, closingCredit: 1_50_00_000 },
  { accountCode: "3200", accountName: "Retained Earnings", type: "equity", openingDebit: 0, openingCredit: 40_00_000, periodDebit: 0, periodCredit: 14_18_000, closingDebit: 0, closingCredit: 54_18_000 },
  { accountCode: "4100", accountName: "Sales - Goods", type: "income", openingDebit: 0, openingCredit: 12_32_18_000, periodDebit: 0, periodCredit: 1_86_42_000, closingDebit: 0, closingCredit: 14_18_60_000 },
  { accountCode: "4200", accountName: "Sales - Services", type: "income", openingDebit: 0, openingCredit: 64_18_000, periodDebit: 0, periodCredit: 8_22_000, closingDebit: 0, closingCredit: 72_40_000 },
  { accountCode: "4300", accountName: "Sales Returns & Discounts", type: "income", openingDebit: 3_43_400, openingCredit: 0, periodDebit: 1_14_600, periodCredit: 0, closingDebit: 4_58_000, closingCredit: 0 },
  { accountCode: "5100", accountName: "Cost of Goods Sold", type: "expense", openingDebit: 10_12_18_000, openingCredit: 0, periodDebit: 1_36_42_000, periodCredit: 0, closingDebit: 11_48_60_000, closingCredit: 0 },
  { accountCode: "5200", accountName: "Freight & Logistics", type: "expense", openingDebit: 61_24_100, openingCredit: 0, periodDebit: 7_18_000, periodCredit: 0, closingDebit: 68_42_100, closingCredit: 0 },
  { accountCode: "5300", accountName: "Salaries & Wages", type: "expense", openingDebit: 77_60_000, openingCredit: 0, periodDebit: 7_00_000, periodCredit: 0, closingDebit: 84_60_000, closingCredit: 0 },
  { accountCode: "5400", accountName: "Rent & Utilities", type: "expense", openingDebit: 19_31_000, openingCredit: 0, periodDebit: 3_53_200, periodCredit: 0, closingDebit: 22_84_200, closingCredit: 0 },
  { accountCode: "5500", accountName: "Depreciation", type: "expense", openingDebit: 14_30_000, openingCredit: 0, periodDebit: 3_42_000, periodCredit: 0, closingDebit: 17_72_000, closingCredit: 0 },
];

export const MOCK_REPORTS: ReportDefinition[] = [
  { id: "rp-tb", name: "Trial balance", description: "Opening, period movement and closing balances for every ledger account.", category: "Financial", phase: "mvp", lastRunOn: "2026-11-15", href: "/accounting/financial-reporting" },
  { id: "rp-pl", name: "Profit & loss", description: "Income, cost of sales and operating expenses for the selected period.", category: "Financial", phase: "mvp", lastRunOn: "2026-11-14" },
  { id: "rp-bs", name: "Balance sheet", description: "Assets, liabilities and equity as at a date.", category: "Financial", phase: "mvp", lastRunOn: "2026-11-14" },
  { id: "rp-cf", name: "Cash flow statement", description: "Operating, investing and financing movements.", category: "Financial", phase: "phase2" },
  { id: "rp-gl", name: "General ledger", description: "Account statement with running balance and voucher references.", category: "Financial", phase: "mvp", lastRunOn: "2026-11-15", href: "/accounting/general-ledger" },
  { id: "rp-ar", name: "Receivable ageing", description: "Customer outstanding split into 30/60/90/90+ buckets.", category: "Receivable & Payable", phase: "mvp", lastRunOn: "2026-11-15", href: "/accounting/accounts-receivable" },
  { id: "rp-ap", name: "Payable ageing", description: "Supplier outstanding split into 30/60/90/90+ buckets.", category: "Receivable & Payable", phase: "mvp", lastRunOn: "2026-11-15", href: "/accounting/accounts-payable" },
  { id: "rp-stmt", name: "Customer / supplier statement", description: "Party statement of account for a date range, ready for PDF.", category: "Receivable & Payable", phase: "mvp" },
  { id: "rp-sr", name: "Sales register", description: "All sales invoices with tax split and payment status.", category: "Registers", phase: "mvp", lastRunOn: "2026-11-15", href: "/accounting/sales-invoicing" },
  { id: "rp-pr", name: "Purchase register", description: "All purchase invoices with landed cost and tax split.", category: "Registers", phase: "mvp", lastRunOn: "2026-11-15", href: "/accounting/purchase-invoicing" },
  { id: "rp-cb", name: "Cash & bank book", description: "Day book of receipts, payments and transfers per account.", category: "Registers", phase: "mvp", href: "/accounting/cash-bank" },
  { id: "rp-vat", name: "VAT return and transaction report", description: "Return boxes with the transactions behind each figure.", category: "Tax", phase: "limited", lastRunOn: "2026-11-15", href: "/accounting/tax-vat" },
];
