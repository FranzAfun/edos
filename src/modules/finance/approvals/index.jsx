import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useApprovalQueue from "../../common/approvals/hooks/useApprovalQueue";
import {
  getFoQueue,
  approveApproval,
  rejectApproval,
} from "../../common/approvals/services/approvalService";
import {
  APPROVAL_STAGE_LABELS,
  APPROVAL_STAGE_COLORS,
} from "../../../governance/approvalStages";
import * as userStore from "../../../shared/services/userStore";
import * as complianceStore from "../../../shared/services/complianceStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import useRole from "../../../hooks/useRole";

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

export default function FinanceApprovalsPage() {
  const { role } = useRole();
  const userId = resolveUserId(role);
  const query = useApprovalQueue(getFoQueue);

  return (
    <div>
      <PageSection
        title="FO Approval Queue"
        subtitle="Finance Officer review – first stage of the approval pipeline."
      >
        <ModuleBoundary
          query={query}
          title="FO Queue"
          emptyText="No approvals pending FO review."
        >
          <Grid cols={1}>
            {(query.data || []).map((item) => (
              <ApprovalCard
                key={item.id}
                item={item}
                userId={userId}
                onAction={() => query.reload()}
              />
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>
    </div>
  );
}

function ApprovalCard({ item, userId, onAction }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  // --- Enforcement resolution ---
  const requester = userStore.listUsers().find(
    (u) => u.id === item.requestedByUserId
  );
  const compliance = requester
    ? complianceStore.getCompliance(requester.id)
    : null;
  const budget = requester
    ? budgetStore.getBudgetByDepartment(requester.departmentId)
    : null;

  const isBlockedByCompliance =
    compliance?.isFundingBlocked === true ||
    compliance?.outstandingEvidenceCount > 0;
  const isDepartmentFrozen = budget?.frozen === true;
  const isApprovalBlocked = isBlockedByCompliance || isDepartmentFrozen;

  const handleApprove = useCallback(async () => {
    setBusy(true);
    await approveApproval({ id: item.id, userId, note });
    setBusy(false);
    setNote("");
    onAction();
  }, [item.id, userId, note, onAction]);

  const handleReject = useCallback(async () => {
    setBusy(true);
    await rejectApproval({ id: item.id, userId, note });
    setBusy(false);
    setNote("");
    onAction();
  }, [item.id, userId, note, onAction]);

  const stageColor =
    APPROVAL_STAGE_COLORS[item.currentStage] || "bg-gray-100 text-gray-800";

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${stageColor}`}
            >
              {APPROVAL_STAGE_LABELS[item.currentStage]}
            </span>
            <span className="text-xs text-gray-400 uppercase">
              {item.sourceType}
            </span>
          </div>
          <h3 className="text-sm font-semibold truncate">{item.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {item.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Amount: ₦{Number(item.amount).toLocaleString()} &middot; Requested{" "}
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
          <ComplianceBadge userId={item.requestedByUserId} />
        </div>
      </div>

      <div className="mt-3">
        {isApprovalBlocked && (
          <div className="text-xs text-red-600 mb-2">
            {isDepartmentFrozen && "Department budget is frozen. "}
            {compliance?.isFundingBlocked && "User is funding-blocked. "}
            {compliance?.outstandingEvidenceCount > 0 &&
              "User has outstanding evidence to submit."}
          </div>
        )}
        <div className="flex items-end gap-2">
        <input
          type="text"
          placeholder="Optional note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 rounded border px-2 py-1 text-xs"
        />
        <button
          onClick={handleApprove}
          disabled={busy || isApprovalBlocked}
          className={`rounded px-3 py-1 text-xs ${
            isApprovalBlocked
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          }`}
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={busy}
          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
        </div>
      </div>
    </Card>
  );
}

function ComplianceBadge({ userId }) {
  const compliance = complianceStore.getCompliance(userId);
  if (!compliance) return null;

  if (compliance.isFundingBlocked) {
    return (
      <span className="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
        Funding Blocked
      </span>
    );
  }

  if (compliance.outstandingEvidenceCount > 0) {
    return (
      <span className="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">
        Evidence Pending ({compliance.outstandingEvidenceCount})
      </span>
    );
  }

  return null;
}
