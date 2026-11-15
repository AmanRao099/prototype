# ERP front end — Phase 1

Front end for the ERP delivery proposal (*Accounts, Inventory & Common System Modules*,
29 modules from `Accounts & Inventory Modules.xlsx`). This slice is the **application shell
and the Dashboard module**; the remaining module screens follow the 30-day schedule in the
proposal.

## Stack

As specified in the proposal (§3 Recommended technical architecture):

| Layer | Used here |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Turbopack) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4 with CSS custom-property design tokens |
| Icons | lucide-react |
| Charts | Hand-built inline SVG (no chart dependency) |
| Backend (next phase) | Django 5 + DRF + PostgreSQL, consumed over REST |

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npx tsc --noEmit   # typecheck
npx eslint .       # lint
```

The UI runs on typed mock data until the API exists. Point it at Django with:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

With that set, `src/lib/api/client.ts` calls the real endpoints instead and the
“Sample data” badge disappears. No component imports mock data directly.

## Planned API contract

| Endpoint | Returns |
| --- | --- |
| `GET /api/common/session/` | `{ user, company }` — company, branches, financial years, role |
| `GET /api/reporting/dashboard/?period=mtd\|last30\|qtd\|fytd` | `DashboardData` (see `src/lib/types.ts`) |

Money crosses the wire as a **decimal string** (Django `DecimalField`) and is never parsed
into a float for arithmetic in the UI — formatting only.

## Layout of the code

```
src/
  app/
    layout.tsx                  root shell, fonts, pre-paint theme stamp
    (erp)/layout.tsx            sidebar + topbar, loads session
    (erp)/dashboard/page.tsx    Dashboard module
    (erp)/[...segments]/page.tsx  placeholder for modules not built yet
  components/
    layout/                     sidebar, topbar, theme toggle, icon registry
    charts/                     line, grouped bar, ranked bars, sparkline, tooltip, table view
    dashboard/                  KPI tiles, panels, queues, tables
    ui/                         panel, badge, status chip
  lib/
    api/client.ts               single data-access boundary
    nav.ts                      all 29 workbook modules + delivery phase
    config.ts                   product name, locale, currency, API base URL
    format.ts                   INR money, quantity, date formatting
    types.ts                    API contract types
    mock/                       sample payloads, removed once the API lands
```

## Dashboard contents

Covers the workbook’s Dashboard module — *financial overview; sales/purchase summary;
receivables/payables; stock summary and alerts*:

- eight KPI tiles (cash & bank, receivables, payables, stock value, sales, purchases,
  gross profit, net VAT) with period deltas and sparklines
- sales vs purchases by month, one value axis, crosshair tooltip, keyboard steppable
- accounting controls: trial-balance equality, unposted journals, VAT position and due date
- receivables/payables ageing buckets, stock value by warehouse, 7-day stock movement
- inventory alerts, pending approvals, recent postings, customer credit exposure
- period filter (MTD / last 30 days / QTD / FY to date) held in the URL

## Accounting & Finance screens

All ten workbook modules in the category have a screen. Each page is a server component
that loads data through `src/lib/api/client.ts` and hands it to a client view that owns
search, filters and tabs.

| Route | Screen |
| --- | --- |
| `/accounting/chart-of-accounts` | Hierarchical account list, type/scope filters, opening and closing Dr/Cr |
| `/accounting/general-ledger` | Journal vouchers with line-level detail and the debit=credit check; account statement with running balance |
| `/accounting/accounts-receivable` | Customer exposure, ageing buckets, customer list with credit-limit use, open invoices |
| `/accounting/accounts-payable` | Supplier exposure, ageing, due-in-7-days, open supplier bills |
| `/accounting/sales-invoicing` | Sales register: tax/cash/proforma/credit note, VAT, balance, status, PDF action |
| `/accounting/purchase-invoicing` | Purchase register with supplier reference, GRN matching, additional charges, input VAT |
| `/accounting/cash-bank` | Account switcher, cash/bank book with running balance and reconciliation state, receipt and payment vouchers |
| `/accounting/expenses` | Expense register, spend by category and department (Phase 2 module, shown with its scope) |
| `/accounting/tax-vat` | Return workings by box, tax codes, filing history, net payable and due date |
| `/accounting/financial-reporting` | Trial balance with totals and balance check, P&L and balance-sheet summaries, report catalogue |

Shared pieces live in `src/components/ui` (`DataTable`, `Toolbar`, `Tabs`, `SummaryStrip`,
`PageHeader`, `StatusPill`) and `src/components/accounting/party-ledger-view.tsx`, which
serves both receivable and payable.

## Inventory & Stock screens

All nine workbook modules in the category have a screen, built on the same server-page +
client-view split and the same shared components.

| Route | Screen |
| --- | --- |
| `/inventory/items` | Item master: SKU, barcode, units and conversions, prices, tracking mode, on hand / reserved / available, reorder level |
| `/inventory/warehouses` | Locations and bins, stock value and space utilisation per warehouse, in-transit holding |
| `/inventory/stock-inward` | Goods receipts: purchase receipt, direct entry, opening stock, sales return; batch/serial flag; quantity and value |
| `/inventory/stock-outward` | Stock issues: sales delivery, internal consumption, damage, samples; cost of goods issued; reservations |
| `/inventory/stock-transfer` | Transfer requests, dispatch, in-transit and receipt confirmation with dates |
| `/inventory/stock-adjustment` | Positive/negative adjustments with reason, authoriser and net value impact |
| `/inventory/valuation` | Weighted-average and FIFO side by side, landed cost, closing value, reconciliation to the control account |
| `/inventory/alerts` | Low stock, reorder, expiry, negative stock, overstock, non-moving, reservation conflicts |
| `/inventory/reporting` | Stock ledger with running quantity and value, plus the inventory report catalogue |

## Common System screens

| Route | Screen |
| --- | --- |
| `/system/users-roles` | User list with role, branch scope, 2FA and sign-in state; role list with a module × action permission matrix |
| `/system/approvals` | Live approval queue with approve/reject, plus the rule set (conditions, multi-level chains, delegation) |
| `/system/audit-trail` | Who did what, when and from where: action, module, record, changed-field count, IP |
| `/system/documents` | Attachment register with module, linked document, size, uploader and access level |
| `/system/notifications` | In-app and email alerts by category, read/unread, severity |
| `/system/configuration` | Company profile, financial years and locking, tax defaults, numbering series, currencies, master-data links |
| `/system/import-export` | Import templates, export catalogue, import-run history with row-level pass/fail |
| `/system/multi-company` | Group entities, branch structure, and what Phase 1 does and does not consolidate |
| `/system/backup-security` | Backup history with retention and restore tests, plus the security-control posture |

All 29 workbook modules now have a screen (28 module routes plus the dashboard). The catch-all
scope page stays as a safety net for unknown routes.

## Conventions worth keeping

- **Design tokens only.** Colours come from `globals.css` custom properties; dark mode is a
  selected palette, not an inverted one.
- **Charts.** One value axis per chart (never dual-axis), fixed categorical hue order, status
  colours reserved for status, every chart carries a legend for 2+ series and a data-table
  disclosure for the accessibility/print path.
- **Money.** `formatMoney*` helpers only; never `toLocaleString` inline.
- **Navigation is the module registry.** `src/lib/nav.ts` carries every workbook module, its
  transcribed feature list and its delivery phase (`P1`, `P1 ltd`, `P2`), so unbuilt screens
  render a scope page instead of a 404.

## Not built yet (next steps)

1. Authentication screens and JWT handling against Django SimpleJWT.
2. Master-data screens (items, warehouses, customers, suppliers, chart of accounts).
3. Transaction screens (invoices, receipts/payments, GRN, stock issue, transfer, adjustment).
4. Report screens (trial balance, P&L, stock ledger) and invoice PDF preview.
5. Replace mock data with live endpoints; add loading and error states per route.
