import { APP_CONFIG, currencySymbol } from "@/lib/config";

/**
 * Money and number formatting.
 *
 * Money arrives from the API as a decimal string (Django DecimalField) or a
 * number. Formatting is presentation only - never do arithmetic on the output.
 */

const { locale, currency, compactStyle } = APP_CONFIG;

const moneyFull = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyWhole = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

const qtyFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });

export function toNumber(value: number | string): number {
  return typeof value === "number" ? value : Number.parseFloat(value || "0");
}

/** Ledger-grade: two decimals, grouped. Statements, invoice lines, journals. */
export function formatMoney(value: number | string): string {
  return moneyFull.format(toNumber(value));
}

/** Tables and tooltips where paise add noise. */
export function formatMoneyWhole(value: number | string): string {
  return moneyWhole.format(toNumber(value));
}

const INDIAN_UNITS: Array<[number, string]> = [
  [1_00_00_000, "Cr"],
  [1_00_000, "L"],
  [1_000, "K"],
];

const WESTERN_UNITS: Array<[number, string]> = [
  [1_000_000_000, "B"],
  [1_000_000, "M"],
  [1_000, "K"],
];

function compactParts(value: number): { digits: string; unit: string } {
  const units = compactStyle === "indian" ? INDIAN_UNITS : WESTERN_UNITS;
  const abs = Math.abs(value);
  for (const [divisor, unit] of units) {
    if (abs >= divisor) {
      const scaled = abs / divisor;
      return { digits: scaled.toFixed(scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2), unit };
    }
  }
  return { digits: abs.toFixed(0), unit: "" };
}

/** KPI tiles and axis labels only: INR 12.46 L / INR 1.25 Cr. */
export function formatMoneyCompact(value: number | string): string {
  const n = toNumber(value);
  const { digits, unit } = compactParts(n);
  return `${n < 0 ? "-" : ""}${currencySymbol()}${digits}${unit ? ` ${unit}` : ""}`;
}

/**
 * Axis ticks share ONE unit, chosen from the scale maximum, so a column of
 * ticks never mixes "75L" with "1Cr".
 */
export function makeAxisFormatter(max: number): (value: number) => string {
  const units = compactStyle === "indian" ? INDIAN_UNITS : WESTERN_UNITS;
  const unit = units.find(([divisor]) => Math.abs(max) >= divisor);

  return (value: number) => {
    if (value === 0) return "0";
    if (!unit) return String(Math.round(value));
    const scaled = value / unit[0];
    const digits = Math.abs(scaled) >= 10 ? 0 : Math.abs(scaled) >= 1 ? 1 : 2;
    return `${Number.parseFloat(scaled.toFixed(digits))}${unit[1]}`;
  };
}

export function formatQty(value: number | string, unit?: string): string {
  const out = qtyFormat.format(toNumber(value));
  return unit ? `${out} ${unit}` : out;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "4 days ago" style relative text for activity feeds. */
export function formatRelative(iso: string, now = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
