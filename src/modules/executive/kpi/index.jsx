import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import GovernanceStageBadge from "../../../governance/GovernanceStageBadge";
import useMyKpis from "./hooks/useMyKpis";
import useMyScores from "./hooks/useMyScores";
import { submitKpiEvidence } from "./services/kpiService";
import * as userStore from "../../../shared/services/userStore";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import useRole from "../../../hooks/useRole";

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
  useDocumentTitle("Executive KPI");
  const navigate = useNavigate();
  const { role } = useRole();
  const userId = resolveExecUserId();
  const kpiQuery = useMyKpis(userId);
  const scoresQuery = useMyScores(userId);
  const assignedKpis = useMemo(
    () => (kpiQuery.data || []).filter((task) => task.status !== "GRADED"),
    [kpiQuery.data]
  );
  const completedKpis = useMemo(
    () => (kpiQuery.data || []).filter((task) => task.status === "GRADED"),
    [kpiQuery.data]
  );
  const performanceSummary = useMemo(() => {
    const scores = scoresQuery.data || [];
    const totalComputed = scores.reduce((sum, score) => sum + (Number(score.computedScore) || 0), 0);
    const averageComputed = scores.length > 0 ? (totalComputed / scores.length).toFixed(1) : "0.0";

    return {
      assignedCount: assignedKpis.length,
      completedCount: completedKpis.length,
      averageComputed,
    };
  }, [assignedKpis.length, completedKpis.length, scoresQuery.data]);

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
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] font-[var(--font-heading)]">
            KPI Dashboard
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
            Track assigned work, completed KPIs, and your performance summary.
          </p>
        </div>
        {role === "executive" ? (
          <button
            type="button"
            onClick={() => navigate("/executive/kpi/contribution")}
            className="inline-flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-hover,#f8fafc)]"
          >
            Submit Contribution
          </button>
        ) : null}
      </div>

      <PageSection title="Assigned KPIs">
        <ModuleBoundary query={kpiQuery} title="Assigned KPI Tasks" emptyText="No KPIs assigned yet.">
          <Grid cols={1}>
            {assignedKpis.map((task) => (
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

      <PageSection title="Completed KPIs">
        <ModuleBoundary query={kpiQuery} title="Completed KPI Tasks" emptyText="No completed KPIs yet.">
          <Grid cols={1}>
            {completedKpis.map((task) => {
              const score = scoresQuery.data?.find((item) => item.taskId === task.id) ?? null;

              return (
                <Card key={task.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Deadline: {task.deadline || "—"}</span>
                        <span>Weight: {task.weight}</span>
                        <span>Impact: {task.impactCategory}</span>
                      </div>
                    </div>
                    <GovernanceStageBadge stage={statusToStage(task.status)} />
                  </div>
                  {score ? (
                    <div className="mt-3 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
                      Grade: <span className="font-semibold">{score.gradeStatus}</span>
                      <span className="mx-2 text-[var(--color-text-muted)]">•</span>
                      Raw: {score.rawScore}
                      <span className="mx-2 text-[var(--color-text-muted)]">•</span>
                      Computed: {score.computedScore}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </Grid>
        </ModuleBoundary>
      </PageSection>

      <PageSection title="Performance Summary">
        <ModuleBoundary query={scoresQuery} title="Performance Summary" emptyText="No performance data yet.">
          <Grid cols={3}>
            <MetricCard label="Assigned KPIs" value={performanceSummary.assignedCount} />
            <MetricCard label="Completed KPIs" value={performanceSummary.completedCount} />
            <MetricCard label="Average Score" value={performanceSummary.averageComputed} />
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


