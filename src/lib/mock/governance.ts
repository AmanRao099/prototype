import type {
  ApprovalDelegation,
  ApprovalHistoryEntry,
  AuditFieldChange,
  DocumentVersion,
} from "@/lib/types";

/** Phase 2 sample data for approvals, document versions and audit detail. */

export const MOCK_DELEGATIONS: ApprovalDelegation[] = [
  {
    id: "dl-01",
    fromUser: "R. Menon",
    toUser: "A. Fernandes",
    documentTypes: ["Payment Voucher", "Purchase Invoice"],
    startsOn: "2026-11-18",
    endsOn: "2026-11-27",
    reason: "Annual leave - payments must keep moving",
    status: "scheduled",
  },
  {
    id: "dl-02",
    fromUser: "S. Iyer",
    toUser: "M. Qureshi",
    documentTypes: ["Stock Adjustment", "Stock Transfer"],
    startsOn: "2026-11-10",
    endsOn: "2026-11-20",
    reason: "Covering the Central Store stock count",
    status: "active",
  },
  {
    id: "dl-03",
    fromUser: "N. Shaikh",
    toUser: "R. Menon",
    documentTypes: ["Purchase Invoice"],
    startsOn: "2026-10-05",
    endsOn: "2026-10-18",
    reason: "Sick leave",
    status: "expired",
  },
];

export const MOCK_APPROVAL_HISTORY: ApprovalHistoryEntry[] = [
  {
    id: "ah-01",
    documentType: "Purchase Invoice",
    reference: "PI/26/2270",
    party: "Allied Metals",
    amount: 6_72_500,
    raisedBy: "N. Shaikh",
    raisedAt: "2026-11-14T10:12:00+05:30",
    completedAt: "2026-11-14T18:44:00+05:30",
    outcome: "approved",
    steps: [
      {
        level: 1,
        approver: "Purchase Head",
        decision: "approved",
        at: "2026-11-14T12:40:00+05:30",
        comment: "Matched to GRN/26/1869, quantities verified",
      },
      {
        level: 2,
        approver: "Finance Controller",
        decision: "approved",
        at: "2026-11-14T18:44:00+05:30",
      },
    ],
  },
  {
    id: "ah-02",
    documentType: "Stock Adjustment",
    reference: "ADJ/26/0091",
    party: "Central Store",
    amount: 1_42_600,
    raisedBy: "S. Iyer",
    raisedAt: "2026-11-12T09:30:00+05:30",
    completedAt: "2026-11-12T15:02:00+05:30",
    outcome: "approved",
    steps: [
      {
        level: 1,
        approver: "Warehouse Manager",
        decision: "approved",
        at: "2026-11-12T11:15:00+05:30",
        actedFor: "S. Iyer",
        comment: "Count sheet attached, variance within tolerance",
      },
      {
        level: 2,
        approver: "Finance Controller",
        decision: "approved",
        at: "2026-11-12T15:02:00+05:30",
      },
    ],
  },
  {
    id: "ah-03",
    documentType: "Payment Voucher",
    reference: "PV/26/0877",
    party: "Harbour Logistics",
    amount: 2_18_400,
    raisedBy: "A. Fernandes",
    raisedAt: "2026-11-11T14:02:00+05:30",
    completedAt: "2026-11-11T16:20:00+05:30",
    outcome: "rejected",
    steps: [
      {
        level: 1,
        approver: "Accountant",
        decision: "approved",
        at: "2026-11-11T14:48:00+05:30",
      },
      {
        level: 2,
        approver: "Finance Controller",
        decision: "rejected",
        at: "2026-11-11T16:20:00+05:30",
        comment: "Supplier invoice not yet matched to a goods receipt",
      },
    ],
  },
  {
    id: "ah-04",
    documentType: "Sales Invoice",
    reference: "SI/26/4410",
    party: "Kinetic Infra Projects",
    amount: 22_14_800,
    raisedBy: "D. Rao",
    raisedAt: "2026-11-14T15:22:00+05:30",
    outcome: "in_progress",
    steps: [
      {
        level: 1,
        approver: "Finance Controller",
        decision: "pending",
        comment: "Credit limit exceeded by 16,33,400",
      },
    ],
  },
  {
    id: "ah-05",
    documentType: "Stock Transfer",
    reference: "TRF/26/0598",
    party: "Central Store to Retail Counter",
    raisedBy: "A. Sequeira",
    raisedAt: "2026-11-08T08:40:00+05:30",
    completedAt: "2026-11-08T09:05:00+05:30",
    outcome: "approved",
    steps: [
      {
        level: 1,
        approver: "Warehouse Manager",
        decision: "approved",
        at: "2026-11-08T09:05:00+05:30",
      },
    ],
  },
];

/** Tags and version history keyed by document id. */
export const MOCK_DOCUMENT_TAGS: Record<string, string[]> = {
  "doc-01": ["invoice", "customer copy"],
  "doc-02": ["supplier invoice", "awaiting approval"],
  "doc-03": ["proof of delivery", "weighbridge"],
  "doc-04": ["bank advice", "receipt"],
  "doc-05": ["stock count", "working paper"],
  "doc-06": ["contract", "credit"],
  "doc-07": ["lease", "recurring"],
  "doc-08": ["vat", "working paper"],
  "doc-09": ["dispatch", "transfer"],
  "doc-10": ["onboarding", "supplier"],
};

export const MOCK_DOCUMENT_VERSIONS: Record<string, DocumentVersion[]> = {
  "doc-05": [
    {
      version: 3,
      uploadedBy: "S. Iyer",
      uploadedAt: "2026-11-12T17:40:00+05:30",
      sizeKb: 318,
      note: "Recount of aisle C added, variance signed by the manager",
    },
    {
      version: 2,
      uploadedBy: "S. Iyer",
      uploadedAt: "2026-11-12T13:05:00+05:30",
      sizeKb: 296,
      note: "Second pass after the system freeze",
    },
    {
      version: 1,
      uploadedBy: "M. Qureshi",
      uploadedAt: "2026-11-12T09:20:00+05:30",
      sizeKb: 281,
      note: "First count sheet upload",
    },
  ],
  "doc-08": [
    {
      version: 2,
      uploadedBy: "R. Menon",
      uploadedAt: "2026-11-14T19:02:00+05:30",
      sizeKb: 642,
      note: "Bad debt relief claim added to box 1a workings",
    },
    {
      version: 1,
      uploadedBy: "A. Fernandes",
      uploadedAt: "2026-11-13T11:48:00+05:30",
      sizeKb: 588,
      note: "Initial extract from the return workings",
    },
  ],
};

/** Field-level changes behind the audit events that recorded an edit. */
export const MOCK_AUDIT_CHANGES: Record<string, AuditFieldChange[]> = {
  "ae-05": [
    { field: "Reason", before: "Shortage", after: "Damaged stock" },
    { field: "Narration", before: "Count variance aisle B", after: "Water damage during unloading" },
  ],
  "ae-08": [{ field: "Next number", before: "4418", after: "4419" }],
  "ae-10": [{ field: "Status", before: "Posted", after: "Reversed" }],
  "ae-11": [
    { field: "Status", before: "Active", after: "Suspended" },
    { field: "Suspended reason", before: "-", after: "Pending access review" },
  ],
  "ae-01": [
    { field: "Customer", before: "-", after: "Oceanic Builders" },
    { field: "Total", before: "-", after: "8,64,200.00" },
    { field: "Due date", before: "-", after: "15 Dec 2026" },
  ],
  "ae-07": [{ field: "Approval state", before: "Pending level 2", after: "Approved and posted" }],
};
