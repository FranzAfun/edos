import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useModuleQuery from "../../../shared/hooks/useModuleQuery";
import {
  getAllBudgets,
  updateMonthlyLimit,
  toggleFreeze,
} from "./services/budgetService";
import * as departmentStore from "../../../shared/services/departmentStore";

export default function AdminBudgetsPage() {
  const query = useModuleQuery(getAllBudgets);

  return (
    <div>
      <PageSection
        title="Department Budgets"
        subtitle="Set monthly limits and freeze/unfreeze department funding."
      >
        <ModuleBoundary
          query={query}
          title="Budgets"
          emptyText="No department budgets found."
        >
          <Grid cols={1}>
            {(query.data || []).map((budget) => (
              <BudgetRow
                key={budget.departmentId}
                budget={budget}
                onAction={() => query.reload()}
              />
            ))}
          </Grid>
        </ModuleBoundary>
      </PageSection>
    </div>
  );
}

function BudgetRow({ budget, onAction }) {
  const [limitInput, setLimitInput] = useState("");
  const [busy, setBusy] = useState(false);

  const handleUpdateLimit = useCallback(async () => {
    const amount = Number(limitInput);
    if (!amount || amount <= 0) return;
    setBusy(true);
    await updateMonthlyLimit({ departmentId: budget.departmentId, amount });
    setBusy(false);
    setLimitInput("");
    onAction();
  }, [budget.departmentId, limitInput, onAction]);

  const handleToggleFreeze = useCallback(async () => {
    setBusy(true);
    await toggleFreeze({ departmentId: budget.departmentId });
    setBusy(false);
    onAction();
  }, [budget.departmentId, onAction]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">{departmentStore.getDepartmentById(budget.departmentId)?.name ?? budget.departmentId}</h3>
            {budget.frozen && (
              <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                Frozen
              </span>
            )}
            {!budget.frozen && (
              <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Monthly Limit: GHS {Number(budget.monthlyLimit).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Remaining: GHS {Number(budget.remainingLimit).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            Updated: {new Date(budget.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <input
          type="number"
          placeholder="New limit…"
          value={limitInput}
          onChange={(e) => setLimitInput(e.target.value)}
          className="w-36 rounded border px-2 py-1 text-xs"
          min="0"
        />
        <button
          onClick={handleUpdateLimit}
          disabled={busy || !limitInput}
          className="rounded bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-900 disabled:opacity-50"
        >
          Set Limit
        </button>
        <button
          onClick={handleToggleFreeze}
          disabled={busy}
          className={`rounded px-3 py-1 text-xs text-white disabled:opacity-50 ${
            budget.frozen
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {budget.frozen ? "Unfreeze" : "Freeze"}
        </button>
      </div>
    </Card>
  );
}
