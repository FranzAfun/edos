import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Enhanced CEO Approval Queue (F5)
 * - Modify amount option
 * - Return for clarification
 * - Compact justification notice for requests >3,000
 * - Minimal review controls
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useApprovalQueue from "../../common/approvals/hooks/useApprovalQueue";
import {
  getCeoQueue,
  approveApproval,
  rejectApproval,
} from "../../common/approvals/services/approvalService";
import { semanticStatus } from "@/theme/semanticColors";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import * as userStore from "../../../shared/services/userStore";
import * as complianceStore from "../../../shared/services/complianceStore";
import * as approvalStoreRaw from "../../../shared/services/approvalStore";
import * as notificationStore from "../../../shared/services/notificationStore";
import { detectAntiBypass } from "../../../shared/services/fundRequestStore";
import useRole from "../../../hooks/useRole";
import { formatApprovalSourceType } from "../../../utils/approvalLabels";

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

export default function CeoApprovalsPage() {
  useDocumentTitle("CEO Approvals");
  const { role } = useRole();
  const userId = resolveUserId(role);
  const query = useApprovalQueue(getCeoQueue);

  return (
    <div>
      <PageSection
        title="CEO Approval Queue"
        subtitle="Final approval authority with justification review for high-value requests."
      >
        <ModuleBoundary query={query} title="CEO Queue" emptyText="No approvals pending CEO approval.">
          <Grid cols={1}>
            {(query.data || []).map((item) => (
              <CeoApprovalCard key={item.id} item={item} userId={userId} onAction={() => query.reload()} />
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>
    </div>
  );
}

function CeoApprovalCard({ item, userId, onAction }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [adjustedAmount, setAdjustedAmount] = useState("");
  const [showAdjust, setShowAdjust] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const requester = userStore.listUsers().find((u) => u.id === item.requestedByUserId);
  const requiresJustification = item.amount > 3000;
  const compliance = requester ? complianceStore.getCompliance(requester.id) : null;
  const antiBypass = detectAntiBypass(item.requestedByUserId, requester?.departmentId);

  const noticeMessages = [];

  if (requiresJustification) {
    noticeMessages.push("Justification required for requests exceeding GHS 3,000.");
  }

  if (compliance?.isFundingBlocked) {
    noticeMessages.push("Funding is blocked for this requester.");
  }

  if (compliance?.outstandingEvidenceCount > 0) {
    noticeMessages.push(`Outstanding evidence: ${compliance.outstandingEvidenceCount}.`);
  }

  if (antiBypass.flagged) {
    noticeMessages.push(
      `Potential split-purchase bypass detected: ${antiBypass.count} requests totaling GHS ${antiBypass.total.toLocaleString()} in the last 7 days.`
    );
  }

  const handleApprove = useCallback(async () => {
    setBusy(true);
    if (showAdjust && adjustedAmount && Number(adjustedAmount) !== item.amount) {
      approvalStoreRaw.updateApprovalStage(item.id, {
        nextStage: item.currentStage, action: "AMOUNT_ADJUSTED", userId,
        note: `CEO adjusted amount from GHS ${item.amount.toLocaleString()} to GHS ${Number(adjustedAmount).toLocaleString()}.`,
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
      note: note || "Returned for clarification by CEO.",
    });
    notificationStore.createNotification({
      toUserId: item.requestedByUserId, type: "CLARIFICATION_REQUESTED",
      message: `CEO has returned "${item.title}" for clarification. Note: ${note || "Please provide additional justification."}`,
    });
    setBusy(false);
    setNote("");
    setConfirmAction(null);
    onAction();
  }, [item, userId, note, onAction]);

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <span className="text-xs text-gray-400 uppercase">{formatApprovalSourceType(item.sourceType)}</span>
            </div>
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Amount: GHS {Number(item.amount).toLocaleString()} &middot; Requested{" "}
              {new Date(item.createdAt).toLocaleDateString()} &middot; By: {requester?.name || "Unknown"}
            </p>
            {noticeMessages.length > 0 ? <InlineNotice className="mt-3">{noticeMessages.join(" ")}</InlineNotice> : null}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          {showAdjust && (
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs text-gray-600" htmlFor="ceoAdjustAmount">Modified Amount (GHS):</label>
              <input id="ceoAdjustAmount" type="number" value={adjustedAmount} onChange={(e) => setAdjustedAmount(e.target.value)}
                className="rounded border px-2 py-1 text-xs w-32" min="0" step="0.01" />
              <button type="button" onClick={() => setShowAdjust(false)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          )}
          <div className="flex items-end gap-2 flex-wrap">
            <input type="text" placeholder={requiresJustification ? "Justification note required..." : "Optional note..."}
              value={note} onChange={(e) => setNote(e.target.value)}
              className="w-full rounded border px-2 py-1 text-xs sm:flex-1" aria-label="CEO review note" />
            <button onClick={() => setConfirmAction("approve")}
              disabled={busy || (requiresJustification && !note.trim())}
              className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50">
              Approve
            </button>
            <button onClick={() => setConfirmAction("reject")} disabled={busy}
              className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50">
              Reject
            </button>
            <button onClick={() => setShowAdjust(!showAdjust)} disabled={busy}
              className="rounded border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted,rgba(255,255,255,0.04))] disabled:opacity-50">
              Modify Amount
            </button>
            <button onClick={() => setConfirmAction("clarify")} disabled={busy}
              className="rounded border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted,rgba(255,255,255,0.04))] disabled:opacity-50">
              Return for Clarification
            </button>
          </div>
          {requiresJustification && !note.trim() && (
            <p className="text-xs mt-1 text-[var(--color-text-secondary)]">A justification note is required for requests exceeding GHS 3,000.</p>
          )}
        </div>
      </Card>

      <ConfirmDialog open={confirmAction === "approve"} title="CEO Approval"
        message={`Approve "${item.title}" for GHS ${(showAdjust && adjustedAmount ? Number(adjustedAmount) : item.amount).toLocaleString()}?`}
        confirmLabel="Approve" variant="accent" onConfirm={handleApprove} onCancel={() => setConfirmAction(null)} busy={busy} />
      <ConfirmDialog open={confirmAction === "reject"} title="CEO Rejection"
        message={`Reject "${item.title}"? This action cannot be undone.`}
        confirmLabel="Reject" variant="danger" onConfirm={handleReject} onCancel={() => setConfirmAction(null)} busy={busy} />
      <ConfirmDialog open={confirmAction === "clarify"} title="Return for Clarification"
        message={`Return "${item.title}" for additional justification?`}
        confirmLabel="Return" variant="warning" onConfirm={handleReturnForClarification} onCancel={() => setConfirmAction(null)} busy={busy} />
    </>
  );
}

function InlineNotice({ children, className = "" }) {
  return (
    <div
      className={`border-l-4 pl-3 text-xs text-[var(--color-text-secondary)] ${className}`}
      style={{ borderLeftColor: semanticStatus.warning.text }}
      role="note"
    >
      {children}
    </div>
  );
}


