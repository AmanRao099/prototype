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

## How the navigation is arranged

The workbook lists its 29 modules in three categories. That is the right inventory of
scope and the wrong menu — it separates "Stock Inward" from the purchase invoice it
follows and mixes daily screens with administration. The sidebar is therefore arranged by
workflow, and the workbook mapping lives on the All modules page:

| Section | Modules |
| --- | --- |
| **Sell** | Invoices · Deliveries · Customer balances |
| **Buy** | Goods receipts · Supplier bills · Supplier balances |
| **Stock** | Items · Warehouses · Transfers · Adjustments · Valuation · Stock alerts |
| **Accounting** | Chart of accounts · General ledger · Cash & bank · Expenses · Tax & VAT |
| **Reports** | Financial reports · Inventory reports |
| **Workflow** | Approvals · Notifications · Documents · Audit trail |
| **Settings** (hub at `/settings`) | Company settings · Users & roles · Import & export · Companies & branches · Backup & security |

- Only the section you are in is expanded, so the menu shows about eight links instead of
  twenty-nine; opening or closing a section by hand overrides that for the session.
- **Ctrl/Cmd-K** opens a jump-to-module palette that searches all 29 modules by menu label,
  workbook name or keyword — this is what lets the sidebar stay short.
- `/modules` lists every module twice: by workflow section and by workbook category, each
  with its transcribed feature list and delivery phase, so scope can still be checked
  against the proposal.
- Route paths were not changed by the regrouping; `src/lib/nav.ts` is the single registry
  and carries `moduleName`, `workbookCategory` and `app` for every entry.

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

## Phase 2 — functional completion (front end)

The proposal's Phase 2 list is built, on the same mock-data contract as Phase 1:

| Item | Where | What it does |
| --- | --- | --- |
| Advanced bank reconciliation | `/accounting/bank-reconciliation` | Statement import, automatic match suggestions (by reference, by amount and date, by amount), manual matching, uncleared cheques and deposits in transit, unbooked bank items, and the signed-off working. Matching explains the gap between bank and books; the working only reaches nil when every line is classified. |
| Deeper financial reports | `/accounting/financial-reporting` | Profit & loss, balance sheet and cash flow (indirect) **derived from the trial balance** in `src/lib/statements.ts`, plus ageing analytics with a party × bucket matrix, DSO and DPO. A statement cannot disagree with the ledger it came from. |
| Expanded VAT configuration | `/accounting/tax-vat` | Tax determination rules evaluated in priority order (party location × item class × place of supply → tax code) and VAT adjustments: bad-debt relief, credit notes, corrections, annual true-ups. |
| Costing enhancements | `/inventory/valuation` | Standard-cost variance with the exposure held in stock, revaluation runs with their P&L impact, and landed-cost apportionment across shipments by value, weight or quantity. |
| Batch, serial and expiry | `/inventory/traceability` | Batch register with shelf life, quarantine and value at risk; serial register with warranty and customer; and a full movement trace per batch from receipt to write-off. |
| Richer approvals | `/system/approvals` | Delegation with scope and date window, plus full approval history: every level, the approver, any delegate who acted for them, the comment and the elapsed time. |
| Document search and audit detail | `/system/documents`, `/system/audit-trail` | Tag-aware search and version history with change notes; audit events expand to a field-level before/after diff. |

Still open from the roadmap: expense-management depth (recurring schedules, department budgets) and
Phase 3 multi-company consolidation.

## Visual language

The platform follows an Apple-style grammar: minimal chrome, soft corners, one accent.

- **One accent.** Action Blue (`--accent`, #0066cc; #2997ff on dark) carries every
  interactive element - links, the `+ New` button, the selected nav row, the focus ring.
  There is no second brand colour. Chart series keep their own validated palette.
- **Surfaces, not shadows.** White panels on a parchment plane (#f5f5f7; pure black with
  #1c1c1e panels in dark mode). `--shadow-panel` is `none`: only floating layers - menus,
  the command palette - lift, and the sidebar and top bar are frosted
  (`.frosted`, `saturate(180%) blur(20px)`).
- **One corner grammar.** The radius ladder lives in `@theme` and every `rounded-*`
  utility resolves through it: 8px compact utility, 11px controls and menu rows, 13px
  nav rows, 18px panels and cards, 22px the command palette, full pill for buttons,
  search fields, tabs and badges. Nothing in between.
- **SF Pro where it exists.** `-apple-system` leads the font stack so Apple platforms get
  the real face and everywhere else falls back to Inter; display sizes carry negative
  tracking (-0.019 to -0.024em) and body copy keeps editorial leading.
- **The press gesture.** Every button and tab settles to `scale(0.97)` while held, and
  drops that under `prefers-reduced-motion`.
- **Labels in sentence case.** Table headers and eyebrows are quiet 11.5px ink-muted text,
  not shouted micro-caps.

## Layout and density rules

Every screen is built from the same four parts, in the same order, with one rhythm
(`page-stack`, 24px between blocks):

1. **Header** — title, one short line of context, a `Scope` disclosure and actions.
   The workbook's full feature list and any delivery caveat live inside `Scope`, read from
   the module registry, so no page carries a 140-character subtitle or a stack of badges.
2. **Figures** — `SummaryStrip`: one rounded card, divided by hairlines, carrying the
   four numbers that summarise the register below.
3. **Panels** — bordered surfaces holding a toolbar plus a table, or a chart.
4. **Tables** — sticky header, hairline rules, tabular figures, hover tint, no zebra.

Other rules that keep it calm:

- **One primary action per screen.** Everything else folds into the header's overflow menu.
- **Status is a dot plus a word**, never a saturated chip; only states that demand action
  (overdue, reversed) take coloured text.
- **The top bar holds one context control.** Company, branch and financial year are a
  single posting context in one chip; document creation is one `+ New` menu.
- **Type roles, not ad-hoc sizes:** `t-page-title`, `t-panel-title`, `t-eyebrow`,
  `t-figure`, `t-figure-sm`, `t-caption` are defined once in `globals.css`.

## On a phone

The registers are the hard part: a nine-column invoice table cannot shrink, so below
`md` it stops being a table.

- **Registers become cards.** `DataTable` renders one card per record from the same
  column definitions - first column as the title, the last money column as the headline
  figure on the right, the rest as label/value pairs, and any action column at the foot.
  From `md` up it is the table again. A column that is reference-only on a phone can opt
  out with `hideOnCard`.
  The totals row ships with the table; on a phone the figures above the register carry it.
- **Touch targets.** Controls are 40px tall below `sm` and 44px in the navigation drawer,
  dropping to the 34px desktop size only once there is a pointer-sized screen.
- **No accidental zoom.** Inputs render at 16px below `sm`, because iOS zooms the page
  when a smaller field takes focus.
- **Rows that scroll instead of wrapping.** Filter chips and the tab strip scroll
  horizontally with the scrollbar hidden (`.no-scrollbar`); menus are capped at a share of
  the viewport rather than a fixed pixel width.
- **Charts re-measure.** Below 440px the axis gutter narrows, end-of-line value labels drop
  (the legend and the tooltip still name every series) and x labels thin out to whatever
  fits, so the plot keeps its width.
- **Safe areas.** The drawer and the page bottom respect `env(safe-area-inset-*)`.
- Hand-rolled tables that are not registers - the permission matrix, the audit field diff -
  sit in a scroll container with a minimum width rather than squeezing.

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
