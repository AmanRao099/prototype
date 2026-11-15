import Link from "next/link";
import { StatusChip, statusDotClass } from "@/components/ui/badge";
import type { InventoryAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<InventoryAlert["type"], string> = {
  low_stock: "Low stock",
  reorder: "Reorder level",
  expiry: "Expiry",
  negative_stock: "Negative stock",
  overstock: "Overstock",
  non_moving: "Non-moving",
};

const LEVEL_ORDER: Record<InventoryAlert["level"], number> = {
  critical: 0,
  serious: 1,
  warning: 2,
  good: 3,
  neutral: 4,
};

export function AlertsPanel({ alerts }: { alerts: InventoryAlert[] }) {
  const sorted = [...alerts].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);

  return (
    <ul className="divide-y divide-hairline">
      {sorted.map((alert) => (
        <li key={alert.id} className="flex gap-2.5 px-4 py-3">
          <span
            aria-hidden
            className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", statusDotClass(alert.level))}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-[12.5px] font-medium text-ink">{alert.item}</p>
              <StatusChip level={alert.level} label={TYPE_LABEL[alert.type]} />
            </div>
            <p className="mt-0.5 text-[11px] text-ink-secondary">{alert.detail}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-muted">
              {alert.sku} - {alert.warehouse}
            </p>
          </div>
        </li>
      ))}
      {sorted.length === 0 ? (
        <li className="px-4 py-8 text-center text-[12px] text-ink-muted">
          No stock alerts for this company and branch.{" "}
          <Link href="/inventory/alerts" className="text-accent hover:underline">
            Review alert rules
          </Link>
        </li>
      ) : null}
    </ul>
  );
}
