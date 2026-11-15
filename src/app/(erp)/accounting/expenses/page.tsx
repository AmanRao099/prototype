import type { Metadata } from "next";
import { Construction, Plus } from "lucide-react";
import { ExpensesView } from "./expenses-view";
import { RankedBars } from "@/components/charts/ranked-bars";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getExpenses } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Expense Management" };

export const instant = false;

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  const posted = expenses.filter((expense) => expense.status === "posted");
  const total = posted.reduce((sum, expense) => sum + toNumber(expense.total), 0);
  const vat = posted.reduce((sum, expense) => sum + toNumber(expense.vat), 0);
  const pending = expenses.filter((expense) => expense.status === "pending_approval");
  const missingDocs = expenses.filter((expense) => expense.attachments === 0).length;

  const byCategory = Object.entries(
    posted.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + toNumber(expense.total);
      return acc;
    }, {}),
  )
    .map(([category, value]) => ({ id: category, label: category, value }))
    .sort((a, b) => b.value - a.value);

  const byDepartment = Object.entries(
    posted.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.department] = (acc[expense.department] ?? 0) + toNumber(expense.total);
      return acc;
    }, {}),
  )
    .map(([department, value]) => ({ id: department, label: department, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Expense Management"
        subtitle="Expense categories, vouchers, recurring expenses, department allocation, approvals and attachments"
        phase="phase2"
        actions={
          <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
            New expense voucher
          </ActionButton>
        }
      />

      <p className="flex items-start gap-2 rounded-xl border border-hairline bg-surface px-4 py-3 text-[12px] text-ink-secondary">
        <Construction className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        Scheduled for Phase 2. The register below reads the same API shape as the other accounting
        screens, so recurring schedules, approval routing and department budgets can be layered on
        without reworking this view.
      </p>

      <SummaryStrip
        items={[
          {
            label: "Posted expenses",
            value: formatMoneyCompact(total),
            caption: `${posted.length} vouchers this period`,
          },
          {
            label: "Recoverable VAT",
            value: formatMoneyCompact(vat),
            caption: "Flows into the input VAT box",
          },
          {
            label: "Awaiting approval",
            value: String(pending.length),
            caption: formatMoneyCompact(
              pending.reduce((sum, expense) => sum + toNumber(expense.total), 0),
            ),
            tone: pending.length > 0 ? "critical" : "good",
          },
          {
            label: "Missing attachments",
            value: String(missingDocs),
            caption: "Vouchers without a supporting document",
            tone: missingDocs > 0 ? "critical" : "good",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Panel>
          <PanelHeader title="Spend by category" subtitle="Posted vouchers only" />
          <PanelBody>
            <RankedBars bars={byCategory} formatValue={formatMoneyCompact} />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Spend by department" subtitle="Allocation of posted expenses" />
          <PanelBody>
            <RankedBars bars={byDepartment} formatValue={formatMoneyCompact} color="var(--series-3)" />
          </PanelBody>
        </Panel>
      </div>

      <ExpensesView expenses={expenses} />
    </div>
  );
}
