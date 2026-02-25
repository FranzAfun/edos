/**
 * ApprovalRouteBadge - Shows the approval path based on amount (F2)
 */
import { getApprovalRoute } from "../../shared/services/fundRequestStore";

const ROUTE_STYLES = {
  FO_ONLY: "bg-green-50 text-green-700 border-green-200",
  FO_CEO: "bg-amber-50 text-amber-700 border-amber-200",
  CEO_JUSTIFICATION: "bg-red-50 text-red-700 border-red-200",
};

export default function ApprovalRouteBadge({ amount }) {
  if (!amount || amount <= 0) return null;
  const route = getApprovalRoute(amount);

  return (
    <div className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs font-medium ${ROUTE_STYLES[route.route] || ""}`}>
      <span>{route.label}</span>
      <span className="flex gap-1">
        {route.stages.map((stage) => (
          <span key={stage} className="rounded bg-white/50 px-1.5 py-0.5 text-[10px] font-semibold">
            {stage}
          </span>
        ))}
      </span>
    </div>
  );
}
