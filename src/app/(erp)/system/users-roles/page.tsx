import type { Metadata } from "next";
import { Plus, UserPlus } from "lucide-react";
import { UsersRolesView } from "./users-view";
import { ActionButton, PageHeader } from "@/components/ui/page-header";
import { SummaryStrip } from "@/components/ui/summary-strip";
import { getRoles, getUsers } from "@/lib/api/client";

export const metadata: Metadata = { title: "Users & Roles" };

export const instant = false;

export default async function UsersRolesPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  const active = users.filter((user) => user.status === "active");
  const withoutMfa = active.filter((user) => !user.mfaEnabled).length;
  const invited = users.filter((user) => user.status === "invited").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Users & Roles"
        subtitle="User accounts, role-based access, module and action permissions and data-level restrictions"
        phase="mvp"
        actions={
          <>
            <ActionButton icon={<Plus className="size-3.5" />}>New role</ActionButton>
            <ActionButton variant="primary" icon={<UserPlus className="size-3.5" />}>
              Invite user
            </ActionButton>
          </>
        }
      />

      <SummaryStrip
        items={[
          {
            label: "Active users",
            value: String(active.length),
            caption: `${users.length} accounts in total`,
          },
          {
            label: "Roles defined",
            value: String(roles.length),
            caption: `${roles.filter((role) => role.isSystem).length} built in, rest custom`,
          },
          {
            label: "Without 2FA",
            value: String(withoutMfa),
            caption: "Enforced for finance and admin roles only",
            tone: withoutMfa > 0 ? "critical" : "good",
          },
          {
            label: "Pending invitations",
            value: String(invited),
            caption: "Awaiting first sign-in",
            tone: "muted",
          },
        ]}
      />

      <UsersRolesView users={users} roles={roles} />
    </div>
  );
}
