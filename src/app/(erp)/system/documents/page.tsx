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
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Documents"
        subtitle="Attachments for invoices, receipts and supporting documents, with search and access control"
        phase="limited"
        phaseNote="Document lifecycle in Phase 2"
        actions={
          <ActionButton variant="primary" icon={<Upload className="size-3.5" />}>
            Upload document
          </ActionButton>
        }
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
