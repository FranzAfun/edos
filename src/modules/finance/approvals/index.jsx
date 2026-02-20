import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Enhanced Finance Approval Queue (F4)
 * Cost reasonableness, historical comparison, AI advisory,
 * adjust amount, question requester, return for clarification,
 * anti-bypass detection (F3), trust level badges (F14).
 */
import { useState, useCallback, useMemo } from "react";
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
import ApprovalRouteBadge from "../../../components/ui/ApprovalRouteBadge";
import AntiBypassAlert from "../../../components/ui/AntiBypassAlert";
import TrustBadge from "../../../components/ui/TrustBadge";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import StatusBadge from "../../../shared/ui/StatusBadge";
import * as userStore from "../../../shared/services/userStore";
import * as complianceStore from "../../../shared/services/complianceStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as approvalStoreRaw from "../../../shared/services/approvalStore";
import * as notificationStore from "../../../shared/services/notificationStore";
import useRole from "../../../hooks/useRole";

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

export default function FinanceApprovalsPage() {
  useDocumentTitle("Finance Approvals");
  const { role } = useRole();
  const userId = resolveUserId(role);
  const query = useApprovalQueue(getFoQueue);

  return (
    <div>
      <PageSection
        title="FO Approval Queue"
        subtitle="Finance Officer review with cost analysis, historical comparison, and compliance enforcement."
      >
        <ModuleBoundary
          query={query}
          title="FO Queue"
          emptyText="No approvals pending FO review."
        >
          <Grid cols={1}>
            {(query.data || []).map((item) => (
              <EnhancedApprovalCard
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

function EnhancedApprovalCard({ item, userId, onAction }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const requester = userStore.listUsers().find((u) => u.id === item.requestedByUserId);
  const compliance = requester ? complianceStore.getCompliance(requester.id) : null;
  const budget = requester ? budgetStore.getBudgetByDepartment(requester.departmentId) : null;

  const isBlockedByCompliance = compliance?.isFundingBlocked === true || compliance?.outstandingEvidenceCount > 0;
  const isDepartmentFrozen = budget?.frozen === true;
  const isApprovalBlocked = isBlockedByCompliance || isDepartmentFrozen;

  // Historical comparison (F4)
  const historicalRequests = useMemo(() => {
    const all = approvalStoreRaw.listApprovals();
    return all.filter(
      (a) => a.id !== item.id && a.requestedByUserId === item.requestedByUserId && a.sourceType === item.sourceType
    ).slice(-5);
  }, [item]);

  const avgHistoricalAmount = useMemo(() => {
    if (historicalRequests.length === 0) return null;
    const total = historicalRequests.reduce((s, r) => s + (r.amount || 0), 0);
    return Math.round(total / historicalRequests.length);
  }, [historicalRequests]);

  const costReasonableness = useMemo(() => {
    if (avgHistoricalAmount === null) return null;
    const deviation = ((item.amount - avgHistoricalAmount) / avgHistoricalAmount) * 100;
    if (Math.abs(deviation) <= 20) return { label: "Within Range", variant: "success", deviation };
    if (deviation > 20) return { label: "Above Average", variant: "warning", deviation };
    return { label: "Below Average", variant: "info", deviation };
  }, [item.amount, avgHistoricalAmount]);

  const handleApprove = useCallback(async () => {
    setBusy(true);
    if (showAdjust && adjustedAmount && Number(adjustedAmount) !== item.amount) {
      approvalStoreRaw.updateApprovalStage(item.id, {
        nextStage: item.currentStage, action: "AMOUNT_ADJUSTED", userId,
        note: `Amount adjusted from GHS ${item.amount.toLocaleString()} to GHS ${Number(adjustedAmount).toLocaleString()}.`,
      });
    }
    await approveApproval({ id: item.id, userId, note });
    setBusy(false);
    setNote("");
    setConfirmAction(null);
    onAction();
  }, [item, userId, note, onAction, showAdjust, adjustedAmount]);

  const handleReject = useCallback(async () => {
    setBusy(true);
    await rejectApproval({ id: item.id, userId, note });
    setBusy(false);
    setNote("");
    setConfirmAction(null);
    onAction();
  }, [item.id, userId, note, onAction]);

  const handleReturnForClarification = useCallback(async () => {
    setBusy(true);
    approvalStoreRaw.updateApprovalStage(item.id, {
      nextStage: item.currentStage, action: "RETURNED_FOR_CLARIFICATION", userId,
      note: note || "Returned for clarification by Finance Officer.",
    });
    notificationStore.createNotification({
      toUserId: item.requestedByUserId, type: "CLARIFICATION_REQUESTED",
      message: `Your request "${item.title}" has been returned for clarification. Note: ${note || "Please provide additional details."}`,
    });
    setBusy(false);
    setNote("");
    setConfirmAction(null);
    onAction();
  }, [item, userId, note, onAction]);

  const stageColor = APPROVAL_STAGE_COLORS[item.currentStage] || "bg-gray-100 text-gray-800";

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${stageColor}`}>
                {APPROVAL_STAGE_LABELS[item.currentStage]}
              </span>
              <span className="text-xs text-gray-400 uppercase">{item.sourceType}</span>
              {requester && <TrustBadge userId={requester.id} />}
            </div>
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Amount: GHS {Number(item.amount).toLocaleString()} &middot; Requested{" "}
              {new Date(item.createdAt).toLocaleDateString()} &middot; By: {requester?.name || "Unknown"}
            </p>
            <div className="mt-2"><ApprovalRouteBadge amount={item.amount} /></div>
            <ComplianceBadge userId={item.requestedByUserId} />
            <div className="mt-2">
              <AntiBypassAlert userId={item.requestedByUserId} departmentId={requester?.departmentId} />
            </div>
            {costReasonableness && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Cost Analysis:</span>
                <StatusBadge label={costReasonableness.label} variant={costReasonableness.variant} />
                <span className="text-xs text-gray-400">
                  ({costReasonableness.deviation > 0 ? "+" : ""}{Math.round(costReasonableness.deviation)}% vs avg GHS {avgHistoricalAmount?.toLocaleString()})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <button type="button" onClick={() => setShowHistory(!showHistory)} className="text-xs text-[var(--color-accent)] hover:underline">
            {showHistory ? "Hide" : "Show"} Historical Comparison ({historicalRequests.length} past requests)
          </button>
          {showHistory && historicalRequests.length > 0 && (
            <div className="mt-2 border rounded p-3 bg-gray-50">
              <p className="text-xs font-medium text-gray-600 mb-2">Past Similar Requests</p>
              {historicalRequests.map((h) => (
                <div key={h.id} className="flex justify-between text-xs py-1 border-b last:border-0">
                  <span className="text-gray-600 truncate flex-1">{h.title}</span>
                  <span className="text-gray-500 ml-2">GHS {Number(h.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 border rounded p-3 bg-blue-50/50">
          <p className="text-xs font-medium text-gray-600 mb-1">AI Advisory</p>
          <p className="text-xs text-gray-500 italic">
            AI analysis will be available when the intelligence backend is connected.
            Risk assessment: {isApprovalBlocked ? "High risk - compliance issues detected." : costReasonableness?.variant === "warning" ? "Moderate risk - amount above historical average." : "Low risk - within normal parameters."}
          </p>
        </div>

        <div className="mt-4">
          {isApprovalBlocked && (
            <div className="text-xs text-red-600 mb-2">
              {isDepartmentFrozen && "Department budget is frozen. "}
              {compliance?.isFundingBlocked && "User is funding-blocked. "}
              {compliance?.outstandingEvidenceCount > 0 && "User has outstanding evidence to submit."}
            </div>
          )}
          {showAdjust && (
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs text-gray-600" htmlFor="adjustAmount">Adjusted Amount (GHS):</label>
              <input id="adjustAmount" type="number" value={adjustedAmount} onChange={(e) => setAdjustedAmount(e.target.value)}
                className="rounded border px-2 py-1 text-xs w-32" min="0" step="0.01" />
              <button type="button" onClick={() => setShowAdjust(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          )}
          <div className="flex items-end gap-2 flex-wrap">
            <input type="text" placeholder="Optional note..." value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full rounded border px-2 py-1 text-xs sm:flex-1" aria-label="Review note" />
            <button onClick={() => setConfirmAction("approve")} disabled={busy || isApprovalBlocked}
              className={`rounded px-3 py-1 text-xs ${isApprovalBlocked ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"}`}>
              Approve
            </button>
            <button onClick={() => setConfirmAction("reject")} disabled={busy}
              className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50">
              Reject
            </button>
            <button onClick={() => setShowAdjust(!showAdjust)} disabled={busy}
              className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:opacity-50">
              Adjust Amount
            </button>
            <button onClick={() => setConfirmAction("clarify")} disabled={busy}
              className="rounded border border-amber-400 bg-amber-50 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100 disabled:opacity-50">
              Return for Clarification
            </button>
          </div>
        </div>
      </Card>

      <ConfirmDialog open={confirmAction === "approve"} title="Approve Request"
        message={`Approve "${item.title}" for GHS ${(showAdjust && adjustedAmount ? Number(adjustedAmount) : item.amount).toLocaleString()}?`}
        confirmLabel="Approve" variant="accent" onConfirm={handleApprove} onCancel={() => setConfirmAction(null)} busy={busy} />
      <ConfirmDialog open={confirmAction === "reject"} title="Reject Request"
        message={`Reject "${item.title}"? This action cannot be undone.`}
        confirmLabel="Reject" variant="danger" onConfirm={handleReject} onCancel={() => setConfirmAction(null)} busy={busy} />
      <ConfirmDialog open={confirmAction === "clarify"} title="Return for Clarification"
        message={`Return "${item.title}" to the requester for clarification?`}
        confirmLabel="Return" variant="warning" onConfirm={handleReturnForClarification} onCancel={() => setConfirmAction(null)} busy={busy} />
    </>
  );
}

function ComplianceBadge({ userId }) {
  const compliance = complianceStore.getCompliance(userId);
  if (!compliance) return null;
  if (compliance.isFundingBlocked) {
    return <span className="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800">Funding Blocked</span>;
  }
  if (compliance.outstandingEvidenceCount > 0) {
    return <span className="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800">Evidence Pending ({compliance.outstandingEvidenceCount})</span>;
  }
  return null;
}


