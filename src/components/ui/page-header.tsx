import type { ReactNode } from "react";
import { PhaseBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="t-page-title">{title}</h1>
        {subtitle ? (
          <p className="mt-1 max-w-[70ch] text-[12px] leading-relaxed text-ink-muted">{subtitle}</p>
        ) : null}
        {phase || phaseNote ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {phase && phase !== "mvp" ? <PhaseBadge phase={phase} /> : null}
            {phaseNote ? (
              <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">
                {phaseNote}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function ActionButton({
  children,
  icon,
  variant = "secondary",
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[30px] items-center gap-1.5 rounded-lg px-2.5 text-[11.5px] font-medium transition-colors",
        variant === "primary" &&
          "bg-accent text-on-accent shadow-panel hover:bg-accent-hover",
        variant === "secondary" &&
          "border border-hairline bg-surface text-ink-secondary hover:border-hairline-strong hover:text-ink",
        variant === "ghost" && "text-ink-muted hover:bg-surface-2 hover:text-ink",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
