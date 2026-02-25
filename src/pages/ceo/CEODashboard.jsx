/**
 * CEO Dashboard (F27)
 * Strategic overview with treasury, revenue, approvals, KPI, risk indicators.
 */
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import PageSection from "../../components/layout/PageSection";
import Card from "../../components/ui/Card";
import Grid from "../../components/layout/Grid";
import MetricCard from "../../components/ui/MetricCard";
import StatusBadge from "../../shared/ui/StatusBadge";
import * as treasuryStore from "../../shared/services/treasuryStore";
import * as revenueStore from "../../shared/services/revenueStore";
import * as budgetStore from "../../shared/services/budgetStore";
import * as approvalStore from "../../shared/services/approvalStore";
import * as kpiStore from "../../shared/services/kpiStore";
import * as departmentStore from "../../shared/services/departmentStore";
import * as userStore from "../../shared/services/userStore";
import { getUserKpiPercentage } from "../../shared/services/trustLevelStore";

const COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#8B5CF6", "#06B6D4"];

export default function CEODashboard() {
  const treasury = useMemo(() => treasuryStore.getTreasury(), []);
  const totalRevenue = revenueStore.getTotalRevenue();
  const confirmedRevenue = revenueStore.getConfirmedRevenue();
  const budgets = useMemo(() => budgetStore.listBudgets(), []);
  const approvals = useMemo(() => approvalStore.listApprovals(), []);
  const kpiTasks = useMemo(() => kpiStore.listTasks(), []);
  const departments = useMemo(() => departmentStore.listDepartments(), []);

  const totalBudget = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + ((b.monthlyLimit || 0) - (b.remainingLimit || 0)), 0);
  const pendingApprovals = approvals.filter((a) => !["APPROVED", "REJECTED"].includes(a.currentStage)).length;
  const completedKpis = kpiTasks.filter((t) => t.status === "COMPLETED").length;
  const netPL = confirmedRevenue - totalSpent;

  const pillarSummary = revenueStore.getRevenueByPillarSummary();
  const pillarData = Object.entries(pillarSummary).map(([name, revenue]) => ({ name, revenue }));

  const deptPerf = departments.slice(0, 6).map((d) => {
    const users = userStore.listUsers().filter((u) => u.departmentId === d.id);
    const avgKpi = users.length > 0
      ? Math.round(users.reduce((s, u) => s + getUserKpiPercentage(u.id), 0) / users.length)
      : 0;
    return { name: d.name.slice(0, 12), kpi: avgKpi };
  });

  const approvalBreakdown = [
    { name: "Approved", value: approvals.filter((a) => a.currentStage === "APPROVED").length },
    { name: "Pending", value: pendingApprovals },
    { name: "Rejected", value: approvals.filter((a) => a.currentStage === "REJECTED").length },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <PageSection title="CEO Dashboard" subtitle="Strategic organizational overview">
        <Grid cols={4}>
          <MetricCard label="Treasury" value={`GHS ${treasury.balance.toLocaleString()}`} />
          <MetricCard label="Revenue" value={`GHS ${confirmedRevenue.toLocaleString()}`} />
          <MetricCard label="Net P&L" value={`GHS ${netPL.toLocaleString()}`} />
          <MetricCard label="Pending Approvals" value={pendingApprovals} />
        </Grid>
      </PageSection>

      <PageSection title="Financial Overview">
        <Grid cols={2}>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Revenue by Pillar</h3>
            {pillarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pillarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `GHS ${Number(v).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No revenue data</p>
            )}
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Approval Pipeline</h3>
            {approvalBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={approvalBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {approvalBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No approval data</p>
            )}
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Department KPI Performance">
        <Card>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="kpi" name="KPI Avg %" fill="#16A34A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </PageSection>

      <PageSection title="Key Indicators">
        <Grid cols={4}>
          <MetricCard label="Budget Allocated" value={`GHS ${totalBudget.toLocaleString()}`} />
          <MetricCard label="Budget Spent" value={`GHS ${totalSpent.toLocaleString()}`} />
          <MetricCard label="KPI Tasks" value={kpiTasks.length} />
          <MetricCard label="KPI Completed" value={completedKpis} />
        </Grid>
      </PageSection>
    </div>
  );
}
