import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Department Head Dashboard (F6)
 * Review subordinate requests, recommend approvals to FO,
 * view team KPIs and performance.
 */
import { useMemo, useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import TrustBadge from "../../../components/ui/TrustBadge";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import DataTable from "../../../shared/ui/DataTable";
import * as userStore from "../../../shared/services/userStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as kpiStore from "../../../shared/services/kpiStore";
import * as notificationStore from "../../../shared/services/notificationStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import { isTerminal } from "../../../governance/approvalStages";
import useRole from "../../../hooks/useRole";

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

export default function DeptHeadDashboard() {
  useDocumentTitle("Department Head Dashboard");
  const { role } = useRole();
  const currentUser = resolveUser(role);
  const dept = currentUser
    ? departmentStore.getDepartmentById(currentUser.departmentId)
    : null;

  const subordinates = useMemo(() => {
    if (!currentUser?.departmentId) return [];
    return userStore
      .listUsers()
      .filter(
        (u) =>
          u.departmentId === currentUser.departmentId &&
          u.id !== currentUser.id
      );
  }, [currentUser]);

  const subordinateRequests = useMemo(() => {
    const subIds = new Set(subordinates.map((s) => s.id));
    return approvalStore
      .listApprovals()
      .filter((a) => subIds.has(a.requestedByUserId));
  }, [subordinates]);

  const subordinateKpis = useMemo(() => {
    const subIds = new Set(subordinates.map((s) => s.id));
    return kpiStore.listTasks().filter((t) => subIds.has(t.assignedToUserId));
  }, [subordinates]);

  const pendingCount = subordinateRequests.filter(
    (r) => !isTerminal(r.currentStage)
  ).length;

  return (
    <div>
      <PageSection
        title="Department Overview"
        subtitle={
          dept
            ? `${dept.name} department management`
            : "Department Head dashboard"
        }
      >
        <Grid cols={4}>
          <MetricCard label="Team Members" value={subordinates.length} />
          <MetricCard label="Pending Requests" value={pendingCount} />
          <MetricCard
            label="Active KPIs"
            value={
              subordinateKpis.filter((k) => k.status === "ASSIGNED").length
            }
          />
          <MetricCard label="Department" value={dept?.name || "—"} />
        </Grid>
      </PageSection>

      <PageSection
        title="Team Members"
        subtitle="Subordinate performance overview"
      >
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "roleKey", label: "Role" },
            {
              key: "id",
              label: "Trust Level",
              sortable: false,
              render: (_, row) => (
                <TrustBadge userId={row.id} showPercentage />
              ),
            },
          ]}
          data={subordinates}
          pageSize={10}
          emptyText="No team members found."
        />
      </PageSection>

      <PageSection
        title="Subordinate Requests"
        subtitle="Review and recommend requests to Finance Officer"
      >
        <Grid cols={1}>
          {subordinateRequests.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-500">
                No subordinate requests found.
              </p>
            </Card>
          ) : (
            subordinateRequests.map((req) => (
              <SubordinateRequestCard
                key={req.id}
                request={req}
                currentUser={currentUser}
              />
            ))
          )}
        </Grid>
      </PageSection>

      <PageSection
        title="Subordinate KPIs"
        subtitle="Active KPI tasks assigned to team members"
      >
        <DataTable
          columns={[
            { key: "title", label: "Task" },
            {
              key: "assignedToUserId",
              label: "Assigned To",
              render: (v) => {
                const u = userStore.getUserById(v);
                return u?.name || v;
              },
            },
            { key: "status", label: "Status" },
            { key: "deadline", label: "Deadline" },
            { key: "impactCategory", label: "Impact" },
          ]}
          data={subordinateKpis}
          pageSize={10}
          emptyText="No KPI tasks found."
        />
      </PageSection>
    </div>
  );
}

function SubordinateRequestCard({ request, currentUser }) {
  const [confirmRecommend, setConfirmRecommend] = useState(false);
  const [busy, setBusy] = useState(false);
  const requester = userStore.getUserById(request.requestedByUserId);

  const handleRecommend = useCallback(() => {
    setBusy(true);
    approvalStore.updateApprovalStage(request.id, {
      nextStage: request.currentStage,
      action: "RECOMMENDED_BY_DEPT_HEAD",
      userId: currentUser?.id,
      note: `Recommended by Department Head ${currentUser?.name || ""}`,
    });
    const foUser = resolveUser("finance");
    if (foUser) {
      notificationStore.createNotification({
        toUserId: foUser.id,
        type: "RECOMMENDATION",
        message: `Dept Head recommends "${request.title}" (GHS ${request.amount?.toLocaleString()}) for approval.`,
      });
    }
    setBusy(false);
    setConfirmRecommend(false);
  }, [request, currentUser]);

  const isPending = !isTerminal(request.currentStage);

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">{request.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {request.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              By: {requester?.name || "Unknown"} &middot; GHS{" "}
              {Number(request.amount || 0).toLocaleString()} &middot;{" "}
              {request.currentStage}
            </p>
            {requester && (
              <div className="mt-1">
                <TrustBadge userId={requester.id} />
              </div>
            )}
          </div>
          {isPending && (
            <button
              onClick={() => setConfirmRecommend(true)}
              disabled={busy}
              className="rounded bg-[var(--color-accent)] px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
            >
              Recommend to FO
            </button>
          )}
        </div>
      </Card>
      <ConfirmDialog
        open={confirmRecommend}
        title="Recommend Approval"
        message={`Recommend "${request.title}" to Finance Officer for approval?`}
        confirmLabel="Recommend"
        variant="accent"
        onConfirm={handleRecommend}
        onCancel={() => setConfirmRecommend(false)}
        busy={busy}
      />
    </>
  );
}


