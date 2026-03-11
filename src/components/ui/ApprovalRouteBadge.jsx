/**
 * ApprovalRouteBadge - Shows the approval path based on amount (F2)
 */
import { semanticStatus } from "@/theme/semanticColors";
import useRole from "../../hooks/useRole";
import {
  APPROVAL_STAGE_BADGE_LABELS,
} from "../../governance/approvalStages";
import { getApprovalRoute } from "../../shared/services/fundRequestStore";

const ROUTE_STYLES = {
  FO_ONLY: semanticStatus.success,
  FO_CEO: semanticStatus.warning,
  CEO_ONLY: semanticStatus.warning,
  CEO_JUSTIFICATION: semanticStatus.error,
};

export default function ApprovalRouteBadge({ amount, viewerRole, showLabel = true }) {
  const { role } = useRole() || {};
  if (!amount || amount <= 0) return null;
  const route = getApprovalRoute(amount, viewerRole || role);

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
        {route.stages.map((stage) => (
          <span key={stage} className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
            {APPROVAL_STAGE_BADGE_LABELS[stage] || stage}
          </span>
        ))}
      </span>
    </div>
  );
}
