import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import useMyKpis from "./hooks/useMyKpis";
import useMyScores from "./hooks/useMyScores";
import useMyEvidence from "./hooks/useMyEvidence";
import { submitKpiEvidence } from "./services/kpiService";
import * as userStore from "../../../shared/services/userStore";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import useRole from "../../../hooks/useRole";
import StatusBadge from "../../../shared/ui/StatusBadge";

const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx,.png,.jpg,.jpeg";
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const IMPACT_MULTIPLIER = {
  Operational: 1,
  Important: 2,
  Strategic: 4,
};

function resolveExecUserId() {
  const execs = userStore.getUsersByRole("executive");
  return execs.length > 0 ? execs[0].id : null;
}

function parseDeadline(deadline) {
  if (!deadline) return null;
  const parsed = new Date(`${deadline}T23:59:59`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDeadlineUrgency(deadline) {
  const parsedDeadline = parseDeadline(deadline);
  if (!parsedDeadline) return null;

  const now = new Date();
  const diffDays = Math.ceil((parsedDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return {
      tone: "danger",
      text: `Overdue by ${days} day${days === 1 ? "" : "s"}`,
    };
  }

  if (diffDays === 0) {
    return {
      tone: "warning",
      text: "Due today",
    };
  }

  if (diffDays <= 3) {
    return {
      tone: "warning",
      text: `${diffDays} day${diffDays === 1 ? "" : "s"} left`,
    };
  }

  return null;
}

function mapKpiStatus(task, hasHistory) {
  const urgency = getDeadlineUrgency(task.deadline);

  if (urgency?.tone === "danger" && task.status !== "GRADED") {
    return { label: "Overdue", variant: "danger" };
  }

  if (task.status === "GRADED") {
    return { label: "Completed", variant: "success" };
  }

  if (task.status === "SUBMITTED") {
    return { label: "Submitted", variant: "purple" };
  }

  if (hasHistory) {
    return { label: "In Progress", variant: "warning" };
  }

  return { label: "Assigned", variant: "info" };
}

function formatDateLabel(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCompactDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isLikelyLinkType(value) {
  return String(value || "").toLowerCase() === "link";
}

function validateEvidenceFile(file) {
  if (!file) return "File is required.";

  const lowerName = String(file.name || "").toLowerCase();
  const isAllowed = [".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"].some((ext) =>
    lowerName.endsWith(ext)
  );

  if (!isAllowed) {
    return "Unsupported file type. Please upload PDF, DOCX, XLSX, PNG, or JPG.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File must be 10MB or smaller.";
  }

  return null;
}

function getImpactLabelFromCompleted(tasks) {
  if (!tasks || tasks.length === 0) return "Not Rated";

  const averageImpact =
    tasks.reduce((sum, task) => sum + (IMPACT_MULTIPLIER[task.impactCategory] ?? 1), 0) / tasks.length;

  if (averageImpact >= 3) return "Strategic";
  if (averageImpact >= 1.5) return "Important";
  return "Operational";
}

export default function ExecutiveKpiPage() {
  useDocumentTitle("Executive KPI");

  const navigate = useNavigate();
  const { role } = useRole();
  const userId = resolveExecUserId();

  const kpiQuery = useMyKpis(userId);
  const scoresQuery = useMyScores(userId);
  const evidenceQuery = useMyEvidence(userId);

  const allKpis = useMemo(() => kpiQuery.data || [], [kpiQuery.data]);
  const allScores = useMemo(() => scoresQuery.data || [], [scoresQuery.data]);
  const allEvidence = useMemo(() => evidenceQuery.data || [], [evidenceQuery.data]);

  const assignedKpis = useMemo(
    () => allKpis.filter((task) => task.status !== "GRADED"),
    [allKpis]
  );

  const completedKpis = useMemo(
    () => allKpis.filter((task) => task.status === "GRADED"),
    [allKpis]
  );

  const evidenceByTask = useMemo(
    () =>
      allEvidence.reduce((acc, entry) => {
        const existing = acc[entry.taskId] || [];
        existing.push(entry);
        acc[entry.taskId] = existing;
        return acc;
      }, {}),
    [allEvidence]
  );

  const performanceSummary = useMemo(() => {
    const earnedScore = allScores.reduce((sum, score) => sum + (Number(score.computedScore) || 0), 0);
    const maxPossibleScore = allKpis.reduce((sum, task) => {
      const weight = Number(task.weight) || 1;
      const impact = IMPACT_MULTIPLIER[task.impactCategory] ?? 1;
      return sum + 100 * weight * impact;
    }, 0);

    const contributionScore = maxPossibleScore > 0 ? `${Math.round((earnedScore / maxPossibleScore) * 100)}%` : "0%";

    return {
      completedRatio: `${completedKpis.length} / ${allKpis.length}`,
      averageImpactScore: getImpactLabelFromCompleted(completedKpis),
      contributionScore,
    };
  }, [allKpis, allScores, completedKpis]);

  if (!userId) {
    return (
      <PageSection title="My KPIs">
        <Card>
          <p className="text-sm text-gray-500">No executive user profile found.</p>
        </Card>
      </PageSection>
    );
  }

  if (kpiQuery.isLoading || scoresQuery.isLoading || evidenceQuery.isLoading) {
    return (
      <PageSection title="KPI Dashboard">
        <Card>
          <p className="text-sm text-gray-500">Loading KPI dashboard...</p>
        </Card>
      </PageSection>
    );
  }

  if (kpiQuery.isError || scoresQuery.isError || evidenceQuery.isError) {
    return (
      <PageSection title="KPI Dashboard">
        <Card>
          <p className="text-sm text-red-600">Unable to load KPI data.</p>
          <button
            type="button"
            onClick={() => {
              kpiQuery.reload();
              scoresQuery.reload();
              evidenceQuery.reload();
            }}
            className="mt-3 rounded border border-[var(--color-border)] px-3 py-1.5 text-sm"
          >
            Retry
          </button>
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
            className="btn-primary inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold shadow-sm"
          >
            Submit KPI Contribution
          </button>
        ) : null}
      </div>

      <PageSection title="Performance Summary">
        <Grid cols={3}>
          <MetricCard label="Completed KPIs" value={performanceSummary.completedRatio} />
          <MetricCard label="Average Impact Score" value={performanceSummary.averageImpactScore} />
          <MetricCard label="Contribution Score" value={performanceSummary.contributionScore} />
        </Grid>
      </PageSection>

      <PageSection title="Assigned KPIs">
        {assignedKpis.length > 0 ? (
          <Grid cols={1}>
            {assignedKpis.map((task) => (
              <KpiCard
                key={task.id}
                task={task}
                score={allScores.find((s) => s.taskId === task.id) ?? null}
                history={evidenceByTask[task.id] || []}
                onSubmitted={() => {
                  kpiQuery.reload();
                  scoresQuery.reload();
                  evidenceQuery.reload();
                }}
              />
            ))}
          </Grid>
        ) : (
          <Card>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">No KPIs assigned yet.</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              KPIs will appear here once leadership assigns work.
            </p>
          </Card>
        )}
      </PageSection>

      <PageSection title="Completed KPIs">
        {completedKpis.length > 0 ? (
          <Grid cols={1}>
            {completedKpis.map((task) => {
              const score = allScores.find((item) => item.taskId === task.id) ?? null;
              const history = evidenceByTask[task.id] || [];
              const statusBadge = mapKpiStatus(task, history.length > 0);
              const urgency = getDeadlineUrgency(task.deadline);

              return (
                <Card key={task.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{task.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description || "No assignment description provided."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Deadline: {formatDateLabel(task.deadline)}</span>
                        <span>Weight: {task.weight}</span>
                        <span>Impact: {task.impactCategory}</span>
                        <span>Status: {statusBadge.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge variant={statusBadge.variant}>{statusBadge.label}</StatusBadge>
                      {urgency ? (
                        <StatusBadge variant={urgency.tone === "danger" ? "danger" : "warning"}>
                          {urgency.text}
                        </StatusBadge>
                      ) : null}
                    </div>
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

                  <EvidenceHistory entries={history} />
                </Card>
              );
            })}
          </Grid>
        ) : (
          <Card>
            <p className="text-sm text-[var(--color-text-muted)]">No completed KPIs yet.</p>
          </Card>
        )}
      </PageSection>
    </div>
  );
}

function KpiCard({ task, score, history, onSubmitted }) {
  const [evidenceType, setEvidenceType] = useState(isLikelyLinkType(task.evidenceType) ? "Link" : "File");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasHistory = (history || []).length > 0;
  const statusBadge = mapKpiStatus(task, hasHistory);
  const urgency = getDeadlineUrgency(task.deadline);
  const isSubmittable = task.status !== "GRADED";

  function handleFileChange(file) {
    const validationError = validateEvidenceFile(file);

    if (validationError) {
      setSelectedFile(null);
      setFileError(validationError);
      return;
    }

    setFileError("");
    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isSubmittable) return;

    if (evidenceType === "Link" && !evidenceLink.trim()) return;

    if (evidenceType === "File" && !selectedFile) {
      setFileError("Please upload a valid file before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      await submitKpiEvidence({
        taskId: task.id,
        userId: task.assignedToUserId,
        type: evidenceType,
        linkOrText: evidenceType === "Link" ? evidenceLink.trim() : selectedFile?.name,
        evidenceLink: evidenceType === "Link" ? evidenceLink.trim() : null,
        fileName: evidenceType === "File" ? selectedFile?.name : null,
        fileSize: evidenceType === "File" ? selectedFile?.size : null,
        fileType: evidenceType === "File" ? selectedFile?.type : null,
        comments: comments.trim() || null,
      });

      setEvidenceLink("");
      setSelectedFile(null);
      setComments("");
      setFileError("");
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  }

  const submitDisabled =
    submitting ||
    !isSubmittable ||
    (evidenceType === "Link" ? !evidenceLink.trim() : !selectedFile);

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{task.title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {task.description || "No assignment description provided."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge variant={statusBadge.variant}>{statusBadge.label}</StatusBadge>
          {urgency ? (
            <StatusBadge variant={urgency.tone === "danger" ? "danger" : "warning"}>{urgency.text}</StatusBadge>
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span>Deadline: {formatDateLabel(task.deadline)}</span>
        <span>Weight: {task.weight}</span>
        <span>Impact: {task.impactCategory}</span>
        <span>Status: {statusBadge.label}</span>
      </div>

      {score ? (
        <div className="mb-4 rounded bg-purple-50 p-2 text-sm">
          Score: <strong>{score.gradeStatus}</strong> - Raw {score.rawScore}, Computed {score.computedScore}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="border-t border-[var(--color-border)] pt-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Evidence submission section</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Evidence Type</p>

          <div className="mt-2 flex gap-2">
            {["Link", "File"].map((type) => {
              const active = evidenceType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setEvidenceType(type);
                    setFileError("");
                  }}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

          {evidenceType === "Link" ? (
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Evidence Link</label>
              <input
                type="url"
                value={evidenceLink}
                onChange={(event) => setEvidenceLink(event.target.value)}
                placeholder="https://drive.google.com/report-q1"
                className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                disabled={!isSubmittable}
              />
            </div>
          ) : (
            <div className="mt-3">
              <p className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">Upload Evidence</p>
              <label
                className="block cursor-pointer rounded border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-muted)]"
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFileChange(event.dataTransfer.files?.[0]);
                }}
              >
                <input
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                  disabled={!isSubmittable}
                />
                <span className="font-medium text-[var(--color-text-primary)]">Drag and drop file</span>
                <span className="mx-1">or</span>
                <span className="font-medium text-[var(--color-primary)]">Browse file</span>
              </label>

              <p className="mt-2 text-xs text-[var(--color-text-muted)]">Accepted types: PDF, DOCX, XLSX, PNG, JPG</p>
              <p className="text-xs text-[var(--color-text-muted)]">Max size: 10MB</p>

              {selectedFile ? (
                <p className="mt-2 text-xs text-[var(--color-text-primary)]">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              ) : null}

              {fileError ? <p className="mt-2 text-xs text-red-600">{fileError}</p> : null}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">Comments (optional)</label>
          <textarea
            rows={3}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Add comments or challenges encountered while completing this KPI."
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            disabled={!isSubmittable}
          />
        </div>

        <button
          type="submit"
          disabled={submitDisabled}
          className="btn-primary mt-4 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Evidence"}
        </button>

        {!isSubmittable ? (
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Evidence submission is closed for completed KPIs.
          </p>
        ) : null}
      </form>

      <EvidenceHistory entries={history} />
    </Card>
  );
}

function EvidenceHistory({ entries }) {
  const sortedEntries = [...(entries || [])].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return (
    <details className="mt-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)]">
        Evidence History ({sortedEntries.length})
      </summary>

      {sortedEntries.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">No evidence submitted yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {sortedEntries.map((entry) => (
            <div key={entry.id} className="rounded border border-[var(--color-border)] p-3 text-xs">
              <p className="font-medium text-[var(--color-text-primary)]">Submitted {formatCompactDate(entry.submittedAt)}</p>
              <p className="mt-1 text-[var(--color-text-muted)]">Type: {entry.type}</p>

              {entry.type === "Link" ? (
                <p className="text-[var(--color-text-muted)]">Link: {entry.evidenceLink || entry.linkOrText || "-"}</p>
              ) : (
                <p className="text-[var(--color-text-muted)]">File: {entry.fileName || entry.linkOrText || "-"}</p>
              )}

              <p className="text-[var(--color-text-muted)]">Reviewer: {entry.reviewerStatus || "Pending"}</p>
              {entry.comments ? <p className="mt-1 text-[var(--color-text-muted)]">Comments: {entry.comments}</p> : null}
            </div>
          ))}
        </div>
      )}
    </details>
  );
}


