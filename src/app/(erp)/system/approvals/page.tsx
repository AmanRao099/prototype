import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { ApprovalsView } from "./approvals-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import {
  getApprovalDelegations,
  getApprovalHistory,
  getApprovalRules,
  getDashboard,
} from "@/lib/api/client";
import { formatMoneyCompact, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Approval Workflow" };

export const instant = false;

export default async function ApprovalsPage() {
  const [dashboard, rules, delegations, history] = await Promise.all([
    getDashboard("mtd"),
    getApprovalRules(),
    getApprovalDelegations(),
    getApprovalHistory(),
  ]);
  const requests = dashboard.approvals;

  const value = requests.reduce((sum, request) => sum + toNumber(request.amount ?? 0), 0);
  const urgent = requests.filter(
    (request) => request.level === "critical" || request.level === "serious",
  ).length;
  const activeRules = rules.filter((rule) => rule.isActive).length;
  const multiLevel = rules.filter((rule) => rule.levels.length > 1).length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Approval Workflow"
        subtitle="Documents waiting on a decision"
        note="Phase 2 adds delegation and the full approval history: every decision records the level, the approver, any delegate who acted for them, the comment and the elapsed time."
        actions={<ActionButton variant="primary" icon={<Plus className="size-3.5" />}>New approval rule</ActionButton>}
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
            label: "Delegations active",
            value: String(delegations.filter((entry) => entry.status === "active").length),
            caption: `${delegations.filter((entry) => entry.status === "scheduled").length} scheduled ahead`,
            tone: "muted",
          },
        ]}
      />

      <ApprovalsView
        requests={requests}
        rules={rules}
        delegations={delegations}
        history={history}
      />
    </div>
  );
}
