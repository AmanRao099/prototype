import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Save } from "lucide-react";
import { ConfigurationView } from "./configuration-view";
import { Badge } from "@/components/ui/badge";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { getSession, getSystemSettings } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "System Configuration" };

export const instant = false;

const MASTER_DATA = [
  { label: "Chart of accounts", href: "/accounting/chart-of-accounts", note: "30 accounts, 23 postable" },
  { label: "Tax codes", href: "/accounting/tax-vat", note: "6 codes, 5 active" },
  { label: "Customers", href: "/accounting/accounts-receivable", note: "8 on file" },
  { label: "Suppliers", href: "/accounting/accounts-payable", note: "7 on file" },
  { label: "Items", href: "/inventory/items", note: "1,284 SKUs" },
  { label: "Warehouses", href: "/inventory/warehouses", note: "6 locations" },
];

export default async function ConfigurationPage() {
  const [{ company }, { numbering, currencies }] = await Promise.all([
    getSession(),
    getSystemSettings(),
  ]);

  const activeFy = company.financialYears.find((year) => year.isActive) ?? company.financialYears[0];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="System Configuration"
        subtitle="Company and branch settings, financial year, currencies, tax settings, document numbering and master data"
        phase="mvp"
        actions={
          <ActionButton variant="primary" icon={<Save className="size-3.5" />}>
            Save changes
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Panel>
          <PanelHeader title="Company profile" subtitle="Legal entity used on documents" />
          <PanelBody>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Trading name</dt>
                <dd className="text-right font-medium text-ink">{company.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Legal name</dt>
                <dd className="max-w-[60%] text-right text-ink">{company.legalName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Base currency</dt>
                <dd className="text-right text-ink">{company.baseCurrency}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Branches</dt>
                <dd className="text-right text-ink">
                  {company.branches.map((branch) => branch.name).join(", ")}
                </dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Financial year" subtitle="Posting periods and locking" />
          <PanelBody>
            <ul className="space-y-2.5">
              {company.financialYears.map((year) => (
                <li
                  key={year.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-plane px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block text-[12px] font-medium text-ink">{year.label}</span>
                    <span className="block text-[10.5px] text-ink-muted">
                      {formatDate(year.startDate)} - {formatDate(year.endDate)}
                    </span>
                  </span>
                  {year.isActive ? (
                    <Badge tone="good" dot>
                      Open
                    </Badge>
                  ) : (
                    <Badge tone="neutral" dot>
                      Locked
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
            <p className="t-caption mt-3">
              Current posting year: {activeFy?.label}. Period locking prevents back-dated entries once
              a year is closed.
            </p>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Tax settings" subtitle="One jurisdiction in Phase 1" />
          <PanelBody>
            <dl className="space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Default tax code</dt>
                <dd className="text-right font-medium text-ink">SR5 · Standard rated 5%</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Return frequency</dt>
                <dd className="text-right text-ink">Two-monthly</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Rounding</dt>
                <dd className="text-right text-ink">Line level, 2 decimals</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Reverse charge</dt>
                <dd className="text-right text-ink">Enabled for imported services</dd>
              </div>
            </dl>
            <Link
              href="/accounting/tax-vat"
              className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline"
            >
              Open tax configuration
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </PanelBody>
        </Panel>
      </div>

      <ConfigurationView numbering={numbering} currencies={currencies} />

      <Panel>
        <PanelHeader title="Master data" subtitle="Where each reference list is maintained" />
        <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {MASTER_DATA.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-plane px-3 py-2.5 transition-colors hover:border-hairline-strong"
            >
              <span className="min-w-0">
                <span className="block text-[12px] font-medium text-ink">{entry.label}</span>
                <span className="block text-[10.5px] text-ink-muted">{entry.note}</span>
              </span>
              <ArrowUpRight className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
            </Link>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
