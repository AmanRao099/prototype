import type { ReactNode } from "react";
import { Badge, PhaseBadge } from "@/components/ui/badge";
import type { DeliveryPhase } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  phase,
  phaseNote,
  actions,
}: {
  title: string;
  subtitle?: string;
  phase?: DeliveryPhase;
  phaseNote?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[18px] font-semibold tracking-tight text-ink">{title}</h1>
          {phase ? <PhaseBadge phase={phase} /> : null}
          {phaseNote ? <Badge tone="neutral">{phaseNote}</Badge> : null}
        </div>
        {subtitle ? <p className="mt-0.5 text-[11.5px] text-ink-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function ActionButton({
  children,
  icon,
  variant = "secondary",
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-colors";
  const skin =
    variant === "primary"
      ? "bg-accent text-white hover:opacity-90"
      : "border border-hairline text-ink-secondary hover:bg-surface-2 hover:text-ink";

  return (
    <button type="button" className={`${base} ${skin}`}>
      {icon}
      {children}
    </button>
  );
}
