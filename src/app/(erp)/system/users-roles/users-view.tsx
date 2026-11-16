"use client";

import { useState } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CellStack, DataTable, type Column } from "@/components/ui/data-table";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { ResultCount, Toolbar } from "@/components/ui/toolbar";
import { formatDateTime } from "@/lib/format";
import type { PermissionAction, Role, SystemUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACTIONS: PermissionAction[] = ["view", "create", "edit", "approve", "delete"];
const ACTION_LABEL: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  approve: "Approve",
  delete: "Delete",
};
const MODULES = ["Accounting", "Inventory", "Reporting", "System"];

export function UsersRolesView({ users, roles }: { users: SystemUser[]; roles: Role[] }) {
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id ?? "");

  const needle = search.trim().toLowerCase();
  const rows = users.filter((user) => {
    if (roleFilter !== "all" && user.roleId !== roleFilter) return false;
    if (status !== "all" && user.status !== status) return false;
    if (!needle) return true;
    return (
      user.name.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle) ||
      user.roleName.toLowerCase().includes(needle)
    );
  });

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  const userColumns: Array<Column<SystemUser>> = [
    {
      key: "user",
      header: "User",
      cell: (user) => <CellStack primary={user.name} secondary={user.email} />,
    },
    { key: "role", header: "Role", cell: (user) => user.roleName },
    {
      key: "branches",
      header: "Branch access",
      hideBelow: "lg",
      cell: (user) =>
        user.branches.length > 1 ? `${user.branches.length} branches` : user.branches[0],
    },
    {
      key: "mfa",
      header: "2FA",
      hideBelow: "md",
      cell: (user) =>
        user.mfaEnabled ? (
          <span className="inline-flex items-center gap-1 text-ink-secondary">
            <ShieldCheck className="size-3.5 shrink-0 text-good" aria-hidden />
            Enabled
          </span>
        ) : (
          <span className="text-delta-down">Not enabled</span>
        ),
    },
    {
      key: "lastLogin",
      header: "Last sign-in",
      hideBelow: "lg",
      cell: (user) =>
        user.lastLoginAt ? formatDateTime(user.lastLoginAt) : <span className="text-ink-muted">Never</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      cell: (user) => (
        <Badge tone={user.status === "active" ? "good" : user.status === "invited" ? "warning" : "critical"} dot>
          {user.status === "active" ? "Active" : user.status === "invited" ? "Invited" : "Suspended"}
        </Badge>
      ),
    },
  ];

  const roleColumns: Array<Column<Role>> = [
    {
      key: "role",
      header: "Role",
      cell: (role) => (
        <button
          type="button"
          onClick={() => setSelectedRoleId(role.id)}
          className="text-left"
        >
          <CellStack primary={role.name} secondary={role.description} />
        </button>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      hideBelow: "md",
      cell: (role) => (role.scope === "company" ? "Whole company" : "Assigned branches"),
    },
    { key: "users", header: "Users", align: "right", cell: (role) => role.userCount },
    {
      key: "system",
      header: "Type",
      align: "right",
      hideBelow: "lg",
      cell: (role) =>
        role.isSystem ? <Badge tone="neutral">Built in</Badge> : <span className="text-ink-muted">Custom</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        tabs={[
          { id: "users", label: "Users", count: users.length },
          { id: "roles", label: "Roles & permissions", count: roles.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === "users" ? (
        <Panel>
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email or role"
            filters={[
              {
                id: "role",
                label: "Role",
                value: roleFilter,
                onChange: setRoleFilter,
                options: [
                  { value: "all", label: "All roles" },
                  ...roles.map((role) => ({ value: role.id, label: role.name })),
                ],
              },
              {
                id: "status",
                label: "Status",
                value: status,
                onChange: setStatus,
                options: [
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "invited", label: "Invited" },
                  { value: "suspended", label: "Suspended" },
                ],
              },
            ]}
          >
            <ResultCount shown={rows.length} total={users.length} noun="users" />
          </Toolbar>
          <DataTable columns={userColumns} rows={rows} minWidth="min-w-[900px]" />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <PanelHeader title="Roles" subtitle="Select a role to see its permission matrix" />
            <DataTable columns={roleColumns} rows={roles} minWidth="min-w-[680px]" />
          </Panel>

          <Panel className="self-start">
            <PanelHeader
              title={selectedRole?.name ?? "Permissions"}
              subtitle={`${selectedRole?.userCount ?? 0} users · ${selectedRole?.scope === "company" ? "whole company" : "assigned branches"}`}
            />
            <PanelBody flush>
              <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[11.5px]">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th scope="col" className="px-4 py-2 text-[11.5px] font-medium text-ink-muted">
                      Module
                    </th>
                    {ACTIONS.map((action) => (
                      <th
                        key={action}
                        scope="col"
                        className="px-1.5 py-2 text-center text-[11.5px] font-medium text-ink-muted"
                      >
                        {ACTION_LABEL[action].slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((module) => {
                    const granted =
                      selectedRole?.permissions.find((permission) => permission.module === module)
                        ?.actions ?? [];
                    return (
                      <tr key={module} className="border-b border-hairline/60 last:border-0">
                        <td className="px-4 py-2 text-ink">{module}</td>
                        {ACTIONS.map((action) => (
                          <td key={action} className="px-1.5 py-2 text-center">
                            {granted.includes(action) ? (
                              <Check
                                className="mx-auto size-3.5 text-good"
                                aria-label={`${ACTION_LABEL[action]} allowed`}
                              />
                            ) : (
                              <Minus
                                className="mx-auto size-3 text-ink-muted/60"
                                aria-label={`${ACTION_LABEL[action]} not allowed`}
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </PanelBody>
            <div className={cn("border-t border-hairline px-4 py-2.5 text-[11px] text-ink-muted")}>
              Data-level restrictions beyond branch scope are a Phase 2 item.
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
