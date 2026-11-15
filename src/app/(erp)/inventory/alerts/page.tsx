import type { Metadata } from "next";
import { BellRing } from "lucide-react";
import { AlertsView } from "./alerts-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getInventoryAlerts, getItems } from "@/lib/api/client";
import { formatQty } from "@/lib/format";

export const metadata: Metadata = { title: "Inventory Alerts" };

export const instant = false;

export default async function InventoryAlertsPage() {
  const [alerts, items] = await Promise.all([getInventoryAlerts(), getItems()]);

  const critical = alerts.filter((alert) => alert.level === "critical").length;
  const belowReorder = items.filter((item) => item.onHand < item.reorderLevel);
  const negative = items.filter((item) => item.onHand < 0);
  const expiring = alerts.filter((alert) => alert.type === "expiry").length;
  const reservedShort = items.filter((item) => item.available < 0).length;

  return (
    <div className="page-stack">
      <PageHeader
        title="Inventory Alerts"
        subtitle="Items that need attention"
        secondaryActions={[{ label: "Alert rules" }]}
        actions={<ActionButton variant="primary" icon={<BellRing className="size-3.5" />}>Notify owners</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Critical alerts",
            value: String(critical),
            caption: "Negative stock and imminent expiry",
            tone: critical > 0 ? "critical" : "good",
          },
          {
            label: "Below reorder level",
            value: String(belowReorder.length),
            caption: `${formatQty(belowReorder.reduce((sum, item) => sum + Math.max(item.reorderLevel - item.onHand, 0), 0))} units short of cover`,
          },
          {
            label: "Negative on hand",
            value: String(negative.length),
            caption: "Investigate unmatched issues first",
            tone: negative.length > 0 ? "critical" : "good",
          },
          {
            label: "Reservation conflicts",
            value: String(reservedShort),
            caption: `${expiring} batches flagged for expiry`,
            tone: reservedShort > 0 ? "critical" : "muted",
          },
        ]}
      />

      <AlertsView alerts={alerts} />
    </div>
  );
}
