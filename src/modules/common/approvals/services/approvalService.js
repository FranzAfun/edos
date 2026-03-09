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
import {
  APPROVAL_STAGES,
  APPROVAL_STAGE_LABELS,
  getNextStage,
} from "../../../../governance/approvalStages";

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

function assertReviewerAuthorized(userId, stage) {
  const reviewer = userStore.getUserById(userId);
  if (!reviewer) {
    throw new Error("Reviewer not found");
  }

  const allowedRoles = STAGE_REVIEWER_ROLES[stage] || [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(reviewer.roleKey)) {
    throw new Error(`Role ${reviewer.roleKey} cannot review ${stage}`);
  }

  return reviewer;
}

// ---------------------------------------------------------------------------
// Queue getters
// ---------------------------------------------------------------------------

export const getTechReviewQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_TECH_REVIEW);
});

export const getFoQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_FO);
});

export const getCeoQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_CEO);
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
 * or to the requester if fully approved.
 */
export const approveApproval = createModuleService(
  async ({ id, userId, note }) => {
    const current = approvalStore.getApprovalById(id);
    if (!current) throw new Error("Approval not found");

    assertReviewerAuthorized(userId, current.currentStage);

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

    const nextStage = getNextStage(current.currentStage);
    if (!nextStage) throw new Error("Approval is already in a terminal state");

    const updated = approvalStore.updateApprovalStage(id, {
      nextStage,
      action: "APPROVED",
      userId,
      note,
    });

    syncFundRequestStatus(updated, nextStage);

    // Determine notification target
    if (nextStage === APPROVAL_STAGES.PENDING_FO) {
      const foUser = getUserForRole("finance");
      notifyUser(
        foUser?.id,
        "APPROVAL_ADVANCED",
        `"${updated.title}" passed CTO/COO technical review and awaits Financial Officer review.`
      );
    } else if (nextStage === APPROVAL_STAGES.PENDING_CEO) {
      const ceoUser = getUserForRole("ceo");
      notifyUser(
        ceoUser?.id,
        "APPROVAL_ADVANCED",
        `"${updated.title}" passed Financial Officer review and awaits CEO approval.`
      );
    } else if (nextStage === APPROVAL_STAGES.APPROVED) {
      if (updated.sourceType === "FUND_REQUEST") {
        receiptStore.createReceiptPlaceholder(
          updated.id,
          updated.sourceId,
          new Date().toISOString()
        );
      }

      notifyUser(
        updated.requestedByUserId,
        "APPROVAL_FINAL",
        `Your request "${updated.title}" has been fully APPROVED.`
      );
    }

    return updated;
  }
);

/**
 * Reject an approval request from any stage.
 * Notifies the original requester.
 */
export const rejectApproval = createModuleService(
  async ({ id, userId, note }) => {
    const current = approvalStore.getApprovalById(id);
    if (!current) throw new Error("Approval not found");

    assertReviewerAuthorized(userId, current.currentStage);

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
 * Starts at PENDING_TECH_REVIEW. Notifies CTO and COO reviewers.
 */
export const createApproval = createModuleService(async (payload) => {
  const entry = approvalStore.createApproval(payload);

  notifyRoles(
    ["cto", "coo"],
    "APPROVAL_CREATED",
    `New approval request: "${entry.title}" (GHS ${Number(
      entry.amount
    ).toLocaleString()}) awaits CTO/COO technical review.`
  );

  return entry;
});
