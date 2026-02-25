/**
 * Budget Deduction UI (F10)
 * Shows department budget status with deductions,
 * freeze controls (admin/finance), and remaining limits.
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import DataTable from "../../../shared/ui/DataTable";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import * as treasuryStore from "../../../shared/services/treasuryStore";
import useRole from "../../../hooks/useRole";

export default function BudgetOverviewPage() {
  const { role } = useRole();
  const [budgets, setBudgets] = useState(() => budgetStore.listBudgets());
  const [treasury, setTreasury] = useState(() => treasuryStore.getTreasury());
  const departments = departmentStore.listDepartments();
  const reload = useCallback(() => {
    setBudgets(budgetStore.listBudgets());
    setTreasury(treasuryStore.getTreasury());
  }, []);

  const totalAllocated = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  const totalRemaining = budgets.reduce((s, b) => s + (b.remainingLimit || 0), 0);
  const totalSpent = totalAllocated - totalRemaining;
  const frozenCount = budgets.filter((b) => b.frozen).length;

  const canFreeze = role === "admin" || role === "finance" || role === "ceo";

  const tableData = budgets.map((b) => {
    const dept = departments.find((d) => d.id === b.departmentId);
    return {
      ...b,
      departmentName: dept?.name || b.departmentId,
      spent: (b.monthlyLimit || 0) - (b.remainingLimit || 0),
      utilization:
        b.monthlyLimit > 0
          ? Math.round(
              (((b.monthlyLimit || 0) - (b.remainingLimit || 0)) /
                b.monthlyLimit) *
                100
            )
          : 0,
    };
  });

  return (
    <div>
      <PageSection
        title="Budget Overview"
        subtitle="Department budget allocations, deductions, and treasury balance"
      >
        <Grid cols={4}>
          <MetricCard label="Treasury Balance" value={`GHS ${treasury.balance.toLocaleString()}`} />
          <MetricCard label="Total Allocated" value={`GHS ${totalAllocated.toLocaleString()}`} />
          <MetricCard label="Total Spent" value={`GHS ${totalSpent.toLocaleString()}`} />
          <MetricCard label="Frozen Depts" value={frozenCount} />
        </Grid>
      </PageSection>

      <PageSection title="Treasury vs Budget" subtitle="Budget is NOT treasury. Budget = departmental allocation limits.">
        <Card>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Treasury Balance</p>
              <p className="text-2xl font-bold">GHS {treasury.balance.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date(treasury.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Budget Remaining</p>
              <p className="text-2xl font-bold">GHS {totalRemaining.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">
                Across {budgets.length} departments
              </p>
            </div>
          </div>
        </Card>
      </PageSection>

      <PageSection title="Department Budgets" subtitle="Per-department allocation and spending">
        <DataTable
          columns={[
            { key: "departmentName", label: "Department" },
            {
              key: "monthlyLimit",
              label: "Monthly Limit",
              render: (v) => `GHS ${Number(v).toLocaleString()}`,
            },
            {
              key: "spent",
              label: "Spent",
              render: (v) => `GHS ${Number(v).toLocaleString()}`,
            },
            {
              key: "remainingLimit",
              label: "Remaining",
              render: (v) => `GHS ${Number(v).toLocaleString()}`,
            },
            {
              key: "utilization",
              label: "Utilization",
              render: (v) => {
                const variant = v >= 90 ? "danger" : v >= 70 ? "warning" : "success";
                return <StatusBadge variant={variant}>{v}%</StatusBadge>;
              },
            },
            {
              key: "frozen",
              label: "Status",
              render: (v) =>
                v ? (
                  <StatusBadge variant="danger">Frozen</StatusBadge>
                ) : (
                  <StatusBadge variant="success">Active</StatusBadge>
                ),
            },
            ...(canFreeze
              ? [
                  {
                    key: "departmentId",
                    label: "Action",
                    sortable: false,
                    render: (_, row) => (
                      <FreezeToggle
                        departmentId={row.departmentId}
                        frozen={row.frozen}
                        onToggled={reload}
                      />
                    ),
                  },
                ]
              : []),
          ]}
          data={tableData}
          pageSize={12}
          emptyText="No budget data found."
        />
      </PageSection>
    </div>
  );
}

function FreezeToggle({ departmentId, frozen, onToggled }) {
  const [confirm, setConfirm] = useState(false);

  const handleToggle = useCallback(() => {
    if (frozen) {
      budgetStore.unfreezeDepartment(departmentId);
    } else {
      budgetStore.freezeDepartment(departmentId);
    }
    setConfirm(false);
    onToggled();
  }, [departmentId, frozen, onToggled]);

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className={`rounded px-2 py-0.5 text-xs text-white ${
          frozen
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {frozen ? "Unfreeze" : "Freeze"}
      </button>
      <ConfirmDialog
        open={confirm}
        title={frozen ? "Unfreeze Department" : "Freeze Department"}
        message={
          frozen
            ? "Unfreeze this department? They will be able to submit fund requests again."
            : "Freeze this department? All fund requests will be blocked."
        }
        confirmLabel={frozen ? "Unfreeze" : "Freeze"}
        variant={frozen ? "accent" : "danger"}
        onConfirm={handleToggle}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
