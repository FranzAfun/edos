import { useState } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import GovernanceStageBadge from "../../../governance/GovernanceStageBadge";
import useMyKpis from "./hooks/useMyKpis";
import useMyScores from "./hooks/useMyScores";
import { submitKpiEvidence } from "./services/kpiService";
import * as userStore from "../../../shared/services/userStore";

function resolveExecUserId() {
  const execs = userStore.getUsersByRole("executive");
  return execs.length > 0 ? execs[0].id : null;
}

const EVIDENCE_TYPES = ["File", "Image", "Link", "Report", "Text"];

function statusToStage(status) {
  switch (status) {
    case "ASSIGNED":
      return "WORK";
    case "SUBMITTED":
      return "EVIDENCE";
    case "GRADED":
      return "SCORING";
    default:
      return "WORK";
  }
}

export default function ExecutiveKpiPage() {
  const userId = resolveExecUserId();
  const kpiQuery = useMyKpis(userId);
  const scoresQuery = useMyScores(userId);

  if (!userId) {
    return (
      <PageSection title="My KPIs">
        <Card>
          <p className="text-sm text-gray-500">No executive user profile found.</p>
        </Card>
      </PageSection>
    );
  }

  return (
    <div>
      <PageSection title="My KPIs">
        <ModuleBoundary query={kpiQuery} title="KPI Tasks" emptyText="No KPIs assigned yet.">
          <Grid cols={1}>
            {(kpiQuery.data || []).map((task) => (
              <KpiCard
                key={task.id}
                task={task}
                score={
                  scoresQuery.data?.find((s) => s.taskId === task.id) ?? null
                }
                onSubmitted={() => {
                  kpiQuery.reload();
                  scoresQuery.reload();
                }}
              />
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>

      <PageSection title="My Scores">
        <ModuleBoundary query={scoresQuery} title="Scores" emptyText="No scores yet.">
          <Grid cols={3}>
            {(scoresQuery.data || []).map((score) => (
              <Card key={score.id}>
                <div className="text-xs text-gray-500 mb-1">Task {score.taskId.slice(0, 8)}…</div>
                <div className="text-sm font-medium">
                  Grade: <span className="font-semibold">{score.gradeStatus}</span>
                </div>
                <div className="text-sm">
                  Raw: {score.rawScore} &middot; Computed: {score.computedScore}
                </div>
              </Card>
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>
    </div>
  );
}

function KpiCard({ task, score, onSubmitted }) {
  const [evidenceType, setEvidenceType] = useState(task.evidenceType || "Text");
  const [linkOrText, setLinkOrText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!linkOrText.trim()) return;
    setSubmitting(true);
    await submitKpiEvidence({
      taskId: task.id,
      userId: task.assignedToUserId,
      type: evidenceType,
      linkOrText: linkOrText.trim(),
    });
    setLinkOrText("");
    setSubmitting(false);
    onSubmitted();
  }

  const isSubmittable = task.status === "ASSIGNED";

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
        </div>
        <GovernanceStageBadge stage={statusToStage(task.status)} />
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
        <span>Deadline: {task.deadline}</span>
        <span>Weight: {task.weight}</span>
        <span>Impact: {task.impactCategory}</span>
        <span>Status: {task.status}</span>
      </div>

      {score && (
        <div className="text-sm bg-purple-50 rounded p-2 mb-4">
          Score: <strong>{score.gradeStatus}</strong> — Raw {score.rawScore}, Computed{" "}
          {score.computedScore}
        </div>
      )}

      {isSubmittable && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t pt-3">
          <label className="text-xs font-medium text-gray-600">Submit Evidence</label>
          <div className="flex gap-2">
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="rounded border px-2 py-1 text-sm"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={linkOrText}
              onChange={(e) => setLinkOrText(e.target.value)}
              placeholder="Link or description…"
              className="flex-1 rounded border px-2 py-1 text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !linkOrText.trim()}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
