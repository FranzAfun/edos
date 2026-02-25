/**
 * approvalService.js
 * Normalized service layer for approval workflow.
 * Integrates notification triggers on stage transitions.
 *
 * Responses: { success, data, error }
 */

import createModuleService from "../../../../shared/services/createModuleService";
import * as approvalStore from "../../../../shared/services/approvalStore";
import * as notificationStore from "../../../../shared/services/notificationStore";
import * as userStore from "../../../../shared/services/userStore";
import {
  APPROVAL_STAGES,
  APPROVAL_STAGE_LABELS,
  getNextStage,
} from "../../../../governance/approvalStages";

// ---------------------------------------------------------------------------
// Helpers – resolve target user for notifications
// ---------------------------------------------------------------------------

function getUserForRole(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

function notifyUser(toUserId, type, message) {
  if (!toUserId) return;
  notificationStore.createNotification({ toUserId, type, message });
}

// ---------------------------------------------------------------------------
// Queue getters
// ---------------------------------------------------------------------------

export const getFoQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_FO);
});

export const getOperationsQueue = createModuleService(async () => {
  return approvalStore.getApprovalsByStage(APPROVAL_STAGES.PENDING_OPERATIONS);
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

    const nextStage = getNextStage(current.currentStage);
    if (!nextStage) throw new Error("Approval is already in a terminal state");

    const updated = approvalStore.updateApprovalStage(id, {
      nextStage,
      action: "APPROVED",
      userId,
      note,
    });

    // Determine notification target
    if (nextStage === APPROVAL_STAGES.PENDING_OPERATIONS) {
      const opsUser = getUserForRole("operations");
      notifyUser(
        opsUser?.id,
        "APPROVAL_ADVANCED",
        `"${updated.title}" passed FO review and awaits Operations review.`
      );
    } else if (nextStage === APPROVAL_STAGES.PENDING_CEO) {
      const ceoUser = getUserForRole("ceo");
      notifyUser(
        ceoUser?.id,
        "APPROVAL_ADVANCED",
        `"${updated.title}" passed Operations review and awaits CEO approval.`
      );
    } else if (nextStage === APPROVAL_STAGES.APPROVED) {
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

    const updated = approvalStore.updateApprovalStage(id, {
      nextStage: APPROVAL_STAGES.REJECTED,
      action: "REJECTED",
      userId,
      note,
    });

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
 * Starts at PENDING_FO. Notifies the FO user.
 */
export const createApproval = createModuleService(async (payload) => {
  const entry = approvalStore.createApproval(payload);

  const foUser = getUserForRole("finance");
  notifyUser(
    foUser?.id,
    "APPROVAL_CREATED",
    `New approval request: "${entry.title}" (GHS ${Number(
      entry.amount
    ).toLocaleString()}) awaits FO review.`
  );

  return entry;
});
