import useDocumentTitle from "../../hooks/useDocumentTitle";
/**
 * Executive Dashboard (F29)
 * Executive overview: fund requests, KPIs, compliance, trust level.
 */
import { useMemo } from "react";
import PageSection from "../../components/layout/PageSection";
import Card from "../../components/ui/Card";
import Grid from "../../components/layout/Grid";
import MetricCard from "../../components/ui/MetricCard";
import TrustBadge from "../../components/ui/TrustBadge";
import StatusBadge from "../../shared/ui/StatusBadge";
import * as fundRequestStore from "../../shared/services/fundRequestStore";
import * as kpiStore from "../../shared/services/kpiStore";
import * as complianceStore from "../../shared/services/complianceStore";
import * as userStore from "../../shared/services/userStore";
import useRole from "../../hooks/useRole";

const REJECTED_REQUEST_STATUSES = new Set(["REJECTED", "REJECTED_COMPLIANCE"]);

function isRejectedRequest(status) {
  return REJECTED_REQUEST_STATUSES.has(status);
}

function formatRequestStatus(status) {
  return status ? status.replaceAll("_", " ") : "UNKNOWN";
}

export default function ExecutiveDashboard() {
  useDocumentTitle("Executive Dashboard");
  const { role } = useRole();
  const currentUser = useMemo(() => {
    const users = userStore.getUsersByRole(role);
    return users.length > 0 ? users[0] : null;
  }, [role]);

  const myRequests = useMemo(
    () => (currentUser ? fundRequestStore.getFundRequestsByUser(currentUser.id) : []),
    [currentUser]
  );
  const myKpis = useMemo(
    () => (currentUser ? kpiStore.listTasks().filter((t) => t.assignedToUserId === currentUser.id) : []),
    [currentUser]
  );
  const compliance = useMemo(
    () => (currentUser ? complianceStore.getCompliance(currentUser.id) : null),
    [currentUser]
  );

  const pendingRequests = myRequests.filter(
    (r) => r.status !== "APPROVED" && !isRejectedRequest(r.status)
  ).length;
  const approvedRequests = myRequests.filter((r) => r.status === "APPROVED").length;
  const activeKpis = myKpis.filter((k) => k.status === "ASSIGNED").length;
  const completedKpis = myKpis.filter((k) => k.status === "COMPLETED").length;

  return (
    <div>
      <PageSection title="Executive Overview" subtitle="Your performance and request status">
        <Grid cols={4}>
          <MetricCard label="Pending Requests" value={pendingRequests} />
          <MetricCard label="Approved Requests" value={approvedRequests} />
          <MetricCard label="Active KPIs" value={activeKpis} />
          <MetricCard label="Completed KPIs" value={completedKpis} />
        </Grid>
      </PageSection>

      <PageSection title="Your Status">
        <Grid cols={3}>
          <Card>
            <p className="text-xs text-gray-500">Trust Level</p>
            <div className="mt-2">
              {currentUser ? (
                <TrustBadge userId={currentUser.id} showPercentage />
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </div>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Compliance Status</p>
            <div className="mt-2">
              {compliance?.isFundingBlocked ? (
                <StatusBadge variant="danger">Funding Blocked</StatusBadge>
              ) : compliance?.outstandingEvidenceCount > 0 ? (
                <StatusBadge variant="warning">
                  {compliance.outstandingEvidenceCount} evidence outstanding
                </StatusBadge>
              ) : (
                <StatusBadge variant="success">Compliant</StatusBadge>
              )}
            </div>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Total Fund Requests</p>
            <p className="text-2xl font-bold mt-2">{myRequests.length}</p>
            <p className="text-xs text-gray-400 mt-1">
              GHS {myRequests.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()} total
            </p>
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Recent Fund Requests">
        <Grid cols={1}>
          {myRequests.length === 0 ? (
            <Card><p className="text-sm text-gray-500">No fund requests submitted yet.</p></Card>
          ) : (
            myRequests.slice(0, 5).map((req) => (
              <Card key={req.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{req.purpose}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {req.pillar} &middot; {req.program} &middot; GHS {Number(req.amount).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge variant={req.status === "APPROVED" ? "success" : isRejectedRequest(req.status) ? "danger" : "warning"}>
                    {formatRequestStatus(req.status)}
                  </StatusBadge>
                </div>
              </Card>
            ))
          )}
        </Grid>
      </PageSection>

      <PageSection title="KPI Tasks">
        <Grid cols={1}>
          {myKpis.length === 0 ? (
            <Card><p className="text-sm text-gray-500">No KPI tasks assigned.</p></Card>
          ) : (
            myKpis.slice(0, 5).map((kpi) => (
              <Card key={kpi.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{kpi.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {kpi.impactCategory} &middot; Weight: {kpi.weight} &middot; Deadline: {kpi.deadline || "—"}
                    </p>
                  </div>
                  <StatusBadge
                    variant={kpi.status === "COMPLETED" ? "success" : kpi.status === "ASSIGNED" ? "info" : "neutral"}
                  >
                    {kpi.status}
                  </StatusBadge>
                </div>
              </Card>
            ))
          )}
        </Grid>
      </PageSection>
    </div>
  );
}


