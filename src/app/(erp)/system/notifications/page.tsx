import type { Metadata } from "next";
import { CheckCheck } from "lucide-react";
import { NotificationsView } from "./notifications-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getNotifications } from "@/lib/api/client";

export const metadata: Metadata = { title: "Notifications" };

export const instant = false;

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  const unread = notifications.filter((notification) => !notification.read).length;
  const critical = notifications.filter((notification) => notification.level === "critical").length;
  const email = notifications.filter((notification) => notification.channel === "email").length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Notifications"
        subtitle="Alerts across the system"
        secondaryActions={[{ label: "Notification rules" }]}
        actions={<ActionButton variant="primary" icon={<CheckCheck className="size-3.5" />}>Mark all read</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Unread",
            value: String(unread),
            caption: `${notifications.length} in the last 7 days`,
            tone: unread > 0 ? "critical" : "good",
          },
          {
            label: "Critical alerts",
            value: String(critical),
            caption: "Negative stock, expiry and held approvals",
            tone: critical > 0 ? "critical" : "good",
          },
          {
            label: "Email delivery",
            value: String(email),
            caption: "Sent through Amazon SES",
          },
          {
            label: "Channels in Phase 1",
            value: "2",
            caption: "In-app and email; SMS and WhatsApp are Phase 2",
            tone: "muted",
          },
        ]}
      />

      <NotificationsView notifications={notifications} />
    </div>
  );
}
