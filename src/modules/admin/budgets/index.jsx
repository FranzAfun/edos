import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import useModuleQuery from "../../../shared/hooks/useModuleQuery";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import {
  getAllBudgets,
  updateMonthlyLimit,
  toggleFreeze,
} from "./services/budgetService";
import * as departmentStore from "../../../shared/services/departmentStore";

export default function AdminBudgetsPage() {
  useDocumentTitle("Admin Budget Management");
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
  const [confirmLimit, setConfirmLimit] = useState(false);
  const [confirmFreeze, setConfirmFreeze] = useState(false);
  const departmentName =
    departmentStore.getDepartmentById(budget.departmentId)?.name ?? budget.departmentId;

  const handleUpdateLimit = useCallback(async () => {
    const amount = Number(limitInput);
    if (!amount || amount <= 0) return;
    setBusy(true);
    try {
      await updateMonthlyLimit({ departmentId: budget.departmentId, amount });
      setConfirmLimit(false);
      setLimitInput("");
      onAction();
    } finally {
      setBusy(false);
    }
  }, [budget.departmentId, limitInput, onAction]);

  const handlePromptLimitUpdate = useCallback(() => {
    const amount = Number(limitInput);
    if (!amount || amount <= 0) return;
    setConfirmLimit(true);
  }, [limitInput]);

  const handleToggleFreeze = useCallback(async () => {
    setBusy(true);
    try {
      await toggleFreeze({ departmentId: budget.departmentId });
      setConfirmFreeze(false);
      onAction();
    } finally {
      setBusy(false);
    }
  }, [budget.departmentId, onAction]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold">{departmentName}</h3>
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
          onClick={handlePromptLimitUpdate}
          disabled={busy || !limitInput || Number(limitInput) <= 0}
          className="rounded bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-900 disabled:opacity-50"
        >
          Set Limit
        </button>
        <button
          onClick={() => setConfirmFreeze(true)}
          disabled={busy}
          className={`rounded px-3 py-1 text-xs text-white disabled:opacity-50 ${
            budget.frozen
              ? "bg-green-600 hover:bg-green-700"
              : "btn-primary"
          }`}
        >
          {budget.frozen ? "Unfreeze" : "Freeze"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmFreeze}
        title={budget.frozen ? "Unfreeze Department Funding" : "Freeze Department Funding"}
        message={
          budget.frozen
            ? `Unfreeze ${departmentName}? This department will be able to submit fund requests again.`
            : `Freeze ${departmentName}? This will block fund requests for this department until unfrozen.`
        }
        confirmLabel={budget.frozen ? "Unfreeze" : "Freeze"}
        variant={budget.frozen ? "accent" : "danger"}
        onConfirm={handleToggleFreeze}
        onCancel={() => setConfirmFreeze(false)}
        busy={busy}
      />

      <ConfirmDialog
        open={confirmLimit}
        title="Confirm Budget Limit Update"
        message={`Set ${departmentName} monthly limit to GHS ${Number(limitInput || 0).toLocaleString()}? This takes effect immediately.`}
        confirmLabel="Set Limit"
        variant="warning"
        onConfirm={handleUpdateLimit}
        onCancel={() => setConfirmLimit(false)}
        busy={busy}
      />
    </Card>
  );
}


