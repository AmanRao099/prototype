import type { Metadata } from "next";
import { Plus, Route } from "lucide-react";
import { TransferView } from "./transfer-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getStockTransfers } from "@/lib/api/client";
import { formatMoneyCompact, formatQty, toNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Stock Transfer" };

export const instant = false;

export default async function StockTransferPage() {
  const transfers = await getStockTransfers();

  const inTransit = transfers.filter((transfer) => transfer.status === "in_transit");
  const inTransitValue = inTransit.reduce((sum, transfer) => sum + toNumber(transfer.value), 0);
  const awaiting = transfers.filter((transfer) => transfer.status === "pending_approval");
  const received = transfers.filter((transfer) => transfer.status === "received");
  const movedQty = received.reduce((sum, transfer) => sum + transfer.quantity, 0);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Stock Transfer"
        subtitle="Warehouse transfers, transfer requests and approvals, dispatch, receipt confirmation and in-transit tracking"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Route className="size-3.5" />}>In-transit report</ActionButton>
            <ActionButton variant="primary" icon={<Plus className="size-3.5" />}>
              New transfer request
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "In transit",
            value: formatMoneyCompact(inTransitValue),
            caption: `${inTransit.length} transfers on the move`,
          },
          {
            label: "Awaiting approval",
            value: String(awaiting.length),
            caption: "Dispatch blocked until approved",
            tone: awaiting.length > 0 ? "critical" : "good",
          },
          {
            label: "Completed this period",
            value: String(received.length),
            caption: `${formatQty(movedQty)} units confirmed on receipt`,
          },
          {
            label: "Open transfer lines",
            value: String(
              [...inTransit, ...awaiting].reduce((sum, transfer) => sum + transfer.lineCount, 0),
            ),
            caption: "Counted in transit until received",
            tone: "muted",
          },
        ]}
      />

      <TransferView transfers={transfers} />
    </div>
  );
}
