import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">404</p>
        <h1 className="mt-2 text-[18px] font-semibold tracking-tight text-ink">Screen not found</h1>
        <p className="mt-1.5 text-[12.5px] text-ink-secondary">
          That route is not part of the module registry. Use the module navigation, or go back to the
          dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
