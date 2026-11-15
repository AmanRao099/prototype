"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { PERIOD_KEYS, PERIOD_LABEL } from "@/lib/periods";
import type { PeriodKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const SHORT: Record<PeriodKey, string> = {
  mtd: "MTD",
  last30: "Last 30d",
  qtd: "QTD",
  fytd: "FY to date",
};

/**
 * One filter row above the charts. The choice lives in the URL so the server
 * component refetches, and a shared link opens on the same period.
 */
export function PeriodFilter({ active }: { active: PeriodKey }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function select(period: PeriodKey) {
    const next = new URLSearchParams(params.toString());
    next.set("period", period);
    startTransition(() => router.replace(`/dashboard?${next.toString()}`, { scroll: false }));
  }

  return (
    <div
      role="group"
      aria-label="Reporting period"
      aria-busy={pending}
      className="inline-flex rounded-lg border border-hairline bg-surface p-0.5"
    >
      {PERIOD_KEYS.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => select(period)}
          aria-pressed={active === period}
          title={PERIOD_LABEL[period]}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            active === period
              ? "bg-accent-wash text-accent"
              : "text-ink-secondary hover:bg-surface-2 hover:text-ink",
          )}
        >
          {SHORT[period]}
        </button>
      ))}
    </div>
  );
}
