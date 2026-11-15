import type { Metadata } from "next";
import { AuditView } from "./audit-view";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="page-stack">
      <PageHeader
        title="Audit Trail"
        subtitle="Who changed what, and when"
        secondaryActions={[{ label: "Export log" }]}
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
