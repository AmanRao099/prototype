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
        "flex min-w-0 flex-col overflow-hidden rounded-[10px] border border-hairline bg-surface shadow-panel",
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
    <header className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3">
      <div className="min-w-0">
        <h2 className="t-panel-title truncate">{title}</h2>
        {subtitle ? <p className="t-caption mt-1 truncate">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
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
        "flex items-center justify-between gap-3 border-t border-hairline bg-surface-2/40 px-4 py-2.5 text-[11px] text-ink-muted",
        className,
      )}
    >
      {children}
    </footer>
  );
}
