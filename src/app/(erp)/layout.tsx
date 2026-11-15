import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboard, getSession } from "@/lib/api/client";

export default async function ErpLayout({ children }: { children: ReactNode }) {
  const [{ company, user }, dashboard] = await Promise.all([getSession(), getDashboard("mtd")]);

  const alertCount =
    dashboard.alerts.filter((alert) => alert.level === "critical" || alert.level === "serious")
      .length + dashboard.approvals.length;

  return (
    <AppShell company={company} user={user} alertCount={alertCount}>
      {children}
    </AppShell>
  );
}
