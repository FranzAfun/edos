/**
 * trustLevelStore.js
 * KPI-score-based trust level computation (F14).
 *
 * Trust levels:
 * < 50%:  WARNING   - strict approvals
 * 50-69%: NORMAL    - standard
 * 70-84%: BONUS     - bonus eligible
 * 85-94%: HIGH      - higher trust
 * 95%+:   PRIORITY  - priority approvals
 */

import * as kpiStore from "./kpiStore";

export const TRUST_LEVELS = {
  WARNING:  { key: "WARNING",  label: "Warning",  min: 0,  max: 49,  variant: "danger",  description: "Strict approvals required" },
  NORMAL:   { key: "NORMAL",   label: "Normal",   min: 50, max: 69,  variant: "neutral", description: "Standard approval process" },
  BONUS:    { key: "BONUS",    label: "Bonus Eligible", min: 70, max: 84, variant: "info", description: "Eligible for performance bonus" },
  HIGH:     { key: "HIGH",     label: "High Trust", min: 85, max: 94, variant: "success", description: "Higher trust level granted" },
  PRIORITY: { key: "PRIORITY", label: "Priority",  min: 95, max: 100, variant: "purple",  description: "Priority approval processing" },
};

export function getUserKpiPercentage(userId) {
  const scores = kpiStore.listScoresByUser(userId);
  if (scores.length === 0) return 0;
  const tasks = kpiStore.listTasks().filter((t) => t.assignedToUserId === userId);
  if (tasks.length === 0) return 0;

  const maxPossible = tasks.reduce((sum, t) => {
    const multiplier = { Operational: 1, Important: 2, Strategic: 4 }[t.impactCategory] || 1;
    return sum + 100 * (t.weight || 1) * multiplier;
  }, 0);

  const earned = scores.reduce((sum, s) => sum + (s.computedScore || 0), 0);
  return maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;
}

export function getUserTrustLevel(userId) {
  const pct = getUserKpiPercentage(userId);
  if (pct >= 95) return TRUST_LEVELS.PRIORITY;
  if (pct >= 85) return TRUST_LEVELS.HIGH;
  if (pct >= 70) return TRUST_LEVELS.BONUS;
  if (pct >= 50) return TRUST_LEVELS.NORMAL;
  return TRUST_LEVELS.WARNING;
}
