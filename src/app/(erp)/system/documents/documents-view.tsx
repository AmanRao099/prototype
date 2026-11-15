"use client";

import { useState } from "react";
import { FileImage, FileSpreadsheet, FileText, FileType, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel } from "@/components/ui/panel";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDateTime } from "@/lib/format";
import type { DocumentFile } from "@/lib/types";

const TYPE_ICON = {
  pdf: FileText,
  image: FileImage,
  spreadsheet: FileSpreadsheet,
  document: FileType,
} as const;

const ACCESS_LABEL: Record<DocumentFile["access"], string> = {
  all_users: "All users",
  finance_only: "Finance only",
  managers: "Managers",
  restricted: "Restricted",
};

function formatSize(sizeKb: number): string {
  return sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
}

export function DocumentsView({ documents }: { documents: DocumentFile[] }) {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [access, setAccess] = useState("all");

  const modules = Array.from(new Set(documents.map((document) => document.module))).sort();
  const needle = search.trim().toLowerCase();

  const rows = documents.filter((document) => {
    if (module !== "all" && document.module !== module) return false;
    if (access !== "all" && document.access !== access) return false;
    if (!needle) return true;
    return (
      document.name.toLowerCase().includes(needle) ||
      document.linkedTo.toLowerCase().includes(needle) ||
      document.uploadedBy.toLowerCase().includes(needle)
    );
  });

  const columns: Array<Column<DocumentFile>> = [
    {
      key: "name",
      header: "File",
      cell: (document) => {
        const Icon = TYPE_ICON[document.fileType];
        return (
          <span className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <CellStack primary={document.name} secondary={formatSize(document.sizeKb)} />
          </span>
        );
      },
    },
    { key: "module", header: "Module", hideBelow: "md", cell: (document) => document.module },
    {
      key: "linked",
      header: "Linked to",
      cell: (document) => <span className="text-ink">{document.linkedTo}</span>,
    },
    {
      key: "uploaded",
      header: "Uploaded",
      hideBelow: "lg",
      cell: (document) => (
        <CellStack primary={document.uploadedBy} secondary={formatDateTime(document.uploadedAt)} />
      ),
    },
    {
      key: "access",
      header: "Access",
      align: "right",
      cell: (document) =>
        document.access === "all_users" ? (
          <span className="text-ink-muted">{ACCESS_LABEL[document.access]}</span>
        ) : (
          <Badge tone={document.access === "restricted" ? "critical" : "neutral"} dot>
            <Lock className="size-3" aria-hidden />
            {ACCESS_LABEL[document.access]}
          </Badge>
        ),
    },
  ];

  return (
    <Panel>
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search file name, linked document or uploader"
        filters={[
          {
            id: "module",
            label: "Module",
            value: module,
            onChange: setModule,
            options: [
              { value: "all", label: "All modules" },
              ...modules.map((value) => ({ value, label: value })),
            ],
          },
          {
            id: "access",
            label: "Access",
            value: access,
            onChange: setAccess,
            options: [
              { value: "all", label: "All access levels" },
              ...Object.entries(ACCESS_LABEL).map(([value, label]) => ({ value, label })),
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={documents.length} noun="files" />
      </Toolbar>

      <DataTable columns={columns} rows={rows} minWidth="min-w-[920px]" />
    </Panel>
  );
}
