import useDocumentTitle from "../../hooks/useDocumentTitle";
/**
 * Finance Dashboard (F28)
 * Financial overview: treasury, budgets, revenue, approvals pipeline.
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
import * as receiptStore from "../../shared/services/receiptStore";
import * as departmentStore from "../../shared/services/departmentStore";
import * as financialTransactionStore from "../../shared/services/financialTransactionStore";
import { formatTokenLabel } from "../../utils/formatLabel";

const COLORS = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#8B5CF6"];

export default function FinanceDashboard() {
  useDocumentTitle("Finance Dashboard");
  const treasury = useMemo(() => treasuryStore.getTreasury(), []);
  const budgets = useMemo(() => budgetStore.listBudgets(), []);
  const approvals = useMemo(() => approvalStore.listApprovals(), []);
  const receipts = useMemo(() => receiptStore.listReceipts(), []);
  const departments = useMemo(() => departmentStore.listDepartments(), []);
  const ceoExpenses = useMemo(() => financialTransactionStore.listTransactionsByType("CEO_EXPENSE"), []);

  const totalRevenue = revenueStore.getTotalRevenue();
  const confirmedRevenue = revenueStore.getConfirmedRevenue();
  const totalBudget = budgets.reduce((s, b) => s + (b.monthlyLimit || 0), 0);
  const ceoExpenseTotal = ceoExpenses.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + ((b.monthlyLimit || 0) - (b.remainingLimit || 0)), 0) + ceoExpenseTotal;
  const pendingReceipts = receipts.filter((r) => r.verificationStatus === "AWAITING_RECEIPT").length;
  const foQueue = approvals.filter((a) => a.currentStage === "PENDING_FO").length;

  const deptBudgets = budgets.slice(0, 6).map((b) => {
    const dept = departments.find((d) => d.id === b.departmentId);
    return {
      name: (dept?.name || b.departmentId).slice(0, 12),
      allocated: b.monthlyLimit,
      spent: (b.monthlyLimit || 0) - (b.remainingLimit || 0),
    };
  });

  const receiptBreakdown = [
    { name: "Awaiting", value: receipts.filter((r) => r.verificationStatus === "AWAITING_RECEIPT").length },
    { name: "Uploaded", value: receipts.filter((r) => r.verificationStatus === "UPLOADED").length },
    { name: "Verified", value: receipts.filter((r) => r.verificationStatus === "VERIFIED").length },
    { name: "Issues", value: receipts.filter((r) => ["DISCREPANCY", "ESCALATED"].includes(r.verificationStatus)).length },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <PageSection title="Finance Dashboard" subtitle="Financial operations overview">
        <Grid cols={4}>
          <MetricCard label="Treasury Balance" value={`GHS ${treasury.balance.toLocaleString()}`} />
          <MetricCard label="Revenue (Confirmed)" value={`GHS ${confirmedRevenue.toLocaleString()}`} />
          <MetricCard label="FO Queue" value={foQueue} />
          <MetricCard label="Pending Receipts" value={pendingReceipts} />
        </Grid>
      </PageSection>

      <PageSection title="Budget Utilization">
        <Grid cols={2}>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Department Budgets</h3>
            {deptBudgets.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptBudgets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => `GHS ${Number(v).toLocaleString()}`} />
                  <Bar dataKey="allocated" name="Allocated" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No budget data</p>
            )}
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-3">Receipt Status</h3>
            {receiptBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={receiptBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {receiptBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">No receipt data</p>
            )}
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Expense Records" subtitle="Direct CEO expenses posted to finance.">
        <Grid cols={1}>
          {ceoExpenses.length > 0 ? ceoExpenses.slice(0, 5).map((expense) => (
            <Card key={expense.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">{expense.purpose}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {expense.program} | {expense.vendor} | {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">GHS {Number(expense.amount || 0).toLocaleString()}</p>
                  <StatusBadge variant="info">{formatTokenLabel(expense.status)}</StatusBadge>
                </div>
              </div>
            </Card>
          )) : <Card><p className="text-sm text-gray-500">No CEO expense records yet.</p></Card>}
        </Grid>
      </PageSection>

      <PageSection title="Financial Health">
        <Grid cols={4}>
          <MetricCard label="Total Budget" value={`GHS ${totalBudget.toLocaleString()}`} />
          <MetricCard label="Total Spent" value={`GHS ${totalSpent.toLocaleString()}`} />
          <MetricCard label="CEO Direct Expenses" value={`GHS ${ceoExpenseTotal.toLocaleString()}`} />
          <MetricCard label="Outstanding Revenue" value={`GHS ${(totalRevenue - confirmedRevenue).toLocaleString()}`} />
          <MetricCard label="Frozen Depts" value={budgets.filter((b) => b.frozen).length} />
        </Grid>
      </PageSection>
    </div>
  );
}


