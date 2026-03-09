/**
 * ApprovalRouteBadge - Shows the approval path based on amount (F2)
 */
import { semanticStatus } from "@/theme/semanticColors";
import useRole from "../../hooks/useRole";
import {
  APPROVAL_STAGES,
  APPROVAL_STAGE_BADGE_LABELS,
} from "../../governance/approvalStages";
import { getApprovalRoute } from "../../shared/services/fundRequestStore";

const ROUTE_STYLES = {
  FO_ONLY: semanticStatus.success,
  FO_CEO: semanticStatus.warning,
  CEO_JUSTIFICATION: semanticStatus.error,
};

const ROLE_STAGE_START = {
  cto: APPROVAL_STAGES.PENDING_TECH_REVIEW,
  coo: APPROVAL_STAGES.PENDING_TECH_REVIEW,
  finance: APPROVAL_STAGES.PENDING_FO,
  ceo: APPROVAL_STAGES.PENDING_CEO,
};

function getVisibleStages(stages, roleKey) {
  if (!Array.isArray(stages) || stages.length === 0) return [];

  if (!roleKey || roleKey === "executive" || roleKey === "admin") {
    return stages;
  }

  const startStage = ROLE_STAGE_START[roleKey];
  if (!startStage) return stages;

  const startIndex = stages.indexOf(startStage);
  const visibleStages = startIndex === -1 ? stages : stages.slice(startIndex);

  if (
    (roleKey === "cto" || roleKey === "coo" || roleKey === "finance") &&
    visibleStages.length > 2 &&
    visibleStages[visibleStages.length - 1] === APPROVAL_STAGES.APPROVED
  ) {
    return visibleStages.slice(0, -1);
  }

  return visibleStages;
}

export default function ApprovalRouteBadge({ amount, viewerRole, showLabel = true }) {
  if (!amount || amount <= 0) return null;
  const { role } = useRole() || {};
  const route = getApprovalRoute(amount);
  const visibleStages = getVisibleStages(route.stages, viewerRole || role);

  return (
    <div
      className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium"
      style={ROUTE_STYLES[route.route] ? {
        backgroundColor: ROUTE_STYLES[route.route].bg,
        color: ROUTE_STYLES[route.route].text,
      } : undefined}
    >
      {showLabel ? <span>{route.label}</span> : null}
      <span className="flex gap-1">
        {visibleStages.map((stage) => (
          <span key={stage} className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
            {APPROVAL_STAGE_BADGE_LABELS[stage] || stage}
          </span>
        ))}
      </span>
    </div>
  );
}
