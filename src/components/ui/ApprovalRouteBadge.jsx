/**
 * ApprovalRouteBadge - Shows the approval path based on amount (F2)
 */
import { getApprovalRoute } from "../../shared/services/fundRequestStore";

const ROUTE_STYLES = {
  FO_ONLY: "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.14)] text-[#22C55E]",
  FO_CEO: "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.14)] text-[#F59E0B]",
  CEO_JUSTIFICATION: "border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.14)] text-[#EF4444]",
};

export default function ApprovalRouteBadge({ amount }) {
  if (!amount || amount <= 0) return null;
  const route = getApprovalRoute(amount);

  return (
    <div className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-medium ${ROUTE_STYLES[route.route] || ""}`}>
      <span>{route.label}</span>
      <span className="flex gap-1">
        {route.stages.map((stage) => (
          <span key={stage} className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
            {stage}
          </span>
        ))}
      </span>
    </div>
  );
}
