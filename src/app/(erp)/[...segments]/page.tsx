import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { NavIcon } from "@/components/layout/icon";
import { Badge, PhaseBadge } from "@/components/ui/badge";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { PHASE_LABEL, findNavItem } from "@/lib/nav";

// Live operational data: this route renders per request rather than at build time.
export const instant = false;

/**
 * Placeholder for every module screen that is not built yet. It states the
 * module's scope from the source workbook and which delivery phase owns it, so
 * the navigation is never a dead end during review.
 */
export default async function ModulePlaceholderPage({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;
  const href = `/${segments.join("/")}`;
  const match = findNavItem(href);

  if (!match) notFound();

  const { item, section } = match;
  const features = item.features.split(";").map((feature) => feature.trim()).filter(Boolean);

  return (
    <div className="page-stack">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-hairline bg-surface text-ink-secondary">
            <NavIcon name={item.icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="t-page-title">{item.moduleName}</h1>
              <PhaseBadge phase={item.phase} />
              {item.badge ? <Badge tone="neutral">{item.badge}</Badge> : null}
            </div>
            <p className="t-caption mt-1">
              {section?.title ?? "Settings"} · {item.workbookCategory} · {PHASE_LABEL[item.phase]}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-[11.5px] font-medium text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader
            title="Scope from the source workbook"
            subtitle="Accounts & Inventory Modules.xlsx, transcribed feature list"
          />
          <PanelBody>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2 text-[12px] text-ink-secondary">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-axis" />
                  {feature}
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Build status" />
          <PanelBody className="flex flex-col gap-3">
            <p className="flex items-start gap-2 text-[12px] text-ink-secondary">
              <Construction className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              Screen not built yet. The dashboard is the first slice of the front-end phase; module
              screens follow the delivery schedule in the proposal.
            </p>
            <dl className="space-y-1.5 border-t border-hairline pt-3 text-[11.5px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Delivery phase</dt>
                <dd className="font-medium text-ink">{PHASE_LABEL[item.phase]}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Django app</dt>
                <dd className="font-medium text-ink">{item.app}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Route</dt>
                <dd className="font-medium text-ink">{href}</dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
