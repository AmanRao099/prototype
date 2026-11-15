import type {
  GoodsReceipt,
  Item,
  StockAdjustmentDoc,
  StockIssue,
  StockLedgerRow,
  StockTransferDoc,
  ValuationRow,
  Warehouse,
} from "@/lib/types";

/**
 * Mock payloads for the Inventory & Stock module screens.
 *
 * Consistent with the accounting sample data: total stock value ties to the
 * inventory control account (2,41,06,800) and to the dashboard stock tile.
 */

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: "wh-01", code: "WH-CEN", name: "Central Store", kind: "main", location: "Bhiwandi, MH", binCount: 148, skuCount: 486, stockValue: 92_41_600, utilisationPct: 78, manager: "S. Iyer", isActive: true },
  { id: "wh-02", code: "WH-NTH", name: "North Depot", kind: "depot", location: "Panipat, HR", binCount: 96, skuCount: 312, stockValue: 54_18_200, utilisationPct: 64, manager: "M. Qureshi", isActive: true },
  { id: "wh-03", code: "WH-PRT", name: "Port Bonded", kind: "bonded", location: "Nhava Sheva, MH", binCount: 54, skuCount: 164, stockValue: 38_72_400, utilisationPct: 91, manager: "F. Dias", isActive: true },
  { id: "wh-04", code: "WH-STH", name: "South Hub", kind: "depot", location: "Hosur, TN", binCount: 72, skuCount: 198, stockValue: 28_64_900, utilisationPct: 52, manager: "D. Rao", isActive: true },
  { id: "wh-05", code: "WH-RTL", name: "Retail Counter", kind: "retail", location: "Andheri, MH", binCount: 18, skuCount: 96, stockValue: 17_32_100, utilisationPct: 47, manager: "A. Sequeira", isActive: true },
  { id: "wh-06", code: "WH-TRN", name: "In transit", kind: "transit", location: "Goods on the move", binCount: 0, skuCount: 28, stockValue: 9_77_600, utilisationPct: 0, manager: "System", isActive: true },
];

export const MOCK_ITEMS: Item[] = [
  { id: "it-01", sku: "EL-CU-016", name: "Copper Lug 16mm", category: "Electrical", brand: "Voltex", unit: "PCS", altUnit: "BOX", conversion: 50, barcode: "8901234500161", purchasePrice: 142, sellingPrice: 189, taxCode: "SR5", tracking: "batch", reorderLevel: 400, onHand: -42, reserved: 0, available: -42, stockValue: -5_964, isActive: true },
  { id: "it-02", sku: "CH-EP-005", name: "Epoxy Sealant 5L", category: "Chemicals", brand: "Durabond", unit: "UNT", barcode: "8901234500052", purchasePrice: 2_480, sellingPrice: 3_150, taxCode: "SR5", tracking: "batch", reorderLevel: 60, onHand: 96, reserved: 12, available: 84, stockValue: 2_38_080, isActive: true },
  { id: "it-03", sku: "PL-HD-063", name: "HDPE Pipe 63mm", category: "Plumbing", brand: "Aquaflow", unit: "MTR", barcode: "8901234500634", purchasePrice: 318, sellingPrice: 412, taxCode: "SR5", tracking: "none", reorderLevel: 150, onHand: 18, reserved: 0, available: 18, stockValue: 5_724, isActive: true },
  { id: "it-04", sku: "HW-SS-M08", name: "SS Fastener M8", category: "Hardware", brand: "Gripfast", unit: "PCS", altUnit: "BOX", conversion: 500, barcode: "8901234500085", purchasePrice: 11, sellingPrice: 17, taxCode: "SR5", tracking: "none", reorderLevel: 8_000, onHand: 6_240, reserved: 1_200, available: 5_040, stockValue: 68_640, isActive: true },
  { id: "it-05", sku: "IN-PG-040", name: "Analog Pressure Gauge", category: "Instrumentation", brand: "Metrix", unit: "PCS", barcode: "8901234500405", purchasePrice: 1_840, sellingPrice: 2_460, taxCode: "SR5", tracking: "serial", reorderLevel: 40, onHand: 186, reserved: 0, available: 186, stockValue: 3_42_240, isActive: true },
  { id: "it-06", sku: "EL-PV-025", name: "PVC Conduit 25mm", category: "Electrical", brand: "Voltex", unit: "MTR", barcode: "8901234500252", purchasePrice: 64, sellingPrice: 92, taxCode: "SR5", tracking: "none", reorderLevel: 2_000, onHand: 18_420, reserved: 640, available: 17_780, stockValue: 11_78_880, isActive: true },
  { id: "it-07", sku: "PL-BV-025", name: "Brass Ball Valve 1in", category: "Plumbing", brand: "Aquaflow", unit: "PCS", barcode: "8901234500258", purchasePrice: 486, sellingPrice: 648, taxCode: "SR5", tracking: "none", reorderLevel: 120, onHand: 6, reserved: 22, available: -16, stockValue: 2_916, isActive: true },
  { id: "it-08", sku: "EL-CB-004", name: "Cable Drum 4 core 25sqmm", category: "Electrical", brand: "Voltex", unit: "MTR", barcode: "8901234500047", purchasePrice: 842, sellingPrice: 1_104, taxCode: "SR5", tracking: "batch", reorderLevel: 1_500, onHand: 9_840, reserved: 2_400, available: 7_440, stockValue: 82_85_280, isActive: true },
  { id: "it-09", sku: "HW-AN-012", name: "Anchor Bolt 12mm", category: "Hardware", brand: "Gripfast", unit: "PCS", altUnit: "BOX", conversion: 200, barcode: "8901234500122", purchasePrice: 38, sellingPrice: 56, taxCode: "SR5", tracking: "none", reorderLevel: 5_000, onHand: 24_600, reserved: 3_000, available: 21_600, stockValue: 9_34_800, isActive: true },
  { id: "it-10", sku: "CH-LU-020", name: "Industrial Lubricant 20L", category: "Chemicals", brand: "Durabond", unit: "UNT", barcode: "8901234500208", purchasePrice: 4_260, sellingPrice: 5_480, taxCode: "SR5", tracking: "batch", reorderLevel: 80, onHand: 412, reserved: 40, available: 372, stockValue: 17_55_120, isActive: true },
  { id: "it-11", sku: "SF-HG-001", name: "Safety Helmet Grade A", category: "Safety", brand: "Guardwell", unit: "PCS", barcode: "8901234500017", purchasePrice: 384, sellingPrice: 520, taxCode: "SR5", tracking: "none", reorderLevel: 300, onHand: 1_840, reserved: 120, available: 1_720, stockValue: 7_06_560, isActive: true },
  { id: "it-12", sku: "IN-FM-050", name: "Digital Flow Meter 50mm", category: "Instrumentation", brand: "Metrix", unit: "PCS", barcode: "8901234500504", purchasePrice: 18_600, sellingPrice: 24_200, taxCode: "SR5", tracking: "serial", reorderLevel: 20, onHand: 64, reserved: 8, available: 56, stockValue: 11_90_400, isActive: true },
  { id: "it-13", sku: "PL-GI-050", name: "GI Pipe 50mm Class B", category: "Plumbing", brand: "Ironcore", unit: "MTR", barcode: "8901234500505", purchasePrice: 496, sellingPrice: 642, taxCode: "SR5", tracking: "none", reorderLevel: 1_200, onHand: 14_280, reserved: 1_800, available: 12_480, stockValue: 70_82_880, isActive: true },
  { id: "it-14", sku: "EL-SW-063", name: "MCCB Switchgear 63A", category: "Electrical", brand: "Voltex", unit: "PCS", barcode: "8901234500636", purchasePrice: 6_420, sellingPrice: 8_340, taxCode: "SR5", tracking: "serial", reorderLevel: 50, onHand: 318, reserved: 24, available: 294, stockValue: 20_41_560, isActive: true },
  { id: "it-15", sku: "HW-WR-SET", name: "Spanner Set 8 piece", category: "Hardware", brand: "Gripfast", unit: "SET", barcode: "8901234500888", purchasePrice: 1_240, sellingPrice: 1_680, taxCode: "SR5", tracking: "none", reorderLevel: 60, onHand: 86, reserved: 0, available: 86, stockValue: 1_06_640, isActive: false },
];

export const MOCK_GOODS_RECEIPTS: GoodsReceipt[] = [
  { id: "grn-1872", number: "GRN/26/1872", date: "2026-11-15", sourceType: "purchase_receipt", reference: "PO/26/0914", party: "Vertex Polymers", warehouse: "Central Store", lineCount: 8, quantity: 2_380, value: 12_18_900, tracked: "batch", status: "posted", receivedBy: "S. Iyer" },
  { id: "grn-1869", number: "GRN/26/1869", date: "2026-11-14", sourceType: "purchase_receipt", reference: "PO/26/0908", party: "Allied Metals", warehouse: "Central Store", lineCount: 4, quantity: 1_240, value: 6_40_476, tracked: "none", status: "posted", receivedBy: "S. Iyer" },
  { id: "grn-1865", number: "GRN/26/1865", date: "2026-11-13", sourceType: "sales_return", reference: "CN/26/0142", party: "Oceanic Builders", warehouse: "Central Store", lineCount: 2, quantity: 96, value: 1_09_143, tracked: "none", status: "posted", receivedBy: "A. Sequeira" },
  { id: "grn-1861", number: "GRN/26/1861", date: "2026-11-11", sourceType: "purchase_receipt", reference: "PO/26/0901", party: "Crestline Electricals", warehouse: "North Depot", lineCount: 6, quantity: 1_860, value: 10_88_381, tracked: "serial", status: "posted", receivedBy: "M. Qureshi" },
  { id: "grn-1858", number: "GRN/26/1858", date: "2026-11-10", sourceType: "direct_entry", party: "Local purchase - cash", warehouse: "Retail Counter", lineCount: 3, quantity: 180, value: 64_200, tracked: "none", status: "pending_approval", receivedBy: "A. Sequeira" },
  { id: "grn-1854", number: "GRN/26/1854", date: "2026-11-06", sourceType: "purchase_receipt", reference: "PO/26/0894", party: "Pinnacle Packaging", warehouse: "Central Store", lineCount: 5, quantity: 3_400, value: 8_23_143, tracked: "none", status: "posted", receivedBy: "S. Iyer" },
  { id: "grn-1848", number: "GRN/26/1848", date: "2026-11-03", sourceType: "purchase_receipt", reference: "PO/26/0888", party: "Summit Tooling", warehouse: "South Hub", lineCount: 2, quantity: 240, value: 4_93_714, tracked: "none", status: "posted", receivedBy: "D. Rao" },
  { id: "grn-1840", number: "GRN/26/1840", date: "2026-10-30", sourceType: "purchase_receipt", reference: "PO/26/0881", party: "Orion Chemicals", warehouse: "Port Bonded", lineCount: 3, quantity: 420, value: 2_30_476, tracked: "batch", status: "posted", receivedBy: "F. Dias" },
  { id: "grn-1832", number: "GRN/26/1832", date: "2026-10-26", sourceType: "purchase_receipt", reference: "PO/26/0874", party: "Vertex Polymers", warehouse: "Central Store", lineCount: 9, quantity: 2_640, value: 12_91_810, tracked: "batch", status: "posted", receivedBy: "S. Iyer" },
  { id: "grn-1820", number: "GRN/26/1820", date: "2026-10-01", sourceType: "opening_stock", party: "Opening balance upload", warehouse: "Central Store", lineCount: 486, quantity: 68_400, value: 88_42_000, tracked: "none", status: "posted", receivedBy: "R. Menon" },
];

export const MOCK_STOCK_ISSUES: StockIssue[] = [
  { id: "iss-4418", number: "ISS/26/4418", date: "2026-11-15", issueType: "sales_delivery", reference: "SI/26/4418", party: "Oceanic Builders", warehouse: "Central Store", lineCount: 6, quantity: 1_840, value: 6_92_400, status: "posted", issuedBy: "S. Iyer" },
  { id: "iss-4412", number: "ISS/26/4412", date: "2026-11-15", issueType: "sales_delivery", reference: "SI/26/4401", party: "Trident Facility Services", warehouse: "North Depot", lineCount: 3, quantity: 620, value: 8_64_100, status: "posted", issuedBy: "M. Qureshi" },
  { id: "iss-4406", number: "ISS/26/4406", date: "2026-11-14", issueType: "internal_consumption", party: "Maintenance - Central Store", warehouse: "Central Store", lineCount: 2, quantity: 48, value: 32_800, status: "posted", issuedBy: "S. Iyer" },
  { id: "iss-4401", number: "ISS/26/4401", date: "2026-11-13", issueType: "sales_delivery", reference: "SI/26/4388", party: "Kinetic Infra Projects", warehouse: "Central Store", lineCount: 9, quantity: 2_410, value: 14_18_600, status: "posted", issuedBy: "S. Iyer" },
  { id: "iss-4396", number: "ISS/26/4396", date: "2026-11-12", issueType: "damaged", party: "Write-off - handling damage", warehouse: "Port Bonded", lineCount: 1, quantity: 18, value: 48_600, status: "pending_approval", issuedBy: "F. Dias" },
  { id: "iss-4388", number: "ISS/26/4388", date: "2026-11-10", issueType: "sales_delivery", reference: "SI/26/4396", party: "Northline Retail", warehouse: "Retail Counter", lineCount: 4, quantity: 320, value: 2_84_200, status: "posted", issuedBy: "A. Sequeira" },
  { id: "iss-4380", number: "ISS/26/4380", date: "2026-11-08", issueType: "sample", party: "Vantage Interiors - sample set", warehouse: "Central Store", lineCount: 2, quantity: 12, value: 18_400, status: "posted", issuedBy: "D. Rao" },
  { id: "iss-4372", number: "ISS/26/4372", date: "2026-11-05", issueType: "sales_delivery", reference: "SI/26/4372", party: "Summit Electricals", warehouse: "North Depot", lineCount: 5, quantity: 940, value: 7_12_300, status: "posted", issuedBy: "M. Qureshi" },
];

export const MOCK_TRANSFERS: StockTransferDoc[] = [
  { id: "trf-0612", number: "TRF/26/0612", date: "2026-11-14", fromWarehouse: "Central Store", toWarehouse: "South Hub", lineCount: 7, quantity: 1_420, value: 6_18_400, status: "pending_approval", requestedBy: "M. Qureshi" },
  { id: "trf-0608", number: "TRF/26/0608", date: "2026-11-13", fromWarehouse: "Central Store", toWarehouse: "North Depot", lineCount: 4, quantity: 860, value: 4_12_600, status: "in_transit", dispatchedOn: "2026-11-13", requestedBy: "S. Iyer" },
  { id: "trf-0604", number: "TRF/26/0604", date: "2026-11-11", fromWarehouse: "Port Bonded", toWarehouse: "Central Store", lineCount: 3, quantity: 480, value: 3_46_800, status: "in_transit", dispatchedOn: "2026-11-12", requestedBy: "F. Dias" },
  { id: "trf-0598", number: "TRF/26/0598", date: "2026-11-08", fromWarehouse: "Central Store", toWarehouse: "Retail Counter", lineCount: 6, quantity: 340, value: 1_84_200, status: "received", dispatchedOn: "2026-11-08", receivedOn: "2026-11-09", requestedBy: "A. Sequeira" },
  { id: "trf-0591", number: "TRF/26/0591", date: "2026-11-04", fromWarehouse: "North Depot", toWarehouse: "South Hub", lineCount: 2, quantity: 220, value: 2_18_600, status: "received", dispatchedOn: "2026-11-04", receivedOn: "2026-11-06", requestedBy: "D. Rao" },
  { id: "trf-0584", number: "TRF/26/0584", date: "2026-11-01", fromWarehouse: "Central Store", toWarehouse: "North Depot", lineCount: 9, quantity: 2_180, value: 9_84_300, status: "received", dispatchedOn: "2026-11-01", receivedOn: "2026-11-03", requestedBy: "S. Iyer" },
  { id: "trf-0580", number: "TRF/26/0580", date: "2026-10-29", fromWarehouse: "Central Store", toWarehouse: "Port Bonded", lineCount: 1, quantity: 60, value: 52_400, status: "cancelled", requestedBy: "F. Dias" },
];

export const MOCK_ADJUSTMENTS: StockAdjustmentDoc[] = [
  { id: "adj-0094", number: "ADJ/26/0094", date: "2026-11-15", warehouse: "Port Bonded", reason: "damage", direction: "decrease", lineCount: 3, quantity: 96, value: 2_18_400, status: "pending_approval", requestedBy: "S. Iyer" },
  { id: "adj-0091", number: "ADJ/26/0091", date: "2026-11-12", warehouse: "Central Store", reason: "physical_count", direction: "increase", lineCount: 12, quantity: 184, value: 1_42_600, status: "posted", requestedBy: "S. Iyer", approvedBy: "R. Menon" },
  { id: "adj-0088", number: "ADJ/26/0088", date: "2026-11-10", warehouse: "North Depot", reason: "shortage", direction: "decrease", lineCount: 5, quantity: 62, value: 84_200, status: "posted", requestedBy: "M. Qureshi", approvedBy: "R. Menon" },
  { id: "adj-0084", number: "ADJ/26/0084", date: "2026-11-07", warehouse: "Central Store", reason: "expiry", direction: "decrease", lineCount: 2, quantity: 24, value: 59_520, status: "posted", requestedBy: "S. Iyer", approvedBy: "R. Menon" },
  { id: "adj-0080", number: "ADJ/26/0080", date: "2026-11-04", warehouse: "Retail Counter", reason: "reclassification", direction: "increase", lineCount: 4, quantity: 48, value: 26_400, status: "posted", requestedBy: "A. Sequeira", approvedBy: "R. Menon" },
  { id: "adj-0076", number: "ADJ/26/0076", date: "2026-10-31", warehouse: "South Hub", reason: "physical_count", direction: "decrease", lineCount: 8, quantity: 118, value: 1_18_900, status: "posted", requestedBy: "D. Rao", approvedBy: "R. Menon" },
  { id: "adj-0072", number: "ADJ/26/0072", date: "2026-10-28", warehouse: "Central Store", reason: "damage", direction: "decrease", lineCount: 1, quantity: 6, value: 14_760, status: "cancelled", requestedBy: "S. Iyer" },
];

export const MOCK_VALUATION: ValuationRow[] = [
  { id: "val-01", sku: "EL-CB-004", item: "Cable Drum 4 core 25sqmm", warehouse: "Central Store", quantity: 6_240, unit: "MTR", weightedAvgRate: 842, fifoRate: 851, landedCost: 18_420, value: 52_54_080, lastMovementOn: "2026-11-15" },
  { id: "val-02", sku: "PL-GI-050", item: "GI Pipe 50mm Class B", warehouse: "Central Store", quantity: 8_400, unit: "MTR", weightedAvgRate: 496, fifoRate: 503, landedCost: 12_600, value: 41_66_400, lastMovementOn: "2026-11-14" },
  { id: "val-03", sku: "EL-SW-063", item: "MCCB Switchgear 63A", warehouse: "North Depot", quantity: 184, unit: "PCS", weightedAvgRate: 6_420, fifoRate: 6_480, landedCost: 8_200, value: 11_81_280, lastMovementOn: "2026-11-13" },
  { id: "val-04", sku: "CH-LU-020", item: "Industrial Lubricant 20L", warehouse: "Port Bonded", quantity: 268, unit: "UNT", weightedAvgRate: 4_260, fifoRate: 4_318, landedCost: 24_800, value: 11_41_680, lastMovementOn: "2026-11-11" },
  { id: "val-05", sku: "IN-FM-050", item: "Digital Flow Meter 50mm", warehouse: "Central Store", quantity: 42, unit: "PCS", weightedAvgRate: 18_600, fifoRate: 18_940, landedCost: 6_400, value: 7_81_200, lastMovementOn: "2026-11-09" },
  { id: "val-06", sku: "HW-AN-012", item: "Anchor Bolt 12mm", warehouse: "South Hub", quantity: 16_400, unit: "PCS", weightedAvgRate: 38, fifoRate: 39, landedCost: 3_200, value: 6_23_200, lastMovementOn: "2026-11-08" },
  { id: "val-07", sku: "SF-HG-001", item: "Safety Helmet Grade A", warehouse: "Central Store", quantity: 1_240, unit: "PCS", weightedAvgRate: 384, fifoRate: 388, landedCost: 1_800, value: 4_76_160, lastMovementOn: "2026-11-07" },
  { id: "val-08", sku: "EL-PV-025", item: "PVC Conduit 25mm", warehouse: "North Depot", quantity: 12_600, unit: "MTR", weightedAvgRate: 64, fifoRate: 66, landedCost: 2_400, value: 8_06_400, lastMovementOn: "2026-11-06" },
  { id: "val-09", sku: "IN-PG-040", item: "Analog Pressure Gauge", warehouse: "South Hub", quantity: 186, unit: "PCS", weightedAvgRate: 1_840, fifoRate: 1_862, landedCost: 0, value: 3_42_240, lastMovementOn: "2026-04-15" },
  { id: "val-10", sku: "CH-EP-005", item: "Epoxy Sealant 5L", warehouse: "Central Store", quantity: 96, unit: "UNT", weightedAvgRate: 2_480, fifoRate: 2_512, landedCost: 4_200, value: 2_38_080, lastMovementOn: "2026-11-05" },
];

export const MOCK_STOCK_LEDGER: StockLedgerRow[] = [
  { id: "sl-01", date: "2026-11-01", reference: "OPENING", movementType: "Opening balance", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 7_200, outQty: 0, balanceQty: 7_200, rate: 838, value: 60_33_600 },
  { id: "sl-02", date: "2026-11-03", reference: "ISS/26/4360", movementType: "Sales delivery", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 0, outQty: 640, balanceQty: 6_560, rate: 838, value: 54_97_280 },
  { id: "sl-03", date: "2026-11-06", reference: "GRN/26/1854", movementType: "Goods receipt", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 1_200, outQty: 0, balanceQty: 7_760, rate: 846, value: 65_64_960 },
  { id: "sl-04", date: "2026-11-08", reference: "TRF/26/0598", movementType: "Transfer out", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 0, outQty: 340, balanceQty: 7_420, rate: 846, value: 62_77_320 },
  { id: "sl-05", date: "2026-11-10", reference: "ISS/26/4388", movementType: "Sales delivery", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 0, outQty: 320, balanceQty: 7_100, rate: 846, value: 60_06_600 },
  { id: "sl-06", date: "2026-11-12", reference: "ADJ/26/0091", movementType: "Adjustment +", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 184, outQty: 0, balanceQty: 7_284, rate: 844, value: 61_47_696 },
  { id: "sl-07", date: "2026-11-13", reference: "ISS/26/4401", movementType: "Sales delivery", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 0, outQty: 420, balanceQty: 6_864, rate: 844, value: 57_93_216 },
  { id: "sl-08", date: "2026-11-15", reference: "GRN/26/1872", movementType: "Goods receipt", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 240, outQty: 0, balanceQty: 7_104, rate: 842, value: 59_81_568 },
  { id: "sl-09", date: "2026-11-15", reference: "ISS/26/4418", movementType: "Sales delivery", item: "Cable Drum 4 core 25sqmm", sku: "EL-CB-004", warehouse: "Central Store", inQty: 0, outQty: 864, balanceQty: 6_240, rate: 842, value: 52_54_080 },
];

export const MOCK_INVENTORY_REPORTS = [
  { id: "ir-cur", name: "Current stock", description: "On-hand, reserved and available quantity by item and warehouse.", category: "Stock position", phase: "mvp" as const, lastRunOn: "2026-11-15", href: "/inventory/items" },
  { id: "ir-led", name: "Stock ledger", description: "Every posted movement with running quantity and value.", category: "Stock position", phase: "mvp" as const, lastRunOn: "2026-11-15" },
  { id: "ir-mov", name: "Movement summary", description: "Inward and outward quantity by period, warehouse and item group.", category: "Stock position", phase: "mvp" as const, lastRunOn: "2026-11-14" },
  { id: "ir-val", name: "Valuation report", description: "Closing value by costing method, with landed cost allocation.", category: "Valuation", phase: "limited" as const, lastRunOn: "2026-11-15", href: "/inventory/valuation" },
  { id: "ir-whv", name: "Warehouse valuation", description: "Stock value and utilisation per warehouse and bin.", category: "Valuation", phase: "mvp" as const, href: "/inventory/warehouses" },
  { id: "ir-age", name: "Stock ageing", description: "Quantity and value bucketed by days held.", category: "Valuation", phase: "phase2" as const },
  { id: "ir-bat", name: "Batch & serial register", description: "Batch, serial and expiry traceability per item.", category: "Traceability", phase: "limited" as const },
  { id: "ir-exp", name: "Expiry report", description: "Batches approaching or past expiry, by warehouse.", category: "Traceability", phase: "limited" as const, href: "/inventory/alerts" },
  { id: "ir-slw", name: "Slow and dead stock", description: "Items with no movement in the selected window.", category: "Exceptions", phase: "mvp" as const, lastRunOn: "2026-11-12" },
  { id: "ir-reo", name: "Reorder report", description: "Items below reorder level with open purchase cover.", category: "Exceptions", phase: "mvp" as const, href: "/inventory/alerts" },
  { id: "ir-rec", name: "Stock reconciliation", description: "Physical count against book stock with variance value.", category: "Exceptions", phase: "mvp" as const, href: "/inventory/stock-adjustment" },
  { id: "ir-neg", name: "Negative stock report", description: "Items showing negative on-hand and the movements behind them.", category: "Exceptions", phase: "mvp" as const, lastRunOn: "2026-11-15" },
];
