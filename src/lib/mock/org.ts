import type { Company, SessionUser } from "@/lib/types";

/**
 * Stand-in organisation context until the Django `/api/common/` endpoints land.
 * Shapes match the planned serializers, so swapping the source is a one-line
 * change in `src/lib/api/client.ts`.
 */
export const MOCK_COMPANY: Company = {
  id: "co-001",
  name: "Meridian Trading",
  legalName: "Meridian Trading & Distribution Pvt. Ltd.",
  baseCurrency: "INR",
  branches: [
    { id: "br-001", name: "Head Office", code: "HO" },
    { id: "br-002", name: "North Depot", code: "ND" },
    { id: "br-003", name: "Port Branch", code: "PB" },
  ],
  financialYears: [
    {
      id: "fy-2627",
      label: "FY 2026-27",
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      isActive: true,
      isLocked: false,
    },
    {
      id: "fy-2526",
      label: "FY 2025-26",
      startDate: "2025-04-01",
      endDate: "2026-03-31",
      isActive: false,
      isLocked: true,
    },
  ],
};

export const MOCK_USER: SessionUser = {
  id: "usr-004",
  name: "R. Menon",
  email: "finance.controller@example.com",
  roleName: "Finance Controller",
  initials: "RM",
};
