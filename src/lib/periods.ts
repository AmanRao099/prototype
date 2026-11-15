import type { PeriodKey } from "@/lib/types";

export const PERIOD_KEYS: PeriodKey[] = ["mtd", "last30", "qtd", "fytd"];

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  mtd: "Month to date",
  last30: "Last 30 days",
  qtd: "Quarter to date",
  fytd: "Financial year to date",
};

export const PERIOD_COMPARISON: Record<PeriodKey, string> = {
  mtd: "vs last month",
  last30: "vs previous 30 days",
  qtd: "vs last quarter",
  fytd: "vs last year",
};

export function parsePeriod(value: string | string[] | undefined): PeriodKey {
  const candidate = Array.isArray(value) ? value[0] : value;
  return PERIOD_KEYS.includes(candidate as PeriodKey) ? (candidate as PeriodKey) : "mtd";
}
