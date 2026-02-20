/**
 * TrustBadge - Displays user trust level based on KPI score (F14)
 */
import { getUserTrustLevel, getUserKpiPercentage } from "../../shared/services/trustLevelStore";
import StatusBadge from "../../shared/ui/StatusBadge";

export default function TrustBadge({ userId, showPercentage = false }) {
  if (!userId) return null;
  const level = getUserTrustLevel(userId);
  const pct = getUserKpiPercentage(userId);

  return (
    <span className="inline-flex items-center gap-1">
      <StatusBadge label={level.label} variant={level.variant} />
      {showPercentage && (
        <span className="text-xs font-medium text-[var(--color-text-muted)]">{pct}%</span>
      )}
    </span>
  );
}
