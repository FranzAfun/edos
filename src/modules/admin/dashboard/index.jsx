import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Admin Dashboard (F32)
 * System administration overview: users, departments, budgets, compliance.
 */
import { useMemo } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import * as userStore from "../../../shared/services/userStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as complianceStore from "../../../shared/services/complianceStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as auditStore from "../../../shared/services/auditStore";

export default function AdminDashboard() {
  useDocumentTitle("Admin Dashboard");
  const users = useMemo(() => userStore.listUsers(), []);
  const departments = useMemo(() => departmentStore.listDepartments(), []);
  const budgets = useMemo(() => budgetStore.listBudgets(), []);
  const compliance = useMemo(() => complianceStore.listCompliance(), []);
  const auditLog = useMemo(() => auditStore.listAuditLog(), []);
  const approvals = useMemo(() => approvalStore.listApprovals(), []);

  const blockedUsers = compliance.filter((c) => c.isFundingBlocked).length;
  const frozenDepts = budgets.filter((b) => b.frozen).length;

  const roleBreakdown = {};
  users.forEach((u) => {
    roleBreakdown[u.roleKey] = (roleBreakdown[u.roleKey] || 0) + 1;
  });

  return (
    <div>
      <PageSection title="Admin Dashboard" subtitle="System administration overview">
        <Grid cols={4}>
          <MetricCard label="Total Users" value={users.length} />
          <MetricCard label="Departments" value={departments.length} />
          <MetricCard label="Blocked Users" value={blockedUsers} />
          <MetricCard label="Frozen Depts" value={frozenDepts} />
        </Grid>
      </PageSection>

      <PageSection title="User Distribution">
        <Grid cols={3}>
          {Object.entries(roleBreakdown).map(([role, count]) => (
            <Card key={role}>
              <p className="text-xs text-gray-500 capitalize">{role.replace("_", " ")}</p>
              <p className="text-lg font-bold mt-1">{count}</p>
            </Card>
          ))}
        </Grid>
      </PageSection>

      <PageSection title="System Health">
        <Grid cols={2}>
          <Card>
            <h3 className="text-sm font-semibold mb-2">Compliance Issues</h3>
            {blockedUsers > 0 ? (
              <div className="space-y-2">
                {compliance
                  .filter((c) => c.isFundingBlocked)
                  .map((c) => {
                    const user = userStore.getUserById(c.userId);
                    return (
                      <div key={c.userId} className="flex items-center justify-between">
                        <span className="text-xs">{user?.name || c.userId}</span>
                        <StatusBadge variant="danger">Blocked</StatusBadge>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No compliance issues.</p>
            )}
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-2">Recent Audit Activity</h3>
            {auditLog.length > 0 ? (
              <div className="space-y-2">
                {auditLog.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="text-xs text-gray-500">
                    <span className="font-medium">{entry.action}</span> on{" "}
                    {entry.entityType} &middot;{" "}
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No audit log entries.</p>
            )}
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Approval Pipeline">
        <Grid cols={3}>
          <MetricCard
            label="Total Approvals"
            value={approvals.length}
          />
          <MetricCard
            label="Pending"
            value={approvals.filter((a) => !["APPROVED", "REJECTED"].includes(a.currentStage)).length}
          />
          <MetricCard
            label="Approved"
            value={approvals.filter((a) => a.currentStage === "APPROVED").length}
          />
        </Grid>
      </PageSection>
    </div>
  );
}


