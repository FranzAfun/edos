import { useState, useEffect } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useAllKpis from "./hooks/useAllKpis";
import useAllEvidence from "./hooks/useAllEvidence";
import { createKpiTask, gradeEvidence } from "./services/kpiAdminService";
import { getExecutives } from "../../admin/users/services/userService";

const IMPACT_CATEGORIES = ["Operational", "Important", "Strategic"];
const EVIDENCE_TYPES = ["File", "Image", "Link", "Report", "Text"];
const GRADE_OPTIONS = ["COMPLETED", "PARTIAL", "REJECTED", "LATE"];

export default function AdminKpiPage() {
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
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 whitespace-nowrap">
                    {task.status}
                  </span>
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
          <select
            value={form.evidenceType}
            onChange={(e) => update("evidenceType", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Weight"
            min={1}
            max={10}
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          />
          <select
            value={form.impactCategory}
            onChange={(e) => update("impactCategory", e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            {IMPACT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
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
          </select>
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
          className="self-start rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
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

  async function handleGrade() {
    setGrading(true);
    await gradeEvidence({ evidenceId: evidence.id, gradeStatus: grade });
    setGrading(false);
    onGraded();
  }

  return (
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
          <p className="text-sm mt-1">{evidence.linkOrText}</p>
        </div>

        {task?.status !== "GRADED" && (
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded border px-2 py-1 text-xs"
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <button
              onClick={handleGrade}
              disabled={grading}
              className="rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {grading ? "…" : "Grade"}
            </button>
          </div>
        )}

        {task?.status === "GRADED" && (
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Graded</span>
        )}
      </div>
    </Card>
  );
}
