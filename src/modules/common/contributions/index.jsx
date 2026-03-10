import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Special KPI Contributions (F15)
 * Submit and review special contributions for bonus KPI scores.
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import DataTable from "../../../shared/ui/DataTable";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as specialContributionStore from "../../../shared/services/specialContributionStore";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";
import { isOperationalRole } from "../../../config/roles";

const STATUS_VARIANT = {
  PENDING: "warning",
  REVIEWED: "info",
  APPROVED: "success",
  REJECTED: "danger",
};

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

export default function SpecialContributionsPage() {
  useDocumentTitle("Special Contributions");
  const { role } = useRole();
  const currentUser = resolveUser(role);
  const [contributions, setContributions] = useState(
    () => specialContributionStore.listContributions()
  );
  const reload = useCallback(() => {
    setContributions(specialContributionStore.listContributions());
  }, []);

  const pendingCount = contributions.filter((c) => c.status === "PENDING").length;
  const approvedCount = contributions.filter((c) => c.status === "APPROVED").length;
  const totalBonus = contributions
    .filter((c) => c.status === "APPROVED")
    .reduce((s, c) => s + (c.bonusScore || 0), 0);

  const canReview = role === "ceo" || role === "admin";
  const canSubmit = role === "executive" || isOperationalRole(role);

  return (
    <div>
      <PageSection title="Special Contributions" subtitle="Extra KPI contributions for bonus performance scoring">
        <Grid cols={4}>
          <MetricCard label="Total Submissions" value={contributions.length} />
          <MetricCard label="Pending Review" value={pendingCount} />
          <MetricCard label="Approved" value={approvedCount} />
          <MetricCard label="Total Bonus Score" value={totalBonus} />
        </Grid>
      </PageSection>

      {canSubmit && (
        <PageSection title="Submit Contribution" subtitle="Submit evidence of special contribution">
          <SubmitContributionForm userId={currentUser?.id} onSubmitted={reload} />
        </PageSection>
      )}

      {canReview && (
        <PageSection title="Pending Reviews" subtitle="Review and score special contributions">
          <Grid cols={1}>
            {contributions
              .filter((c) => c.status === "PENDING")
              .map((c) => (
                <ReviewContributionCard
                  key={c.id}
                  contribution={c}
                  reviewerId={currentUser?.id}
                  onReviewed={reload}
                />
              ))}
            {contributions.filter((c) => c.status === "PENDING").length === 0 && (
              <Card><p className="text-sm text-gray-500">No contributions pending review.</p></Card>
            )}
          </Grid>
        </PageSection>
      )}

      <PageSection title="All Contributions">
        <DataTable
          columns={[
            {
              key: "userId",
              label: "Contributor",
              render: (v) => {
                const u = userStore.getUserById(v);
                return u?.name || v;
              },
            },
            { key: "description", label: "Description" },
            { key: "evidencePath", label: "Evidence" },
            {
              key: "status",
              label: "Status",
              render: (v) => (
                <StatusBadge variant={STATUS_VARIANT[v] || "neutral"}>
                  {v}
                </StatusBadge>
              ),
            },
            { key: "bonusScore", label: "Bonus Score" },
            {
              key: "createdAt",
              label: "Submitted",
              render: (v) => new Date(v).toLocaleDateString(),
            },
          ]}
          data={contributions}
          pageSize={10}
          emptyText="No contributions found."
        />
      </PageSection>
    </div>
  );
}

function SubmitContributionForm({ userId, onSubmitted }) {
  const rules = {
    description: (v) => (!v ? "Description is required" : null),
    evidencePath: (v) => (!v ? "Evidence reference is required" : null),
  };

  const { values, errors, touched, handleChange, validate, reset } =
    useFormValidation({ description: "", evidencePath: "" }, rules);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      specialContributionStore.createContribution({
        userId,
        description: values.description,
        evidencePath: values.evidencePath,
      });
      reset();
      onSubmitted();
    },
    [validate, values, userId, reset, onSubmitted]
  );

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Contribution Description"
          name="description"
          type="textarea"
          required
          value={values.description}
          onChange={handleChange}
          error={touched.description ? errors.description : null}
          placeholder="Describe your special contribution…"
        />
        <FormField
          label="Evidence Reference"
          name="evidencePath"
          required
          value={values.evidencePath}
          onChange={handleChange}
          error={touched.evidencePath ? errors.evidencePath : null}
          placeholder="e.g. link, document reference, file name"
        />
        <button
          type="submit"
          className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Submit Contribution
        </button>
      </form>
    </Card>
  );
}

function ReviewContributionCard({ contribution, reviewerId, onReviewed }) {
  const [confirm, setConfirm] = useState(null);
  const [bonusScore, setBonusScore] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);
  const contributor = userStore.getUserById(contribution.userId);

  const handleReview = useCallback(
    (status) => {
      setBusy(true);
      specialContributionStore.reviewContribution(contribution.id, {
        bonusScore: Number(bonusScore) || 0,
        reviewedByUserId: reviewerId,
        reviewNote,
        status,
      });
      setBusy(false);
      setConfirm(null);
      setBonusScore("");
      setReviewNote("");
      onReviewed();
    },
    [contribution.id, bonusScore, reviewNote, reviewerId, onReviewed]
  );

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">
              {contributor?.name || "Unknown"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {contribution.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Evidence: {contribution.evidencePath} &middot;{" "}
              {new Date(contribution.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Grid cols={2}>
            <FormField
              label="Bonus Score"
              name="bonusScore"
              type="number"
              value={bonusScore}
              onChange={(e) => setBonusScore(e.target.value)}
              placeholder="0-100"
            />
            <FormField
              label="Review Note"
              name="reviewNote"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
            />
          </Grid>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm("APPROVED")}
              disabled={busy}
              className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => setConfirm("REJECTED")}
              disabled={busy}
              className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      </Card>
      <ConfirmDialog
        open={!!confirm}
        title={confirm === "APPROVED" ? "Approve Contribution" : "Reject Contribution"}
        message={`${confirm === "APPROVED" ? "Approve" : "Reject"} this contribution${bonusScore ? ` with bonus score of ${bonusScore}` : ""}?`}
        confirmLabel={confirm === "APPROVED" ? "Approve" : "Reject"}
        variant={confirm === "APPROVED" ? "accent" : "danger"}
        onConfirm={() => handleReview(confirm)}
        onCancel={() => setConfirm(null)}
        busy={busy}
      />
    </>
  );
}


