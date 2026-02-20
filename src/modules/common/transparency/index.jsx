import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Monthly Transparency Summary (F40)
 * Public-facing monthly summary of organizational finances and performance.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import * as treasuryStore from "../../../shared/services/treasuryStore";
import * as revenueStore from "../../../shared/services/revenueStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as kpiStore from "../../../shared/services/kpiStore";
import * as receiptStore from "../../../shared/services/receiptStore";
import * as assetStore from "../../../shared/services/assetStore";
import * as departmentStore from "../../../shared/services/departmentStore";

export default function TransparencyPage() {
  useDocumentTitle("Transparency");
  const treasury = treasuryStore.getTreasury();
  const totalRevenue = revenueStore.getTotalRevenue();
  const confirmedRevenue = revenueStore.getConfirmedRevenue();
  const budgets = budgetStore.listBudgets();
  const approvals = approvalStore.listApprovals();
  const kpiTasks = kpiStore.listTasks();
  const receipts = receiptStore.listReceipts();
  const departments = departmentStore.listDepartments();

  const totalBudget = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + ((b.monthlyLimit || 0) - (b.remainingLimit || 0)), 0);
  const netPL = confirmedRevenue - totalSpent;
  const approvedCount = approvals.filter((a) => a.currentStage === "APPROVED").length;
  const rejectedCount = approvals.filter((a) => a.currentStage === "REJECTED").length;
  const completedKpis = kpiTasks.filter((t) => t.status === "COMPLETED").length;
  const verifiedReceipts = receipts.filter((r) => r.verificationStatus === "VERIFIED").length;
  const totalAssetValue = Math.round(assetStore.getTotalAssetValue());

  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const deptSpending = budgets.slice(0, 8).map((b) => {
    const dept = departments.find((d) => d.id === b.departmentId);
    return {
      name: (dept?.name || b.departmentId).slice(0, 12),
      spent: (b.monthlyLimit || 0) - (b.remainingLimit || 0),
    };
  });

  return (
    <div>
      <PageSection
        title="Monthly Transparency Report"
        subtitle={`ERA Digital Operating System — ${currentMonth}`}
      >
        <Card>
          <p className="text-sm text-gray-600 leading-relaxed">
            This transparency report provides a comprehensive overview of organizational finances,
            performance metrics, and operational accountability for the current reporting period.
            All figures are based on real-time system data.
          </p>
        </Card>
      </PageSection>

      <PageSection title="Financial Summary">
        <Grid cols={4}>
          <MetricCard label="Treasury Balance" value={`GHS ${treasury.balance.toLocaleString()}`} />
          <MetricCard label="Total Revenue" value={`GHS ${totalRevenue.toLocaleString()}`} />
          <MetricCard label="Total Expenses" value={`GHS ${totalSpent.toLocaleString()}`} />
          <MetricCard label="Net P&L" value={`GHS ${netPL.toLocaleString()}`} />
        </Grid>
      </PageSection>

      <PageSection title="Budget Utilization">
        <Grid cols={2}>
          <Card>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Allocated</span>
                <span className="font-semibold">GHS {totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-semibold">GHS {totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className="font-semibold">GHS {(totalBudget - totalSpent).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[var(--color-accent)] h-2 rounded-full"
                  style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}%` : "0%"} utilized
              </p>
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Department Spending</h3>
            {deptSpending.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptSpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `GHS ${Number(v).toLocaleString()}`} />
                  <Bar dataKey="spent" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No spending data</p>
            )}
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Accountability Metrics">
        <Grid cols={4}>
          <MetricCard label="Approvals Processed" value={approvedCount + rejectedCount} />
          <MetricCard label="Approved" value={approvedCount} />
          <MetricCard label="Rejected" value={rejectedCount} />
          <MetricCard label="Receipts Verified" value={verifiedReceipts} />
        </Grid>
      </PageSection>

      <PageSection title="Performance & Assets">
        <Grid cols={4}>
          <MetricCard label="KPI Tasks" value={kpiTasks.length} />
          <MetricCard label="KPIs Completed" value={completedKpis} />
          <MetricCard label="Total Assets" value={assetStore.listAssets().length} />
          <MetricCard label="Asset Value" value={`GHS ${totalAssetValue.toLocaleString()}`} />
        </Grid>
      </PageSection>

      <PageSection title="Revenue Breakdown">
        <Grid cols={3}>
          {Object.entries(revenueStore.getRevenueByPillarSummary()).map(([pillar, amount]) => (
            <Card key={pillar}>
              <p className="text-xs text-gray-500">{pillar}</p>
              <p className="text-lg font-bold mt-1">GHS {amount.toLocaleString()}</p>
            </Card>
          ))}
          {Object.keys(revenueStore.getRevenueByPillarSummary()).length === 0 && (
            <Card><p className="text-sm text-gray-500">No revenue data recorded.</p></Card>
          )}
        </Grid>
      </PageSection>
    </div>
  );
}


