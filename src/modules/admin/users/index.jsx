import { useState } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import useAllUsers from "./hooks/useAllUsers";
import { createUser, deleteUser } from "./services/userService";
import * as departmentStore from "../../../shared/services/departmentStore";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { AUTHORITY_LEVEL, ROLES } from "../../../config/roles";
import { semanticStatus } from "@/theme/semanticColors";

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Admin", authorityLevel: AUTHORITY_LEVEL.ADMIN },
  { value: ROLES.CEO, label: "CEO", authorityLevel: AUTHORITY_LEVEL.CEO },
  { value: ROLES.CTO, label: "CTO", authorityLevel: AUTHORITY_LEVEL.CTO },
  { value: ROLES.COO, label: "COO", authorityLevel: AUTHORITY_LEVEL.COO },
  { value: ROLES.FINANCE, label: "Financial Officer", authorityLevel: AUTHORITY_LEVEL.FINANCE },
  { value: ROLES.EXECUTIVE, label: "Executive", authorityLevel: AUTHORITY_LEVEL.EXECUTIVE },
  { value: "dept_head", label: "Department Head", authorityLevel: AUTHORITY_LEVEL.EXECUTIVE },
];

const ALL_FEATURES = [
  "EXEC_INTELLIGENCE_V2",
  "FIN_BUDGET_ADVANCED",
  "CEO_STRATEGIC_INSIGHT",
  "ASSIGN_KPI",
  "GRADE_KPI",
  "VIEW_KPI",
  "SUBMIT_KPI_EVIDENCE",
];

const FEATURE_LABELS = {
  EXEC_INTELLIGENCE_V2: "Executive Intelligence",
  FIN_BUDGET_ADVANCED: "Advanced Budget Tools",
  CEO_STRATEGIC_INSIGHT: "CEO Strategic Insight",
  ASSIGN_KPI: "Assign KPIs",
  GRADE_KPI: "Grade KPIs",
  VIEW_KPI: "View KPIs",
  SUBMIT_KPI_EVIDENCE: "Submit KPI Evidence",
};

export default function AdminUsersPage() {
  useDocumentTitle("User Management");
  const usersQuery = useAllUsers();

  return (
    <div>
      <PageSection title="Create User">
        <CreateUserForm onCreated={() => usersQuery.reload()} />
      </PageSection>

      <PageSection title="All Users">
        <ModuleBoundary query={usersQuery} title="Users" emptyText="No users registered.">
          <Grid cols={1}>
            {(usersQuery.data || []).map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onDeleted={() => usersQuery.reload()}
              />
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create User Form
// ---------------------------------------------------------------------------

function CreateUserForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    roleKey: ROLES.EXECUTIVE,
    departmentId: "",
    featureFlags: [],
  });
  const [saving, setSaving] = useState(false);

  const allDepartments = departmentStore.listDepartments();

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleFlag(flag) {
    setForm((prev) => {
      const flags = prev.featureFlags.includes(flag)
        ? prev.featureFlags.filter((f) => f !== flag)
        : [...prev.featureFlags, flag];
      return { ...prev, featureFlags: flags };
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const selectedRole = ROLE_OPTIONS.find((option) => option.value === form.roleKey);
    await createUser({
      ...form,
      authorityLevel: selectedRole?.authorityLevel ?? AUTHORITY_LEVEL.EXECUTIVE,
    });
    setForm({
      name: "",
      email: "",
      roleKey: ROLES.EXECUTIVE,
      departmentId: "",
      featureFlags: [],
    });
    setSaving(false);
    onCreated();
  }

  return (
    <Card>
      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <select
            value={form.roleKey}
            onChange={(e) => update("roleKey", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={form.departmentId}
            onChange={(e) => update("departmentId", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="">Select Department</option>
            {allDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Feature Flags</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ALL_FEATURES.map((flag) => (
              <label key={flag} className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={form.featureFlags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                />
                {FEATURE_LABELS[flag] ?? flag}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create User"}
        </button>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// User Row
// ---------------------------------------------------------------------------

function UserRow({ user, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteUser({ id: user.id });
      setConfirmDelete(false);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold">{user.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {user.email} &middot; Level {user.authorityLevel} &middot; {user.roleKey} &middot;{" "}
              {departmentStore.getDepartmentById(user.departmentId)?.name ?? user.departmentId}
            </p>
            {user.featureFlags?.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Flags: {user.featureFlags.join(", ")}
              </p>
            )}
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="rounded border px-2 py-1 text-xs font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: semanticStatus.error.bg,
              borderColor: semanticStatus.error.border,
              color: semanticStatus.error.text,
            }}
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete User"
        message={`Delete user "${user.name}" (${user.email || user.id})? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        busy={deleting}
      />
    </>
  );
}


