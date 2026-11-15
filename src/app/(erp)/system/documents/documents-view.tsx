"use client";

import { useState } from "react";
import { FileImage, FileSpreadsheet, FileText, FileType, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDateTime } from "@/lib/format";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/ui/panel";
import type { DocumentFile, DocumentVersion } from "@/lib/types";
import { cn } from "@/lib/utils";

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

export function DocumentsView({
  documents,
  tags,
  versions,
}: {
  documents: DocumentFile[];
  tags: Record<string, string[]>;
  versions: Record<string, DocumentVersion[]>;
}) {
  const [search, setSearch] = useState("");
  const [module, setModule] = useState("all");
  const [access, setAccess] = useState("all");
  const [tag, setTag] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allTags = Array.from(new Set(Object.values(tags).flat())).sort();

  const modules = Array.from(new Set(documents.map((document) => document.module))).sort();
  const needle = search.trim().toLowerCase();

  const rows = documents.filter((document) => {
    if (module !== "all" && document.module !== module) return false;
    if (access !== "all" && document.access !== access) return false;
    if (tag !== "all" && !(tags[document.id] ?? []).includes(tag)) return false;
    if (!needle) return true;
    // Phase 2 search covers tags and the linked document, not just the file name.
    return (
      document.name.toLowerCase().includes(needle) ||
      document.linkedTo.toLowerCase().includes(needle) ||
      document.uploadedBy.toLowerCase().includes(needle) ||
      document.module.toLowerCase().includes(needle) ||
      (tags[document.id] ?? []).some((entry) => entry.includes(needle))
    );
  });

  const selected = documents.find((document) => document.id === selectedId);
  const selectedVersions = selectedId ? (versions[selectedId] ?? []) : [];

  const columns: Array<Column<DocumentFile>> = [
    {
      key: "name",
      header: "File",
      cell: (document) => {
        const Icon = TYPE_ICON[document.fileType];
        const versionCount = versions[document.id]?.length ?? 1;
        return (
          <button
            type="button"
            onClick={() => setSelectedId(document.id === selectedId ? null : document.id)}
            className="flex items-center gap-2 text-left"
          >
            <Icon className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <CellStack
              primary={document.name}
              secondary={`${formatSize(document.sizeKb)}${versionCount > 1 ? ` · v${versionCount}` : ""}`}
            />
          </button>
        );
      },
    },
    {
      key: "tags",
      header: "Tags",
      hideBelow: "xl",
      cell: (document) => (
        <span className="flex flex-wrap gap-1">
          {(tags[document.id] ?? []).map((entry) => (
            <Badge key={entry} tone="neutral">
              {entry}
            </Badge>
          ))}
        </span>
      ),
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
    <div className="flex flex-col gap-3">
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
          {
            id: "tag",
            label: "Tag",
            value: tag,
            onChange: setTag,
            options: [
              { value: "all", label: "All tags" },
              ...allTags.map((value) => ({ value, label: value })),
            ],
          },
        ]}
      >
        <ResultCount shown={rows.length} total={documents.length} noun="files" />
      </Toolbar>

      <DataTable columns={columns} rows={rows} minWidth="min-w-[1040px]" />
    </Panel>

    {selected ? (
      <Panel>
        <PanelHeader
          title={selected.name}
          subtitle={`${selected.module} · linked to ${selected.linkedTo}`}
          action={
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
            >
              Close
            </button>
          }
        />
        <PanelBody>
          {selectedVersions.length > 0 ? (
            <ol className="relative space-y-3 border-l border-hairline pl-5">
              {selectedVersions.map((version, index) => (
                <li key={version.version} className="relative">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1.5 -left-[23px] size-2 rounded-full ring-4 ring-surface",
                      index === 0 ? "bg-accent" : "bg-axis",
                    )}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[12.5px] text-ink">
                      <span className="font-medium">Version {version.version}</span>
                      {index === 0 ? (
                        <span className="ml-2 text-[10.5px] text-accent">current</span>
                      ) : null}
                    </p>
                    <p className="text-[10.5px] text-ink-muted">
                      {version.uploadedBy} · {formatDateTime(version.uploadedAt)} ·{" "}
                      {formatSize(version.sizeKb)}
                    </p>
                  </div>
                  <p className="mt-1 text-[11.5px] text-ink-secondary">{version.note}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[12px] text-ink-secondary">
              Single version, uploaded by {selected.uploadedBy} on{" "}
              {formatDateTime(selected.uploadedAt)}. Replacing this file keeps the previous copy and
              records who changed it.
            </p>
          )}
        </PanelBody>
        <PanelFooter>
          <span>Access: {ACCESS_LABEL[selected.access]}</span>
          <span className="text-ink-secondary">
            {(tags[selected.id] ?? []).join(", ") || "No tags"}
          </span>
        </PanelFooter>
      </Panel>
    ) : null}
    </div>
  );
}
