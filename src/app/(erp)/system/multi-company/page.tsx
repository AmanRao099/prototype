import type { Metadata } from "next";
import { Building2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getCompanies, getSession } from "@/lib/api/client";
import { formatMoneyCompact, formatMoneyWhole, toNumber } from "@/lib/format";
import type { CompanyEntity } from "@/lib/types";

export const metadata: Metadata = { title: "Multi-company & Branch" };

export const instant = false;

export default async function MultiCompanyPage() {
  const [companies, { company }] = await Promise.all([getCompanies(), getSession()]);

  const live = companies.filter((entity) => entity.status === "live");
  const revenue = companies.reduce((sum, entity) => sum + toNumber(entity.revenueYtd), 0);
  const stock = companies.reduce((sum, entity) => sum + toNumber(entity.stockValue), 0);
  const branches = companies.reduce((sum, entity) => sum + entity.branchCount, 0);

  const columns: Array<Column<CompanyEntity>> = [
    {
      key: "company",
      header: "Company",
      cell: (entity) => <CellStack primary={entity.name} secondary={entity.legalName} />,
    },
    { key: "currency", header: "Base currency", hideBelow: "md", cell: (entity) => entity.baseCurrency },
    { key: "branches", header: "Branches", align: "right", cell: (entity) => entity.branchCount },
    { key: "users", header: "Users", align: "right", hideBelow: "lg", cell: (entity) => entity.userCount },
    {
      key: "stock",
      header: "Stock value",
      align: "right",
      cell: (entity) =>
        toNumber(entity.stockValue) ? formatMoneyWhole(entity.stockValue) : <span className="text-ink-muted">-</span>,
    },
    {
      key: "revenue",
      header: "Revenue YTD",
      align: "right",
      cell: (entity) =>
        toNumber(entity.revenueYtd) ? (
          <span className="font-medium">{formatMoneyWhole(entity.revenueYtd)}</span>
        ) : (
          <span className="text-ink-muted">-</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (entity) => (
        <Badge tone={entity.status === "live" ? "good" : "neutral"} dot>
          {entity.status === "live" ? "Live" : entity.status === "setup" ? "In setup" : "Archived"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Multi-company & Branch"
        subtitle="Group entities and branch structure"
        note="Phase 1 runs one live legal entity with a basic branch structure. Consolidation, intercompany postings and cross-company reporting are Phase 3."
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>Add company</ActionButton>}
      />


      <SummaryStrip
        items={[
          {
            label: "Companies registered",
            value: String(companies.length),
            caption: `${live.length} live, ${companies.length - live.length} in setup`,
          },
          {
            label: "Branches",
            value: String(branches),
            caption: `${company.branches.length} active on the live entity`,
          },
          {
            label: "Group revenue YTD",
            value: formatMoneyCompact(revenue),
            caption: "Live entity only; no consolidation yet",
          },
          {
            label: "Group stock value",
            value: formatMoneyCompact(stock),
            caption: "Stock is controlled per company and warehouse",
            tone: "muted",
          },
        ]}
      />

      <Panel>
        <PanelHeader title="Companies" subtitle="Legal entities in the group" />
        <DataTable columns={columns} rows={companies} minWidth="min-w-[900px]" />
      </Panel>

      <Panel>
        <PanelHeader
          title={`Branches of ${company.name}`}
          subtitle="Branch-wise transactions and stock control in Phase 1"
        />
        <PanelBody className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {company.branches.map((branch) => (
            <div key={branch.id} className="rounded-lg border border-hairline bg-plane p-3">
              <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                <Building2 className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                {branch.name}
              </p>
              <p className="mt-1 text-[10.5px] text-ink-muted">
                Code {branch.code} · documents numbered per branch where configured
              </p>
            </div>
          ))}
        </PanelBody>
      </Panel>
    </div>
  );
}
