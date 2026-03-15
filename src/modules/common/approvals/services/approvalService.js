/**
 * approvalService.js
 * Normalized service layer for approval workflow.
 * Integrates notification triggers on stage transitions.
 *
 * Responses: { success, data, error }
 */

import createModuleService from "../../../../shared/services/createModuleService";
import * as approvalStore from "../../../../shared/services/approvalStore";
import * as complianceStore from "../../../../shared/services/complianceStore";
import * as fundRequestStore from "../../../../shared/services/fundRequestStore";
import * as notificationStore from "../../../../shared/services/notificationStore";
import * as receiptStore from "../../../../shared/services/receiptStore";
import * as userStore from "../../../../shared/services/userStore";
import * as auditStore from "../../../../shared/services/auditStore";
import {
  APPROVAL_STAGES,
  APPROVAL_STAGE_LABELS,
} from "../../../../governance/approvalStages";
import { getSupervisorLabel, normalizeSupervisor } from "../../../../utils/supervisor";

const COMPLIANCE_REJECTION_REASON =
  "Outstanding receipts must be uploaded before new funding requests can be approved.";
const COMPLIANCE_REJECTION_MESSAGE =
  "Your funding request was rejected because there are outstanding receipts from previous approvals. Upload the required receipts before submitting a new request.";

const STAGE_REVIEWER_ROLES = {
  [APPROVAL_STAGES.PENDING_TECH_REVIEW]: ["cto", "coo"],
  [APPROVAL_STAGES.PENDING_FO]: ["finance"],
  [APPROVAL_STAGES.PENDING_CEO]: ["ceo"],
};

// ---------------------------------------------------------------------------
// Helpers – resolve target user for notifications
// ---------------------------------------------------------------------------

function getUserForRole(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

function getUsersForRoles(roleKeys) {
  return roleKeys.flatMap((roleKey) => userStore.getUsersByRole(roleKey));
}

function notifyUser(toUserId, type, message) {
  if (!toUserId) return;
  notificationStore.createNotification({ toUserId, type, message });
}

function notifyRoles(roleKeys, type, message) {
  const notifiedUserIds = new Set();

  getUsersForRoles(roleKeys).forEach((user) => {
    if (!user?.id || notifiedUserIds.has(user.id)) return;
    notifiedUserIds.add(user.id);
    notifyUser(user.id, type, message);
  });
}

function syncFundRequestStatus(approval, status) {
  if (approval?.sourceType !== "FUND_REQUEST" || !approval?.sourceId) return;
  fundRequestStore.updateFundRequest(approval.sourceId, { status });
}

function getRequesterRole(requestedByUserId) {
  return userStore.getUserById(requestedByUserId)?.roleKey || "executive";
}

function getRequestReference(approval) {
  return approval?.sourceId || approval?.id || "unknown";
}

function logFinancialAudit({ userId, action, approval, details = {} }) {
  if (!approval?.id) return;

  auditStore.createAuditEntry({
    userId,
    category: auditStore.AUDIT_CATEGORIES.FINANCIAL_AUDIT,
    action,
    entityType: "approval",
    entityId: approval.id,
    details: {
      sourceId: approval.sourceId || null,
      sourceType: approval.sourceType || null,
      currentStage: approval.currentStage,
      ...details,
    },
  });
}

function notifyReadyForDisbursement(approval) {
  const financeUsers = userStore.getUsersByRole("finance");
  const message = `Request #${getRequestReference(approval)} approved. Funds ready for disbursement.`;

  financeUsers.forEach((user) => {
    notifyUser(user.id, "READY_FOR_DISBURSEMENT", message);
  });

  const requesterRole = getRequesterRole(approval?.requestedByUserId);
  if (["executive", "cto", "coo"].includes(requesterRole)) {
    notifyUser(
      approval?.requestedByUserId,
      "FUNDS_APPROVED",
      "Your funds have been approved. Please collect from Finance."
    );
  }
}

function getTechnicalReviewerRole(approval) {
  return normalizeSupervisor(approval?.supervisor) || "";
}

function getNextApprovalStage(approval) {
  if (!approval) return null;

  if (approval.currentStage === APPROVAL_STAGES.PENDING_TECH_REVIEW) {
    return APPROVAL_STAGES.PENDING_FO;
  }

  if (approval.currentStage === APPROVAL_STAGES.PENDING_FO) {
    return fundRequestStore.requiresCeoApproval(approval.amount)
      ? APPROVAL_STAGES.PENDING_CEO
      : APPROVAL_STAGES.APPROVED;
  }

  if (approval.currentStage === APPROVAL_STAGES.PENDING_CEO) {
    return APPROVAL_STAGES.APPROVED;
  }

  return null;
}

function assertReviewerAuthorized(userId, approval) {
  const reviewer = userStore.getUserById(userId);
  if (!reviewer) {
    throw new Error("Reviewer not found");
  }

  if (reviewer.id === approval?.requestedByUserId) {
    throw new Error("Requesters cannot approve their own requests");
  }

  const stage = approval?.currentStage;
  const allowedRoles = stage === APPROVAL_STAGES.PENDING_TECH_REVIEW
    ? [getTechnicalReviewerRole(approval)].filter(Boolean)
    : (STAGE_REVIEWER_ROLES[stage] || []);

  if (allowedRoles.length > 0 && !allowedRoles.includes(reviewer.roleKey)) {
    throw new Error(`Role ${reviewer.roleKey} cannot review ${stage}`);
  }

  return reviewer;
}

// ---------------------------------------------------------------------------
// Queue getters
// ---------------------------------------------------------------------------

export const getTechReviewQueue = createModuleService(async (params = {}) => {
  const reviewerRole = normalizeSupervisor(params?.role);

  return approvalStore.getTechReviewApprovalsForSupervisor(reviewerRole);
});

export const getFoQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_FO);
});

export const getCeoQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_CEO);
});

export const getReadyForDisbursementQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.READY_FOR_DISBURSEMENT);
});

export const getAllApprovals = createModuleService(async () => {
  return approvalStore.listApprovals();
});

export const getApprovalDetail = createModuleService(async ({ id }) => {
  const item = approvalStore.getApprovalById(id);
  if (!item) throw new Error("Approval not found");
  return item;
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Approve an approval request – advances to next stage.
 * Sends notification to the reviewer of the next stage,
 * or moves approved items into finance-owned disbursement.
 */
export const approveApproval = createModuleService(
  async ({ id, userId, note }) => {
    const current = approvalStore.getApprovalById(id);
    if (!current) throw new Error("Approval not found");

    assertReviewerAuthorized(userId, current);

    if (
      current.currentStage === APPROVAL_STAGES.PENDING_FO &&
      complianceStore.hasOutstandingReceipts(current.requestedByUserId)
    ) {
      const blocked = approvalStore.updateApprovalStage(id, {
        nextStage: APPROVAL_STAGES.REJECTED_COMPLIANCE,
        action: "REJECTED_COMPLIANCE",
        userId,
        note: COMPLIANCE_REJECTION_REASON,
      });

      syncFundRequestStatus(blocked, APPROVAL_STAGES.REJECTED_COMPLIANCE);

      notifyUser(
        blocked.requestedByUserId,
        "Funding Request Blocked",
        COMPLIANCE_REJECTION_MESSAGE
      );

      return blocked;
    }

    const nextStage = getNextApprovalStage(current);
    if (!nextStage) throw new Error("Approval is already in a terminal state");

    let approvalAction = null;
    if (current.currentStage === APPROVAL_STAGES.PENDING_TECH_REVIEW) {
      approvalAction = auditStore.FINANCIAL_AUDIT_ACTIONS.SUPERVISOR_APPROVED;
    } else if (current.currentStage === APPROVAL_STAGES.PENDING_FO) {
      approvalAction = auditStore.FINANCIAL_AUDIT_ACTIONS.FINANCE_APPROVED;
    } else if (current.currentStage === APPROVAL_STAGES.PENDING_CEO) {
      approvalAction = auditStore.FINANCIAL_AUDIT_ACTIONS.CEO_APPROVED;
    }

    const updated = approvalStore.updateApprovalStage(id, {
      nextStage,
      action: "APPROVED",
      userId,
      note,
    });

    syncFundRequestStatus(updated, nextStage);

    // Determine notification target
    if (nextStage === APPROVAL_STAGES.PENDING_FO) {
      logFinancialAudit({
        userId,
        action: approvalAction,
        approval: updated,
        details: {
          fromStage: current.currentStage,
          toStage: updated.currentStage,
          note: note || "",
        },
      });

      const foUser = getUserForRole("finance");
      const technicalReviewerLabel = getSupervisorLabel(current.supervisor) || "Technical";
      notifyUser(
        foUser?.id,
        "APPROVAL_ADVANCED",
        `"${updated.title}" passed ${technicalReviewerLabel} review and awaits Financial Officer review.`
      );
    } else if (nextStage === APPROVAL_STAGES.PENDING_CEO) {
      logFinancialAudit({
        userId,
        action: approvalAction,
        approval: updated,
        details: {
          fromStage: current.currentStage,
          toStage: updated.currentStage,
          note: note || "",
        },
      });

      const ceoUser = getUserForRole("ceo");
      notifyUser(
        ceoUser?.id,
        "APPROVAL_ADVANCED",
        `"${updated.title}" passed Financial Officer review and awaits CEO approval.`
      );
    } else if (nextStage === APPROVAL_STAGES.APPROVED) {
      const readyApproval = approvalStore.updateApprovalStage(id, {
        nextStage: APPROVAL_STAGES.READY_FOR_DISBURSEMENT,
        action: "READY_FOR_DISBURSEMENT",
        userId,
        note: "Approved and forwarded to Finance for disbursement.",
      });

      syncFundRequestStatus(readyApproval, APPROVAL_STAGES.READY_FOR_DISBURSEMENT);
      notifyReadyForDisbursement(readyApproval);

      logFinancialAudit({
        userId,
        action: approvalAction,
        approval: readyApproval,
        details: {
          fromStage: current.currentStage,
          toStage: readyApproval.currentStage,
          note: note || "",
        },
      });

      return readyApproval;
    }

    return updated;
  }
);

export const markApprovalAsDisbursed = createModuleService(async ({ id, userId, note }) => {
  const current = approvalStore.getApprovalById(id);
  if (!current) throw new Error("Approval not found");

  const reviewer = userStore.getUserById(userId);
  if (!reviewer || reviewer.roleKey !== "finance") {
    throw new Error("Only finance can mark requests as disbursed");
  }

  if (current.currentStage !== APPROVAL_STAGES.READY_FOR_DISBURSEMENT) {
    throw new Error("Request is not ready for disbursement");
  }

  const updated = approvalStore.updateApprovalStage(id, {
    nextStage: APPROVAL_STAGES.DISBURSED,
    action: "DISBURSED",
    userId,
    note: note || "Funds disbursed by Finance.",
  });

  syncFundRequestStatus(updated, APPROVAL_STAGES.DISBURSED);

  logFinancialAudit({
    userId,
    action: auditStore.FINANCIAL_AUDIT_ACTIONS.FUNDS_DISBURSED,
    approval: updated,
    details: {
      fromStage: current.currentStage,
      toStage: updated.currentStage,
      note: note || "",
    },
  });

  if (updated.sourceType === "FUND_REQUEST") {
    receiptStore.createReceiptPlaceholder(updated.id, updated.sourceId, new Date().toISOString());
  }

  return updated;
});

/**
 * Reject an approval request from any stage.
 * Notifies the original requester.
 */
export const rejectApproval = createModuleService(
  async ({ id, userId, note }) => {
    const current = approvalStore.getApprovalById(id);
    if (!current) throw new Error("Approval not found");

    assertReviewerAuthorized(userId, current);

    const updated = approvalStore.updateApprovalStage(id, {
      nextStage: APPROVAL_STAGES.REJECTED,
      action: "REJECTED",
      userId,
      note,
    });

    syncFundRequestStatus(updated, APPROVAL_STAGES.REJECTED);

    const stageLabel =
      APPROVAL_STAGE_LABELS[current.currentStage] || current.currentStage;

    notifyUser(
      updated.requestedByUserId,
      "APPROVAL_REJECTED",
      `Your request "${updated.title}" was REJECTED at "${stageLabel}".${
        note ? " Reason: " + note : ""
      }`
    );

    return updated;
  }
);

/**
 * Create a new approval request.
 * Starts at PENDING_TECH_REVIEW. Notifies the assigned CTO/COO reviewer.
 */
export const createApproval = createModuleService(async (payload) => {
  const requesterRole = getRequesterRole(payload.requestedByUserId);
  const initialStage = fundRequestStore.getInitialApprovalStageForRole(requesterRole);
  const entry = approvalStore.createApproval({
    ...payload,
    initialStage,
  });

  logFinancialAudit({
    userId: payload.requestedByUserId,
    action: auditStore.FINANCIAL_AUDIT_ACTIONS.REQUEST_CREATED,
    approval: entry,
    details: {
      title: entry.title,
      amount: entry.amount,
      initialStage,
      supervisor: entry.supervisor || null,
    },
  });

  const technicalReviewerRole = getTechnicalReviewerRole(entry);
  const technicalReviewerLabel = getSupervisorLabel(technicalReviewerRole) || "Technical";

  syncFundRequestStatus(entry, initialStage);

  if (initialStage === APPROVAL_STAGES.PENDING_TECH_REVIEW && technicalReviewerRole) {
    notifyRoles(
      [technicalReviewerRole],
      "APPROVAL_CREATED",
      `New approval request: "${entry.title}" (GHS ${Number(
        entry.amount
      ).toLocaleString()}) awaits ${technicalReviewerLabel} review.`
    );
  } else if (initialStage === APPROVAL_STAGES.PENDING_FO) {
    const foUser = getUserForRole("finance");
    notifyUser(
      foUser?.id,
      "APPROVAL_CREATED",
      `New approval request: "${entry.title}" (GHS ${Number(entry.amount).toLocaleString()}) awaits Financial Officer review.`
    );
  } else if (initialStage === APPROVAL_STAGES.PENDING_CEO) {
    const ceoUser = getUserForRole("ceo");
    notifyUser(
      ceoUser?.id,
      "APPROVAL_CREATED",
      `New approval request: "${entry.title}" (GHS ${Number(entry.amount).toLocaleString()}) awaits CEO approval.`
    );
  }

  return entry;
});
