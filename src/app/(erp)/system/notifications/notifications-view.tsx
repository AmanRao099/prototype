"use client";

import { useState } from "react";
import { Mail, MonitorSmartphone } from "lucide-react";
import { StatusChip } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDateTime } from "@/lib/format";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<NotificationItem["category"], string> = {
  payment_due: "Payment due",
  low_stock: "Low stock",
  expiry: "Expiry",
  approval: "Approval",
  system: "System",
};

export function NotificationsView({ notifications }: { notifications: NotificationItem[] }) {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const needle = search.trim().toLowerCase();

  const rows = notifications.filter((notification) => {
    if (tab === "unread" && notification.read) return false;
    if (category !== "all" && notification.category !== category) return false;
    if (!needle) return true;
    return (
      notification.title.toLowerCase().includes(needle) ||
      notification.body.toLowerCase().includes(needle) ||
      notification.audience.toLowerCase().includes(needle)
    );
  });

  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "all", label: "All", count: notifications.length },
          { id: "unread", label: "Unread", count: unread },
        ]}
        active={tab}
        onChange={setTab}
      />

      <Panel>
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search notification title, body or audience"
          filters={[
            {
              id: "category",
              label: "Category",
              value: category,
              onChange: setCategory,
              options: [
                { value: "all", label: "All categories" },
                ...Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
              ],
            },
          ]}
        >
          <ResultCount shown={rows.length} total={notifications.length} noun="notifications" />
        </Toolbar>

        {rows.length === 0 ? (
          <p className="px-4 py-14 text-center text-[12.5px] text-ink-secondary">
            Nothing to show for these filters.
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {rows.map((notification) => {
              const ChannelIcon = notification.channel === "email" ? Mail : MonitorSmartphone;
              return (
                <li
                  key={notification.id}
                  className={cn("flex gap-3 px-4 py-3", !notification.read && "bg-accent-wash/40")}
                >
                  <ChannelIcon className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p
                        className={cn(
                          "min-w-0 text-[12.5px]",
                          notification.read ? "text-ink-secondary" : "font-medium text-ink",
                        )}
                      >
                        {notification.title}
                      </p>
                      <StatusChip
                        level={notification.level}
                        label={CATEGORY_LABEL[notification.category]}
                      />
                    </div>
                    <p className="mt-1 text-[11.5px] text-ink-secondary">{notification.body}</p>
                    <p className="mt-1 text-[10.5px] text-ink-muted">
                      {formatDateTime(notification.at)} · {notification.audience} ·{" "}
                      {notification.channel === "email" ? "Email" : "In app"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
