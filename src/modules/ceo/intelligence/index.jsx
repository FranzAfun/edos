import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * CEO AI Intelligence Dashboard (F16-F19)
 * F16: AI-generated recommendations (mock)
 * F17: Revenue forecasting with Recharts
 * F18: Performance intelligence board
 * F19: Risk & anomaly detection (mock AI)
 */
import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import DataTable from "../../../shared/ui/DataTable";
import * as revenueStore from "../../../shared/services/revenueStore";
import * as treasuryStore from "../../../shared/services/treasuryStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as kpiStore from "../../../shared/services/kpiStore";
import * as userStore from "../../../shared/services/userStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import { isTerminal } from "../../../governance/approvalStages";
import { getUserKpiPercentage } from "../../../shared/services/trustLevelStore";

const CHART_COLORS = {
  primary: "var(--color-accent, #2563EB)",
  success: "var(--color-success, #16A34A)",
  warning: "var(--color-warning, #D97706)",
  danger: "var(--color-danger, #DC2626)",
};

/**
 * Generate mock forecast data based on actual revenue
 */
function generateForecastData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenue = revenueStore.listRevenue();
  const baseMonthly = revenueStore.getTotalRevenue() / Math.max(revenue.length, 1) * 3;

  return months.map((month, i) => {
    const actual = i < 6 ? Math.round(baseMonthly * (0.8 + Math.random() * 0.4)) : null;
    const forecast = Math.round(baseMonthly * (1 + i * 0.03) * (0.9 + Math.random() * 0.2));
    return { month, actual, forecast };
  });
}

/**
 * Generate mock AI recommendations
 */
function generateRecommendations() {
  const budgets = budgetStore.listBudgets();
  const recs = [];

  const overSpent = budgets.filter(
    (b) => b.remainingLimit < b.monthlyLimit * 0.2 && !b.frozen
  );
  if (overSpent.length > 0) {
    recs.push({
      id: "rec-1",
      category: "Budget",
      severity: "warning",
      title: "High Budget Utilization Detected",
      description: `${overSpent.length} department(s) have used over 80% of their budget. Consider reviewing spending patterns.`,
      action: "Review department budgets and consider reallocation.",
    });
  }

  const treasury = treasuryStore.getTreasury();
  const totalBudget = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  if (treasury.balance < totalBudget * 0.5) {
    recs.push({
      id: "rec-2",
      category: "Treasury",
      severity: "danger",
      title: "Treasury Below 50% of Budget Allocation",
      description: `Treasury balance (GHS ${treasury.balance.toLocaleString()}) is below 50% of total budget allocation (GHS ${totalBudget.toLocaleString()}).`,
      action: "Prioritize revenue collection and consider budget adjustments.",
    });
  }

  const lowKpiUsers = userStore.listUsers().filter((u) => {
    const pct = getUserKpiPercentage(u.id);
    return pct > 0 && pct < 50;
  });
  if (lowKpiUsers.length > 0) {
    recs.push({
      id: "rec-3",
      category: "Performance",
      severity: "warning",
      title: "Low KPI Performance Users",
      description: `${lowKpiUsers.length} user(s) have KPI scores below 50%. This may affect trust levels and approval routing.`,
      action: "Schedule performance reviews and provide support.",
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "rec-default",
      category: "General",
      severity: "info",
      title: "Operations Running Smoothly",
      description: "No critical issues detected. All systems operating within normal parameters.",
      action: "Continue monitoring key metrics.",
    });
  }

  return recs;
}

/**
 * Generate risk/anomaly data
 */
function generateRiskData() {
  const approvals = approvalStore.listApprovals();
  const risks = [];

  const highValueApprovals = approvals.filter(
    (a) => a.amount > 3000 && !isTerminal(a.currentStage)
  );
  if (highValueApprovals.length > 0) {
    risks.push({
      id: "risk-1",
      type: "High Value",
      severity: "warning",
      description: `${highValueApprovals.length} pending approval(s) exceed GHS 3,000 threshold.`,
      metric: `GHS ${highValueApprovals.reduce((s, a) => s + a.amount, 0).toLocaleString()}`,
    });
  }

  const frozenDepts = budgetStore.listBudgets().filter((b) => b.frozen);
  if (frozenDepts.length > 0) {
    risks.push({
      id: "risk-2",
      type: "Operational",
      severity: "danger",
      description: `${frozenDepts.length} department(s) currently frozen — operations may be impacted.`,
      metric: `${frozenDepts.length} frozen`,
    });
  }

  return risks;
}

export default function CEOIntelligencePage() {
  useDocumentTitle("CEO Intelligence");
  const forecastData = useMemo(() => generateForecastData(), []);
  const recommendations = useMemo(() => generateRecommendations(), []);
  const riskData = useMemo(() => generateRiskData(), []);

  const treasury = treasuryStore.getTreasury();
  const totalRevenue = revenueStore.getTotalRevenue();
  const kpiTasks = kpiStore.listTasks();
  const completedTasks = kpiTasks.filter((t) => t.status === "COMPLETED").length;

  // Dept performance
  const departments = departmentStore.listDepartments();
  const deptPerformance = departments.map((d) => {
    const budget = budgetStore.getBudgetByDepartment(d.id);
    const users = userStore.listUsers().filter((u) => u.departmentId === d.id);
    const avgKpi =
      users.length > 0
        ? Math.round(
            users.reduce((s, u) => s + getUserKpiPercentage(u.id), 0) / users.length
          )
        : 0;
    return {
      department: d.name,
      budget: budget?.monthlyLimit || 0,
      spent: (budget?.monthlyLimit || 0) - (budget?.remainingLimit || 0),
      kpiAvg: avgKpi,
      headcount: users.length,
      frozen: budget?.frozen || false,
    };
  });

  return (
    <div>
      {/* F16: AI Recommendations */}
      <PageSection title="AI Recommendations" subtitle="System-generated strategic insights">
        <Grid cols={4}>
          <MetricCard label="Treasury" value={`GHS ${treasury.balance.toLocaleString()}`} />
          <MetricCard label="Total Revenue" value={`GHS ${totalRevenue.toLocaleString()}`} />
          <MetricCard label="KPI Completion" value={`${kpiTasks.length > 0 ? Math.round((completedTasks / kpiTasks.length) * 100) : 0}%`} />
          <MetricCard label="Recommendations" value={recommendations.length} />
        </Grid>
        <div className="mt-4">
          <Grid cols={1}>
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <div className="flex items-start gap-3">
                  <StatusBadge
                    variant={
                      rec.severity === "danger"
                        ? "danger"
                        : rec.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    {rec.category}
                  </StatusBadge>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{rec.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended action: {rec.action}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </div>
      </PageSection>

      {/* F17: Revenue Forecasting */}
      <PageSection title="Revenue Forecast" subtitle="Projected revenue trends (AI-generated)">
        <Card>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => v != null ? `GHS ${Number(v).toLocaleString()}` : "—"} />
              <Legend />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.1}
                name="Actual"
                connectNulls={false}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke={CHART_COLORS.success}
                fill={CHART_COLORS.success}
                fillOpacity={0.1}
                strokeDasharray="5 5"
                name="Forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </PageSection>

      {/* F18: Performance Intelligence Board */}
      <PageSection title="Department Performance" subtitle="Cross-department performance comparison">
        <Card>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="kpiAvg" name="KPI Avg %" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: "department", label: "Department" },
              { key: "headcount", label: "Staff" },
              { key: "kpiAvg", label: "KPI Avg", render: (v) => `${v}%` },
              { key: "budget", label: "Budget", render: (v) => `GHS ${v.toLocaleString()}` },
              { key: "spent", label: "Spent", render: (v) => `GHS ${v.toLocaleString()}` },
              {
                key: "frozen",
                label: "Status",
                render: (v) =>
                  v ? <StatusBadge variant="danger">Frozen</StatusBadge> : <StatusBadge variant="success">Active</StatusBadge>,
              },
            ]}
            data={deptPerformance}
            pageSize={12}
            emptyText="No department data."
          />
        </div>
      </PageSection>

      {/* F19: Risk & Anomaly Detection */}
      <PageSection title="Risk & Anomaly Detection" subtitle="AI-detected risks and anomalies">
        <Grid cols={1}>
          {riskData.length > 0 ? (
            riskData.map((risk) => (
              <Card key={risk.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge
                        variant={risk.severity === "danger" ? "danger" : "warning"}
                      >
                        {risk.type}
                      </StatusBadge>
                    </div>
                    <p className="text-sm">{risk.description}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{risk.metric}</span>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-sm text-gray-500">No risks or anomalies detected.</p>
            </Card>
          )}
        </Grid>
      </PageSection>
    </div>
  );
}


