import type { Metadata } from "next";
import { Download } from "lucide-react";
import { AuditView } from "./audit-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getAuditEvents } from "@/lib/api/client";

export const metadata: Metadata = { title: "Audit Trail" };

export const instant = false;

export default async function AuditTrailPage() {
  const events = await getAuditEvents();

  const today = events.filter((event) => event.at.startsWith("2026-11-15")).length;
  const postings = events.filter((event) => event.action === "post" || event.action === "approve").length;
  const reversals = events.filter((event) => event.action === "delete").length;
  const users = new Set(events.map((event) => event.user)).size;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Audit Trail"
        subtitle="User activity logs, transaction history and record change tracking"
        phase="mvp"
        actions={<ActionButton icon={<Download className="size-3.5" />}>Export log</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Events today",
            value: String(today),
            caption: `${events.length} in the loaded window`,
          },
          {
            label: "Postings & approvals",
            value: String(postings),
            caption: "Every posting is attributable to a user",
          },
          {
            label: "Reversals",
            value: String(reversals),
            caption: "Posted records are never silently overwritten",
            tone: reversals > 0 ? "critical" : "good",
          },
          {
            label: "Active users logged",
            value: String(users),
            caption: "Includes sign-in and export activity",
            tone: "muted",
          },
        ]}
      />

      <AuditView events={events} />
    </div>
  );
}
