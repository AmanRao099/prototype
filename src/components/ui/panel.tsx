import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={cn(
        "flex min-w-0 flex-col rounded-xl border border-hairline bg-surface shadow-[0_1px_2px_rgba(11,11,11,0.04)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
  href,
  hrefLabel = "Open",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-hairline px-4 py-3">
      <div className="min-w-0">
        <h2 className="truncate text-[13px] font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[11px] text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {hrefLabel}
            <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function PanelBody({
  children,
  className,
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return <div className={cn(flush ? "" : "p-4", "min-w-0 flex-1", className)}>{children}</div>;
}

export function PanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer
      className={cn(
        "flex items-center justify-between gap-3 border-t border-hairline px-4 py-2.5 text-[11px] text-ink-muted",
        className,
      )}
    >
      {children}
    </footer>
  );
}
