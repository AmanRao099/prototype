import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ApprovalsView } from "./approvals-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getApprovalRules, getDashboard } from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Approval Workflow" };

export const instant = false;

export default async function ApprovalsPage() {
  const [dashboard, rules] = await Promise.all([getDashboard("mtd"), getApprovalRules()]);
  const requests = dashboard.approvals;

  const value = requests.reduce((sum, request) => sum + toNumber(request.amount ?? 0), 0);
  const urgent = requests.filter(
    (request) => request.level === "critical" || request.level === "serious",
  ).length;
  const activeRules = rules.filter((rule) => rule.isActive).length;
  const multiLevel = rules.filter((rule) => rule.levels.length > 1).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Approval Workflow"
        subtitle="Invoice, payment, purchase and stock-adjustment approvals, multi-level approvals, delegation and approval history"
        phase="limited"
        phaseNote="Basic approval states in Phase 1"
        actions={
          <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
            New approval rule
          </ActionButton>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Waiting on you",
            value: String(requests.length),
            caption: `${urgent} marked urgent`,
            tone: urgent > 0 ? "critical" : "good",
          },
          {
            label: "Value held up",
            value: formatMoneyCompact(value),
            caption: "Documents cannot post until approved",
          },
          {
            label: "Active rules",
            value: String(activeRules),
            caption: `${multiLevel} rules use more than one level`,
          },
          {
            label: "Deferred to Phase 2",
            value: String(rules.length - activeRules),
            caption: "Delegation and conditional matrices",
            tone: "muted",
          },
        ]}
      />

      <ApprovalsView requests={requests} rules={rules} />
    </div>
  );
}
