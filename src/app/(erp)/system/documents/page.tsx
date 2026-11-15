import type { Metadata } from "next";
import { Upload } from "lucide-react";
import { DocumentsView } from "./documents-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getDocuments } from "@/lib/api/client";

export const metadata: Metadata = { title: "Documents" };

export const instant = false;

export default async function DocumentsPage() {
  const documents = await getDocuments();

  const totalKb = documents.reduce((sum, document) => sum + document.sizeKb, 0);
  const restricted = documents.filter((document) => document.access !== "all_users").length;
  const modules = new Set(documents.map((document) => document.module)).size;

  return (
    <div className="page-stack">
      <PageHeader
        title="Documents"
        subtitle="Attachments and access control"
        note="Attachment, search and access control in Phase 1. Versioning and document lifecycle are Phase 2."
        actions={<ActionButton variant="primary" icon={<Upload className="size-3.5" />}>Upload document</ActionButton>}
      />

      <SummaryStrip
        items={[
          {
            label: "Files stored",
            value: String(documents.length),
            caption: `Across ${modules} modules`,
          },
          {
            label: "Storage used",
            value: `${(totalKb / 1024).toFixed(1)} MB`,
            caption: "Private object storage, signed download links",
          },
          {
            label: "Access controlled",
            value: String(restricted),
            caption: "Files limited to finance, managers or named users",
          },
          {
            label: "Retention policy",
            value: "7 years",
            caption: "Applies to statutory accounting documents",
            tone: "muted",
          },
        ]}
      />

      <DocumentsView documents={documents} />
    </div>
  );
}
