import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useApprovalQueue from "../../common/approvals/hooks/useApprovalQueue";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import {
  getTechReviewQueue,
  approveApproval,
  rejectApproval,
} from "../../common/approvals/services/approvalService";
import { semanticStatus } from "@/theme/semanticColors";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import * as userStore from "../../../shared/services/userStore";
import * as complianceStore from "../../../shared/services/complianceStore";
import * as fundRequestStore from "../../../shared/services/fundRequestStore";
import * as programStore from "../../../shared/services/programStore";
import useRole from "../../../hooks/useRole";
import { formatApprovalSourceType } from "../../../utils/approvalLabels";

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

function resolveProgramNameFromApproval(item) {
  if (item.sourceType !== "FUND_REQUEST" || !item.sourceId) {
    return "—";
  }

  const request = fundRequestStore.getFundRequestById(item.sourceId);
  if (!request) {
    return "—";
  }

  if (request.programId) {
    const program = programStore.getProgramById(request.programId);
    if (program?.name) {
      return program.name;
    }
  }

  return request.program || "—";
}

export default function OperationsApprovalsPage() {
  useDocumentTitle("Technical Approvals");
  const { role } = useRole();
  const userId = resolveUserId(role);
  const query = useApprovalQueue(getTechReviewQueue, { params: { role } });

  return (
    <div>
      <PageSection
        title="Technical Approval Queue"
        subtitle="CTO/COO technical review before finance and CEO approval."
      >
        <ModuleBoundary
          query={query}
          title="Technical Review Queue"
          emptyText="No approvals pending CTO/COO technical review."
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
  const [confirmAction, setConfirmAction] = useState(null);
  const programName = resolveProgramNameFromApproval(item);
  const complianceNotice = getComplianceNotice(item.requestedByUserId);

  const handleApprove = useCallback(async () => {
    setBusy(true);
    try {
      await approveApproval({ id: item.id, userId, note });
      setNote("");
      setConfirmAction(null);
      onAction();
    } finally {
      setBusy(false);
    }
  }, [item.id, userId, note, onAction]);

  const handleReject = useCallback(async () => {
    setBusy(true);
    try {
      await rejectApproval({ id: item.id, userId, note });
      setNote("");
      setConfirmAction(null);
      onAction();
    } finally {
      setBusy(false);
    }
  }, [item.id, userId, note, onAction]);

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <span className="text-xs text-gray-400 uppercase">
                {formatApprovalSourceType(item.sourceType)}
              </span>
            </div>
            <h3 className="text-sm font-semibold truncate">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Amount: GHS {Number(item.amount).toLocaleString()} &middot; Requested{" "}
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Program: {programName}</p>
            {complianceNotice ? <InlineNotice className="mt-3">{complianceNotice}</InlineNotice> : null}
          </div>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <input
            type="text"
            placeholder="Optional note…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 rounded border px-2 py-1 text-xs"
          />
          <button
            onClick={() => setConfirmAction("approve")}
            disabled={busy}
            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => setConfirmAction("reject")}
            disabled={busy}
            className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmAction === "approve"}
        title="Approve Request"
        message={`Approve "${item.title}" for GHS ${Number(item.amount).toLocaleString()}?`}
        confirmLabel="Approve"
        variant="accent"
        onConfirm={handleApprove}
        onCancel={() => setConfirmAction(null)}
        busy={busy}
      />
      <ConfirmDialog
        open={confirmAction === "reject"}
        title="Reject Request"
        message={`Reject "${item.title}"? This action cannot be undone.`}
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => setConfirmAction(null)}
        busy={busy}
      />
    </>
  );
}

function getComplianceNotice(userId) {
  const compliance = complianceStore.getCompliance(userId);
  if (!compliance) return "";

  if (compliance.isFundingBlocked) {
    return "Funding is currently blocked for this requester.";
  }

  if (compliance.outstandingEvidenceCount > 0) {
    return `Evidence pending (${compliance.outstandingEvidenceCount}).`;
  }

  return null;
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


