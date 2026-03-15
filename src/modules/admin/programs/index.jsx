import { useMemo, useState } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import FormField from "../../../shared/ui/FormField";
import DataTable from "../../../shared/ui/DataTable";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import SelectField from "../../../shared/ui/SelectField";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import {
  getPrograms,
  createProgram,
  updateProgram,
  archiveProgram,
} from "../../../shared/services/programStore";
import { getSupervisorLabel, SUPERVISOR_OPTIONS } from "../../../utils/supervisor";

const STATUS_LABELS = {
  active: "Active",
  archived: "Archived",
};

export default function AdminProgramsPage() {
  useDocumentTitle("Program Registry");
  const [programs, setPrograms] = useState(() => getPrograms());
  const [name, setName] = useState("");
  const [supervisor, setSupervisor] = useState("cto");
  const [editingId, setEditingId] = useState("");
  const [archivingId, setArchivingId] = useState("");

  const editingProgram = useMemo(
    () => programs.find((program) => program.id === editingId) || null,
    [programs, editingId]
  );

  function reloadPrograms() {
    setPrograms(getPrograms());
  }

  function resetForm() {
    setName("");
    setSupervisor("cto");
    setEditingId("");
  }

  function handleEdit(program) {
    setEditingId(program.id);
    setName(program.name);
    setSupervisor(program.supervisor);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateProgram(editingId, {
        name,
        supervisor,
      });
    } else {
      createProgram({
        name,
        supervisor,
        createdBy: "admin",
        status: "active",
      });
    }

    resetForm();
    reloadPrograms();
  }

  function handleArchive() {
    if (!archivingId) return;
    archiveProgram(archivingId);
    setArchivingId("");
    if (editingId === archivingId) {
      resetForm();
    }
    reloadPrograms();
  }

  return (
    <div>
      <PageSection
        title="Program Registry"
        subtitle="Manage approved programs and supervisor ownership"
      >
        <Card>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
            <FormField
              label="Program Name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="e.g. Digital Literacy Training"
            />
            <FormField label="Supervisor" name="supervisor" required>
              <SelectField
                id="field-supervisor"
                name="supervisor"
                value={supervisor}
                onChange={(event) => setSupervisor(event.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                {SUPERVISOR_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </FormField>
            <div className="mb-4 flex gap-2">
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-primary rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {editingId ? "Save Program" : "Create Program"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Card>
      </PageSection>

      <PageSection title="Programs" subtitle="Active and archived program entities">
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            {
              key: "supervisor",
              label: "Supervisor",
              render: (value) => getSupervisorLabel(value),
            },
            {
              key: "status",
              label: "Status",
              render: (value) => STATUS_LABELS[value] || value,
            },
            {
              key: "createdAt",
              label: "Created Date",
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              key: "actions",
              label: "Actions",
              sortable: false,
              render: (_, row) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded border border-[var(--color-border)] px-2 py-1 text-xs"
                  >
                    Edit
                  </button>
                  {row.status !== "archived" && (
                    <button
                      type="button"
                      onClick={() => setArchivingId(row.id)}
                      className="rounded border border-[var(--color-border)] px-2 py-1 text-xs"
                    >
                      Archive
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          data={programs}
          pageSize={10}
          emptyText="No programs found."
        />
      </PageSection>

      <ConfirmDialog
        open={!!archivingId}
        title="Archive Program"
        message={`Archive "${editingProgram?.name || programs.find((program) => program.id === archivingId)?.name || "this program"}"?`}
        confirmLabel="Archive"
        variant="warning"
        onConfirm={handleArchive}
        onCancel={() => setArchivingId("")}
      />
    </div>
  );
}
