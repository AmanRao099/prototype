import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, OctagonAlert } from "lucide-react";
import type { DeliveryPhase, StatusLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  neutral: "border-hairline bg-surface-2 text-ink-secondary",
  accent: "border-accent/30 bg-accent-wash text-accent",
  good: "border-good/30 bg-good/10 text-good",
  warning: "border-warning/40 bg-warning/12 text-ink-secondary",
  serious: "border-serious/40 bg-serious/12 text-ink-secondary",
  critical: "border-critical/35 bg-critical/10 text-critical",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_META: Record<
  StatusLevel,
  { icon: typeof CheckCircle2; label: string; tone: keyof typeof TONE_CLASS; dot: string }
> = {
  good: { icon: CheckCircle2, label: "Healthy", tone: "good", dot: "bg-good" },
  warning: { icon: Info, label: "Watch", tone: "warning", dot: "bg-warning" },
  serious: { icon: AlertTriangle, label: "Action due", tone: "serious", dot: "bg-serious" },
  critical: { icon: OctagonAlert, label: "Critical", tone: "critical", dot: "bg-critical" },
  neutral: { icon: CircleAlert, label: "Info", tone: "neutral", dot: "bg-axis" },
};

/**
 * Status always ships as icon + text. Colour never carries the meaning alone
 * (two of the four status steps sit below 3:1 on the light surface by design).
 */
export function StatusChip({
  level,
  label,
  className,
}: {
  level: StatusLevel;
  label?: string;
  className?: string;
}) {
  const meta = STATUS_META[level];
  const Icon = meta.icon;
  return (
    <Badge tone={meta.tone} className={className}>
      <Icon className="size-3 shrink-0" aria-hidden />
      {label ?? meta.label}
    </Badge>
  );
}

export function statusDotClass(level: StatusLevel): string {
  return STATUS_META[level].dot;
}

const PHASE_TONE: Record<DeliveryPhase, keyof typeof TONE_CLASS> = {
  mvp: "neutral",
  limited: "warning",
  phase2: "neutral",
};

const PHASE_TEXT: Record<DeliveryPhase, string> = {
  mvp: "P1",
  limited: "P1 ltd",
  phase2: "P2",
};

export function PhaseBadge({ phase }: { phase: DeliveryPhase }) {
  return (
    <Badge tone={PHASE_TONE[phase]} className={phase === "phase2" ? "opacity-70" : undefined}>
      {PHASE_TEXT[phase]}
    </Badge>
  );
}
