import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * P&L Dashboard (F13)
 * Profit & Loss overview with Recharts visualizations.
 * Revenue vs Expenses, category breakdown, monthly trends.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import * as revenueStore from "../../../shared/services/revenueStore";
import * as treasuryStore from "../../../shared/services/treasuryStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import { getSupervisorLabel } from "../../../utils/supervisor";

const CHART_COLORS = [
  "var(--color-accent, #2563EB)",
  "var(--color-success, #16A34A)",
  "var(--color-warning, #D97706)",
  "var(--color-danger, #DC2626)",
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#EC4899",
];

export default function ProfitLossPage() {
  useDocumentTitle("Profit and Loss");
  const revenue = revenueStore.listRevenue();
  const treasury = treasuryStore.getTreasury();
  const budgets = budgetStore.listBudgets();
  const approvals = approvalStore.listApprovals();

  const confirmedRevenue = revenueStore.getConfirmedRevenue();
  const totalBudgetAllocated = budgets.reduce(
    (s, b) => s + (b.monthlyLimit || 0),
    0
  );
  const totalSpent = budgets.reduce(
    (s, b) => s + ((b.monthlyLimit || 0) - (b.remainingLimit || 0)),
    0
  );
  const approvedExpenses = approvals
    .filter((a) => a.currentStage === "APPROVED")
    .reduce((s, a) => s + (a.amount || 0), 0);

  const netPL = confirmedRevenue - totalSpent;

  const supervisorSummary = revenueStore.getRevenueBySupervisorSummary();
  const supervisorData = Object.entries(supervisorSummary).map(([supervisor, amount]) => ({
    name: getSupervisorLabel(supervisor),
    revenue: amount,
  }));

  // Revenue by category for pie chart
  const categoryData = (() => {
    const cats = {};
    revenue.forEach((r) => {
      const cat = r.profitCategory || "Uncategorized";
      cats[cat] = (cats[cat] || 0) + (r.amount || 0);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  })();

  // Revenue vs Expenses summary
  const summaryData = [
    { name: "Revenue", amount: confirmedRevenue },
    { name: "Expenses", amount: totalSpent },
    { name: "Net P&L", amount: netPL },
  ];

  return (
    <div>
      <PageSection
        title="Profit & Loss"
        subtitle="Revenue, expenses, and net financial position"
      >
        <Grid cols={4}>
          <MetricCard
            label="Confirmed Revenue"
            value={`GHS ${confirmedRevenue.toLocaleString()}`}
          />
          <MetricCard
            label="Total Expenses"
            value={`GHS ${totalSpent.toLocaleString()}`}
          />
          <MetricCard
            label="Net P&L"
            value={`GHS ${netPL.toLocaleString()}`}
          />
          <MetricCard
            label="Treasury"
            value={`GHS ${treasury.balance.toLocaleString()}`}
          />
        </Grid>
      </PageSection>

      <PageSection title="Revenue vs Expenses">
        <Card>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => `GHS ${Number(value).toLocaleString()}`}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {summaryData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </PageSection>

      <PageSection title="Financial Breakdown">
        <Grid cols={2}>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Revenue by Supervisor</h3>
            {supervisorData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={supervisorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `GHS ${Number(value).toLocaleString()}`
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-accent, #2563EB)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No revenue data</p>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-3">
              Revenue by Category
            </h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `GHS ${Number(value).toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No revenue data</p>
            )}
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Financial Health Indicators">
        <Grid cols={3}>
          <Card>
            <p className="text-xs text-gray-500">Profit Margin</p>
            <p className="text-xl font-bold mt-1">
              {confirmedRevenue > 0
                ? `${((netPL / confirmedRevenue) * 100).toFixed(1)}%`
                : "—"}
            </p>
            <div className="mt-1">
              <StatusBadge
                variant={
                  netPL > 0 ? "success" : netPL === 0 ? "warning" : "danger"
                }
              >
                {netPL > 0 ? "Profitable" : netPL === 0 ? "Break Even" : "Loss"}
              </StatusBadge>
            </div>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Budget Utilization</p>
            <p className="text-xl font-bold mt-1">
              {totalBudgetAllocated > 0
                ? `${((totalSpent / totalBudgetAllocated) * 100).toFixed(1)}%`
                : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              GHS {totalSpent.toLocaleString()} of GHS{" "}
              {totalBudgetAllocated.toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Approved Expenses</p>
            <p className="text-xl font-bold mt-1">
              GHS {approvedExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pipeline committed spending
            </p>
          </Card>
        </Grid>
      </PageSection>
    </div>
  );
}


