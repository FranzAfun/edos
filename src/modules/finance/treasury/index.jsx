import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Treasury View (F12)
 * Treasury balance display with income/expense recording.
 * CRITICAL: Treasury is NOT budget. This is the real organizational balance.
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import FormField from "../../../shared/ui/FormField";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as treasuryStore from "../../../shared/services/treasuryStore";
import * as revenueStore from "../../../shared/services/revenueStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import useRole from "../../../hooks/useRole";

export default function TreasuryPage() {
  useDocumentTitle("Treasury");
  const { role } = useRole();
  const [treasury, setTreasury] = useState(() => treasuryStore.getTreasury());
  const [budgets, setBudgets] = useState(() => budgetStore.listBudgets());
  const reload = useCallback(() => {
    setTreasury(treasuryStore.getTreasury());
    setBudgets(budgetStore.listBudgets());
  }, []);
  const totalRevenue = revenueStore.getTotalRevenue();
  const confirmedRevenue = revenueStore.getConfirmedRevenue();
  const totalBudgetAllocated = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  const totalBudgetRemaining = budgets.reduce((s, b) => s + (b.remainingLimit || 0), 0);

  const canAdjust = role === "finance" || role === "ceo" || role === "admin";

  return (
    <div>
      <PageSection title="Treasury" subtitle="Organizational treasury balance — this is NOT department budgets">
        <Grid cols={4}>
          <MetricCard label="Treasury Balance" value={`GHS ${treasury.balance.toLocaleString()}`} />
          <MetricCard label="Confirmed Revenue" value={`GHS ${confirmedRevenue.toLocaleString()}`} />
          <MetricCard label="Total Budget Allocated" value={`GHS ${totalBudgetAllocated.toLocaleString()}`} />
          <MetricCard label="Budget Remaining" value={`GHS ${totalBudgetRemaining.toLocaleString()}`} />
        </Grid>
      </PageSection>

      <PageSection title="Treasury vs Revenue vs Budget">
        <Card>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Treasury</p>
              <p className="text-3xl font-bold mt-1">GHS {treasury.balance.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">
                The actual organizational money available. Last updated:{" "}
                {new Date(treasury.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold">GHS {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">All recorded revenue entries</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Confirmed Revenue</p>
                <p className="text-lg font-semibold">GHS {confirmedRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Fully paid revenue</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outstanding Revenue</p>
                <p className="text-lg font-semibold">GHS {(totalRevenue - confirmedRevenue).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Invoice + Partial payments</p>
              </div>
            </div>
          </div>
        </Card>
      </PageSection>

      {canAdjust && (
        <PageSection title="Treasury Adjustments" subtitle="Record income or expense against treasury">
          <Grid cols={2}>
            <TreasuryAdjustmentForm type="income" onAdjusted={reload} />
            <TreasuryAdjustmentForm type="expense" onAdjusted={reload} />
          </Grid>
        </PageSection>
      )}
    </div>
  );
}

function TreasuryAdjustmentForm({ type, onAdjusted }) {
  const [confirm, setConfirm] = useState(false);

  const rules = {
    amount: (v) => (!v || Number(v) <= 0 ? "Valid amount is required" : null),
  };

  const { values, errors, touched, handleChange, validate, reset } =
    useFormValidation({ amount: "", description: "" }, rules);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    setConfirm(true);
  }, [validate]);

  const handleConfirm = useCallback(() => {
    const amt = Number(values.amount);
    if (type === "income") {
      treasuryStore.recordIncome(amt);
    } else {
      treasuryStore.recordExpense(amt);
    }
    reset();
    setConfirm(false);
    onAdjusted();
  }, [values, type, reset, onAdjusted]);

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3">
        {type === "income" ? "Record Income" : "Record Expense"}
      </h3>
      <div className="space-y-3">
        <FormField
          label="Amount (GHS)"
          name="amount"
          type="number"
          required
          value={values.amount}
          onChange={handleChange}
          error={touched.amount ? errors.amount : null}
        />
        <FormField
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Optional description"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className={`rounded px-4 py-2 text-sm text-white ${
            type === "income"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {type === "income" ? "Record Income" : "Record Expense"}
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={type === "income" ? "Confirm Income" : "Confirm Expense"}
        message={`Record GHS ${Number(values.amount || 0).toLocaleString()} as ${type}?`}
        confirmLabel="Confirm"
        variant={type === "income" ? "accent" : "danger"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(false)}
      />
    </Card>
  );
}


