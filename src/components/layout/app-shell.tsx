"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { Company, SessionUser } from "@/lib/types";

export function AppShell({
  company,
  user,
  alertCount,
  children,
}: {
  company: Company;
  user: SessionUser;
  alertCount: number;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          company={company}
          user={user}
          alertCount={alertCount}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">{children}</main>
      </div>
    </div>
  );
}
