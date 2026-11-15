import type { ReactNode } from "react";
import type { DeliveryPhase, StatusLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Badges stay quiet by default: one muted pill shape, tone carried by a small
 * dot rather than a saturated fill. A register with forty rows should read as
 * text, not as a bag of sweets.
 */
const TONE_DOT: Record<string, string> = {
  neutral: "bg-axis",
  accent: "bg-accent",
  good: "bg-good",
  warning: "bg-warning",
  serious: "bg-serious",
  critical: "bg-critical",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_DOT;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap text-ink-secondary",
        className,
      )}
    >
      {dot ? (
        <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", TONE_DOT[tone])} />
      ) : null}
      {children}
    </span>
  );
}

const STATUS_META: Record<StatusLevel, { label: string; tone: keyof typeof TONE_DOT }> = {
  good: { label: "Healthy", tone: "good" },
  warning: { label: "Watch", tone: "warning" },
  serious: { label: "Action due", tone: "serious" },
  critical: { label: "Critical", tone: "critical" },
  neutral: { label: "Info", tone: "neutral" },
};

/**
 * Status always ships as dot + text. The word carries the meaning, so a reader
 * who cannot separate the hues loses nothing.
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
  return (
    <Badge tone={meta.tone} dot className={className}>
      {label ?? meta.label}
    </Badge>
  );
}

export function statusDotClass(level: StatusLevel): string {
  return TONE_DOT[STATUS_META[level].tone];
}

const PHASE_TEXT: Record<DeliveryPhase, string> = {
  mvp: "Phase 1",
  limited: "Phase 1 · limited",
  phase2: "Phase 2",
};

/** Delivery phase marker - deliberately the lightest thing on the screen. */
export function PhaseBadge({ phase, compact = false }: { phase: DeliveryPhase; compact?: boolean }) {
  if (compact) {
    return (
      <span
        title={PHASE_TEXT[phase]}
        className="shrink-0 rounded-md px-1 py-px text-[9.5px] font-semibold tracking-wide text-ink-muted/80 ring-1 ring-hairline ring-inset"
      >
        {phase === "phase2" ? "P2" : "LTD"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-ink-muted">
      {PHASE_TEXT[phase]}
    </span>
  );
}
