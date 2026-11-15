"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
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
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Ctrl/Cmd-K opens the jump-to-module palette from anywhere.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-plane">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onOpenSearch={() => setPaletteOpen(true)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          company={company}
          user={user}
          alertCount={alertCount}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenSearch={() => setPaletteOpen(true)}
        />
        <main className="min-w-0 flex-1">
          {/* a cap keeps line lengths and tile widths sane on ultrawide displays */}
          <div className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8">{children}</div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
