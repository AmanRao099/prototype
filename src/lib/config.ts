/**
 * Single place for tenant-level presentation settings.
 *
 * Phase 1 assumes one legal entity, one tax jurisdiction and one base currency
 * (proposal §11). Switching the deployment to AED/UAE VAT is a change to this
 * file plus the backend tax configuration, nothing else in the UI.
 */
export const APP_CONFIG = {
  productName: "Atlas ERP",
  locale: "en-IN",
  currency: "INR",
  /** "indian" renders lakh/crore in compact values; "western" renders K/M/B. */
  compactStyle: "indian" as "indian" | "western",
  /** Base URL of the Django REST API. Empty string keeps the UI on mock data. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
} as const;

export const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  AED: "AED ",
  USD: "$",
};

export function currencySymbol(): string {
  return CURRENCY_SYMBOL[APP_CONFIG.currency] ?? `${APP_CONFIG.currency} `;
}
