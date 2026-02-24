/**
 * Approval workflow stages.
 *
 * Flow: PENDING_FO → PENDING_OPERATIONS → PENDING_CEO → APPROVED
 * Any stage can transition to REJECTED.
 */

export const APPROVAL_STAGES = {
  PENDING_FO: "PENDING_FO",
  PENDING_OPERATIONS: "PENDING_OPERATIONS",
  PENDING_CEO: "PENDING_CEO",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const APPROVAL_STAGE_LABELS = {
  [APPROVAL_STAGES.PENDING_FO]: "Pending FO Review",
  [APPROVAL_STAGES.PENDING_OPERATIONS]: "Pending Operations Review",
  [APPROVAL_STAGES.PENDING_CEO]: "Pending CEO Approval",
  [APPROVAL_STAGES.APPROVED]: "Approved",
  [APPROVAL_STAGES.REJECTED]: "Rejected",
};

export const APPROVAL_STAGE_COLORS = {
  [APPROVAL_STAGES.PENDING_FO]: "bg-yellow-100 text-yellow-800",
  [APPROVAL_STAGES.PENDING_OPERATIONS]: "bg-orange-100 text-orange-800",
  [APPROVAL_STAGES.PENDING_CEO]: "bg-purple-100 text-purple-800",
  [APPROVAL_STAGES.APPROVED]: "bg-green-100 text-green-800",
  [APPROVAL_STAGES.REJECTED]: "bg-red-100 text-red-800",
};

/** Ordered stages for the approval pipeline (excludes REJECTED). */
export const APPROVAL_PIPELINE = [
  APPROVAL_STAGES.PENDING_FO,
  APPROVAL_STAGES.PENDING_OPERATIONS,
  APPROVAL_STAGES.PENDING_CEO,
  APPROVAL_STAGES.APPROVED,
];

/**
 * Returns the next stage after approval, or null if already terminal.
 */
export function getNextStage(currentStage) {
  const idx = APPROVAL_PIPELINE.indexOf(currentStage);
  if (idx === -1 || idx >= APPROVAL_PIPELINE.length - 1) return null;
  return APPROVAL_PIPELINE[idx + 1];
}

/**
 * Is the approval in a terminal state?
 */
export function isTerminal(stage) {
  return stage === APPROVAL_STAGES.APPROVED || stage === APPROVAL_STAGES.REJECTED;
}
