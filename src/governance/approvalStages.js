import { semanticStatus } from "@/theme/semanticColors";

/**
 * Approval workflow stages.
 *
 * Flow:
 * - ≤ 1,000: PENDING_TECH_REVIEW → PENDING_FO → APPROVED
 * - > 1,000: PENDING_TECH_REVIEW → PENDING_FO → PENDING_CEO → APPROVED
 * Any stage can transition to REJECTED.
 */

export const APPROVAL_STAGES = {
  PENDING_TECH_REVIEW: "PENDING_TECH_REVIEW",
  PENDING_FO: "PENDING_FO",
  PENDING_CEO: "PENDING_CEO",
  APPROVED: "APPROVED",
  REJECTED_COMPLIANCE: "REJECTED_COMPLIANCE",
  REJECTED: "REJECTED",
};

export const APPROVAL_STAGE_LABELS = {
  [APPROVAL_STAGES.PENDING_TECH_REVIEW]: "Pending CTO/COO Technical Review",
  [APPROVAL_STAGES.PENDING_FO]: "Pending FO Review",
  [APPROVAL_STAGES.PENDING_CEO]: "Pending CEO Approval",
  [APPROVAL_STAGES.APPROVED]: "Approved",
  [APPROVAL_STAGES.REJECTED_COMPLIANCE]: "REJECTED_COMPLIANCE",
  [APPROVAL_STAGES.REJECTED]: "Rejected",
};

export const APPROVAL_STAGE_BADGE_LABELS = {
  [APPROVAL_STAGES.PENDING_TECH_REVIEW]: "TECH",
  [APPROVAL_STAGES.PENDING_FO]: "FO",
  [APPROVAL_STAGES.PENDING_CEO]: "CEO",
  [APPROVAL_STAGES.APPROVED]: "APPROVED",
  [APPROVAL_STAGES.REJECTED_COMPLIANCE]: "REJECTED",
  [APPROVAL_STAGES.REJECTED]: "REJECTED",
};

export const APPROVAL_STAGE_COLORS = {
  [APPROVAL_STAGES.PENDING_TECH_REVIEW]: semanticStatus.info,
  [APPROVAL_STAGES.PENDING_FO]: semanticStatus.warning,
  [APPROVAL_STAGES.PENDING_CEO]: semanticStatus.info,
  [APPROVAL_STAGES.APPROVED]: semanticStatus.success,
  [APPROVAL_STAGES.REJECTED_COMPLIANCE]: semanticStatus.error,
  [APPROVAL_STAGES.REJECTED]: semanticStatus.error,
};

/** Ordered stages for the approval pipeline (excludes REJECTED). */
export const APPROVAL_PIPELINE = [
  APPROVAL_STAGES.PENDING_TECH_REVIEW,
  APPROVAL_STAGES.PENDING_FO,
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
  return (
    stage === APPROVAL_STAGES.APPROVED ||
    stage === APPROVAL_STAGES.REJECTED ||
    stage === APPROVAL_STAGES.REJECTED_COMPLIANCE
  );
}

export function isRejectedStage(stage) {
  return (
    stage === APPROVAL_STAGES.REJECTED ||
    stage === APPROVAL_STAGES.REJECTED_COMPLIANCE
  );
}
