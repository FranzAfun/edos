import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Enhanced Finance Approval Queue (F4)
 * Cost reasonableness, historical comparison, AI advisory,
 * adjust amount, question requester, return for clarification,
 * anti-bypass detection (F3).
 */
import { useState, useCallback, useMemo } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useApprovalQueue from "../../common/approvals/hooks/useApprovalQueue";
import {
  getFoQueue,
  getReadyForDisbursementQueue,
  approveApproval,
  markApprovalAsDisbursed,
  rejectApproval,
} from "../../common/approvals/services/approvalService";
import { semanticStatus } from "@/theme/semanticColors";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import StatusBadge from "../../../shared/ui/StatusBadge";
import * as userStore from "../../../shared/services/userStore";
import * as complianceStore from "../../../shared/services/complianceStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as approvalStoreRaw from "../../../shared/services/approvalStore";
import * as notificationStore from "../../../shared/services/notificationStore";
import { detectAntiBypass } from "../../../shared/services/fundRequestStore";
import useRole from "../../../hooks/useRole";
import { formatApprovalSourceType } from "../../../utils/approvalLabels";

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

export default function FinanceApprovalsPage() {
  useDocumentTitle("Finance Approvals");
  const { role } = useRole();
  const userId = resolveUserId(role);
  const query = useApprovalQueue(getFoQueue);
  const disbursementQuery = useApprovalQueue(getReadyForDisbursementQueue);

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

      <PageSection
        title="Ready For Disbursement"
        subtitle="Approved requests awaiting finance fund release."
      >
        <ModuleBoundary
          query={disbursementQuery}
          title="Disbursement Queue"
          emptyText="No requests ready for disbursement."
        >
          <Grid cols={1}>
            {(disbursementQuery.data || []).map((item) => (
              <DisbursementCard
                key={item.id}
                item={item}
                userId={userId}
                onAction={() => disbursementQuery.reload()}
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
  const hasOutstandingReceipts = requester
    ? complianceStore.hasOutstandingReceipts(requester.id)
    : false;
  const outstandingReceiptCount = requester
    ? complianceStore.getOutstandingReceiptCount(requester.id)
    : 0;
  const antiBypass = detectAntiBypass(item.requestedByUserId, requester?.departmentId);

  const isBlockedByCompliance = compliance?.isFundingBlocked === true || compliance?.outstandingEvidenceCount > 0;
  const isBlockedByReceipts = hasOutstandingReceipts;
  const isDepartmentFrozen = budget?.frozen === true;
  const hasAntiBypassWarning = antiBypass.flagged;
  const isApprovalBlocked = isBlockedByCompliance || isBlockedByReceipts || isDepartmentFrozen;

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

  const noticeMessages = [];

  if (isDepartmentFrozen) {
    noticeMessages.push("Department budget is frozen.");
  }

  if (compliance?.isFundingBlocked) {
    noticeMessages.push("Funding is blocked for this requester.");
  }

  if (compliance?.outstandingEvidenceCount > 0) {
    noticeMessages.push(`Outstanding evidence: ${compliance.outstandingEvidenceCount}.`);
  }

  if (hasOutstandingReceipts) {
    noticeMessages.push(
      `Outstanding receipts must be uploaded before this request can move forward${outstandingReceiptCount > 0 ? ` (${outstandingReceiptCount})` : ""}.`
    );
  }

  if (hasAntiBypassWarning) {
    noticeMessages.push(
      `Potential split-purchase bypass detected: ${antiBypass.count} requests totaling GHS ${antiBypass.total.toLocaleString()} in the last 7 days.`
    );
  }

  if (costReasonableness) {
    noticeMessages.push(
      `Cost analysis: ${costReasonableness.label} (${costReasonableness.deviation > 0 ? "+" : ""}${Math.round(costReasonableness.deviation)}% vs avg GHS ${avgHistoricalAmount?.toLocaleString()}).`
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 uppercase">{formatApprovalSourceType(item.sourceType)}</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Amount: GHS {Number(item.amount).toLocaleString()} &middot; Requested{" "}
              {new Date(item.createdAt).toLocaleDateString()} &middot; By: {requester?.name || "Unknown"}
            </p>
            {noticeMessages.length > 0 ? (
              <InlineNotice className="mt-3">{noticeMessages.join(" ")}</InlineNotice>
            ) : null}
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

        <div className="mt-3 rounded border border-[var(--color-border)] p-3">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">AI Advisory</p>
          <p className="text-xs text-[var(--color-text-secondary)] italic">
            AI analysis will be available when the intelligence backend is connected.
            Risk assessment: {isApprovalBlocked ? "High risk - compliance issues detected." : costReasonableness?.variant === "warning" ? "Moderate risk - amount above historical average." : "Low risk - within normal parameters."}
          </p>
        </div>

        <div className="mt-4">
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
              className="rounded border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted,rgba(255,255,255,0.04))] disabled:opacity-50">
              Adjust Amount
            </button>
            <button onClick={() => setConfirmAction("clarify")} disabled={busy}
              className="rounded border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted,rgba(255,255,255,0.04))] disabled:opacity-50">
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

function DisbursementCard({ item, userId, onAction }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const requester = userStore.listUsers().find((user) => user.id === item.requestedByUserId);

  const handleDisburse = useCallback(async () => {
    setBusy(true);
    await markApprovalAsDisbursed({ id: item.id, userId, note });
    setBusy(false);
    setConfirmOpen(false);
    setNote("");
    onAction();
  }, [item.id, note, onAction, userId]);

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 uppercase">{formatApprovalSourceType(item.sourceType)}</span>
              <StatusBadge variant="warning">Ready for Disbursement</StatusBadge>
            </div>
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Request #{item.sourceId || item.id} &middot; Amount: GHS {Number(item.amount).toLocaleString()} &middot; By: {requester?.name || "Unknown"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Optional disbursement note..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded border px-2 py-1 text-xs sm:flex-1"
            aria-label="Disbursement note"
          />
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
          >
            Mark as Disbursed
          </button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Mark as Disbursed"
        message={`Confirm funds disbursement for "${item.title}"?`}
        confirmLabel="Mark as Disbursed"
        variant="accent"
        onConfirm={handleDisburse}
        onCancel={() => setConfirmOpen(false)}
        busy={busy}
      />
    </>
  );
}

function InlineNotice({ children, className = "" }) {
  return (
    <div
      className={`border-l-4 pl-3 text-xs text-[var(--color-text-secondary)] ${className}`}
      style={{ borderLeftColor: semanticStatus.warning.text }}
    >
      {children}
    </div>
  );
}


