import { useState, useEffect } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import StatusBadge from "../../../shared/ui/StatusBadge";
import useAllKpis from "./hooks/useAllKpis";
import useAllEvidence from "./hooks/useAllEvidence";
import { createKpiTask, gradeEvidence } from "./services/kpiAdminService";
import { getExecutives } from "../../admin/users/services/userService";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import SelectField from "../../../shared/ui/SelectField";

const IMPACT_CATEGORIES = ["Operational", "Important", "Strategic"];
const EVIDENCE_TYPES = ["File", "Image", "Link", "Report", "Text"];
const GRADE_OPTIONS = ["COMPLETED", "PARTIAL", "REJECTED", "LATE"];
const TASK_STATUS_VARIANT = {
  ASSIGNED: "info",
  SUBMITTED: "warning",
  GRADED: "success",
};

export default function AdminKpiPage() {
  useDocumentTitle("Admin KPI Management");
  const kpiQuery = useAllKpis();
  const evidenceQuery = useAllEvidence();

  return (
    <div>
      <PageSection title="Assign KPI">
        <CreateKpiForm
          onCreated={() => {
            kpiQuery.reload();
          }}
        />
      </PageSection>

      <PageSection title="All KPI Tasks">
        <ModuleBoundary query={kpiQuery} title="Tasks" emptyText="No KPI tasks yet.">
          <Grid cols={1}>
            {(kpiQuery.data || []).map((task) => (
              <Card key={task.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  </div>
                  <StatusBadge
                    variant={TASK_STATUS_VARIANT[task.status] || "info"}
                    className="whitespace-nowrap"
                  >
                    {task.status}
                  </StatusBadge>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                  <span>Assigned: {task.assignedToUserId}</span>
                  <span>Deadline: {task.deadline}</span>
                  <span>Weight: {task.weight}</span>
                  <span>Impact: {task.impactCategory}</span>
                  <span>Evidence Type: {task.evidenceType}</span>
                </div>
              </Card>
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>

      <PageSection title="Evidence & Grading">
        <ModuleBoundary
          query={evidenceQuery}
          title="Evidence"
          emptyText="No evidence submitted yet."
        >
          <Grid cols={1}>
            {(evidenceQuery.data || []).map((ev) => (
              <EvidenceRow
                key={ev.id}
                evidence={ev}
                task={(kpiQuery.data || []).find((t) => t.id === ev.taskId)}
                onGraded={() => {
                  evidenceQuery.reload();
                  kpiQuery.reload();
                }}
              />
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create KPI form
// ---------------------------------------------------------------------------

function CreateKpiForm({ onCreated }) {
  const [executives, setExecutives] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    evidenceType: "Report",
    weight: 1,
    impactCategory: "Operational",
    assignedToUserId: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getExecutives().then((res) => {
      if (res.success && res.data?.length > 0) {
        setExecutives(res.data);
        setForm((prev) => prev.assignedToUserId ? prev : { ...prev, assignedToUserId: res.data[0].id });
      }
    });
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await createKpiTask({
      ...form,
      weight: Number(form.weight) || 1,
    });
    setForm({
      title: "",
      description: "",
      deadline: "",
      evidenceType: "Report",
      weight: 1,
      impactCategory: "Operational",
      assignedToUserId: executives.length > 0 ? executives[0].id : "",
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
            placeholder="Title"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
            required
          />
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => update("deadline", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <SelectField
            value={form.evidenceType}
            onChange={(e) => update("evidenceType", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>
          <input
            type="number"
            placeholder="Weight"
            min={1}
            max={10}
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <SelectField
            value={form.impactCategory}
            onChange={(e) => update("impactCategory", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            {IMPACT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <SelectField
            value={form.assignedToUserId}
            onChange={(e) => update("assignedToUserId", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            {executives.length === 0 && (
              <option value="">No executives found</option>
            )}
            {executives.map((exec) => (
              <option key={exec.id} value={exec.id}>
                {exec.name} ({exec.id})
              </option>
            ))}
          </SelectField>
        </div>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={2}
          className="rounded border px-2 py-1 text-sm"
        />
        <button
          type="submit"
          disabled={saving || !form.title.trim()}
          className="btn-primary self-start rounded px-4 py-1.5 text-sm disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create KPI"}
        </button>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Evidence row with grading
// ---------------------------------------------------------------------------

function EvidenceRow({ evidence, task, onGraded }) {
  const [grade, setGrade] = useState("COMPLETED");
  const [grading, setGrading] = useState(false);
  const [confirmGrade, setConfirmGrade] = useState(false);

  async function handleGrade() {
    setGrading(true);
    try {
      await gradeEvidence({ evidenceId: evidence.id, gradeStatus: grade });
      setConfirmGrade(false);
      onGraded();
    } finally {
      setGrading(false);
    }
  }

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold">
              {task?.title ?? "Unknown Task"}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              User: {evidence.userId} &middot; Type: {evidence.type} &middot; Submitted:{" "}
              {new Date(evidence.submittedAt).toLocaleDateString()}
            </p>
            <p className="text-sm mt-1">
              {evidence.type === "Link"
                ? evidence.evidenceLink || evidence.linkOrText || "-"
                : evidence.fileName || evidence.linkOrText || "-"}
            </p>
            {evidence.comments ? (
              <p className="mt-1 text-xs text-gray-500">Comments: {evidence.comments}</p>
            ) : null}
          </div>

          {task?.status !== "GRADED" && (
            <div className="flex items-center gap-2 shrink-0">
              <SelectField
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="rounded border px-2 py-1 text-xs"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectField>
              <button
                onClick={() => setConfirmGrade(true)}
                disabled={grading}
                className="rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {grading ? "…" : "Grade"}
              </button>
            </div>
          )}

          {task?.status === "GRADED" && (
            <StatusBadge variant="success">Graded</StatusBadge>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmGrade}
        title="Confirm Evidence Grade"
        message={`Grade evidence for "${task?.title ?? "Unknown Task"}" as ${grade}?`}
        confirmLabel="Confirm Grade"
        variant={grade === "REJECTED" ? "danger" : "warning"}
        onConfirm={handleGrade}
        onCancel={() => setConfirmGrade(false)}
        busy={grading}
      />
    </>
  );
}


