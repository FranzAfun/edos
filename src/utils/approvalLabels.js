import { APPROVAL_STAGE_LABELS } from "../governance/approvalStages";

const SOURCE_TYPE_LABELS = {
  FUND_REQUEST: "Fund Request",
  PROCUREMENT: "Procurement",
  BUDGET: "Budget",
  KPI: "KPI",
};

const STAGE_LABEL_OVERRIDES = {
  REJECTED_COMPLIANCE: "Rejected by Compliance",
  REJECTED: "Rejected",
  APPROVED: "Approved",
  RETURNED_FOR_CLARIFICATION: "Returned for Clarification",
};

function toTitleCaseLabel(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatApprovalSourceType(sourceType) {
  return SOURCE_TYPE_LABELS[sourceType] || toTitleCaseLabel(sourceType);
}

export function formatApprovalStage(stage) {
  return STAGE_LABEL_OVERRIDES[stage] || APPROVAL_STAGE_LABELS[stage] || toTitleCaseLabel(stage);
}
