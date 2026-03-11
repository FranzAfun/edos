import { useCallback, useState } from "react";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import DataTable from "../../../shared/ui/DataTable";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import useRole from "../../../hooks/useRole";
import * as userStore from "../../../shared/services/userStore";
import useModuleQuery from "../../../shared/hooks/useModuleQuery";
import { getCeoExpenses, logCeoExpense } from "./services/expenseLogService";

const RULES = {
  purpose: (value) => (!value?.trim() ? "Purpose is required" : null),
  program: (value) => (!value?.trim() ? "Program is required" : null),
  vendor: (value) => (!value?.trim() ? "Vendor is required" : null),
  amount: (value) => (!value || Number(value) <= 0 ? "Amount must be greater than 0" : null),
};

function resolveUserId(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0].id : null;
}

export default function CEOExpenseLogPage() {
  useDocumentTitle("CEO Expense Log");
  const { role } = useRole();
  const currentUserId = resolveUserId(role);
  const expensesQuery = useModuleQuery(getCeoExpenses);
  const [saving, setSaving] = useState(false);

  const { values, errors, touched, handleChange, validate, reset } = useFormValidation(
    {
      purpose: "",
      program: "",
      vendor: "",
      amount: "",
      receipt: "",
      notes: "",
    },
    RULES
  );

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const response = await logCeoExpense({
      ...values,
      amount: Number(values.amount),
      createdByUserId: currentUserId,
    });
    setSaving(false);

    if (!response?.success) {
      return;
    }

    reset();
    expensesQuery.reload();
  }, [currentUserId, expensesQuery, reset, validate, values]);

  const expenses = expensesQuery.data || [];
  const totalRecorded = expenses.reduce((sum, entry) => sum + (entry.amount || 0), 0);

  return (
    <div>
      <PageSection title="CEO Expense Log" subtitle="Record direct CEO expenses outside the approval pipeline.">
        <Grid cols={3}>
          <MetricCard label="Recorded Expenses" value={expenses.length} />
          <MetricCard label="Total Value" value={`GHS ${totalRecorded.toLocaleString()}`} />
          <MetricCard label="Status" value="RECORDED" />
        </Grid>
      </PageSection>

      <PageSection title="Log Expense" subtitle="These entries bypass approvals and are recorded directly for finance.">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Grid cols={2}>
              <FormField
                label="Purpose"
                name="purpose"
                value={values.purpose}
                onChange={handleChange}
                error={touched.purpose ? errors.purpose : null}
                required
              />
              <FormField
                label="Program"
                name="program"
                value={values.program}
                onChange={handleChange}
                error={touched.program ? errors.program : null}
                required
              />
            </Grid>
            <Grid cols={2}>
              <FormField
                label="Vendor"
                name="vendor"
                value={values.vendor}
                onChange={handleChange}
                error={touched.vendor ? errors.vendor : null}
                required
              />
              <FormField
                label="Amount"
                name="amount"
                type="number"
                value={values.amount}
                onChange={handleChange}
                error={touched.amount ? errors.amount : null}
                required
              />
            </Grid>
            <Grid cols={2}>
              <FormField
                label="Receipt"
                name="receipt"
                value={values.receipt}
                onChange={handleChange}
                placeholder="File upload later"
              />
              <FormField
                label="Notes"
                name="notes"
                value={values.notes}
                onChange={handleChange}
                placeholder="Optional notes"
              />
            </Grid>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Recording..." : "Record Expense"}
            </button>
          </form>
        </Card>
      </PageSection>

      <PageSection title="Recorded Expenses" subtitle="Direct CEO expenses already posted to finance.">
        <DataTable
          columns={[
            { key: "purpose", label: "Purpose" },
            { key: "program", label: "Program" },
            { key: "vendor", label: "Vendor" },
            { key: "amount", label: "Amount", render: (value) => `GHS ${Number(value || 0).toLocaleString()}` },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Recorded", render: (value) => new Date(value).toLocaleString() },
          ]}
          data={expenses}
          pageSize={10}
          emptyText="No CEO expenses recorded."
        />
      </PageSection>
    </div>
  );
}