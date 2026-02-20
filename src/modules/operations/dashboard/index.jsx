import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Operations Dashboard (F30)
 * Operational overview: approvals, receipts, attendance, assets.
 */
import { useMemo } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as receiptStore from "../../../shared/services/receiptStore";
import * as attendanceStore from "../../../shared/services/attendanceStore";
import * as assetStore from "../../../shared/services/assetStore";

export default function OperationsDashboard() {
  useDocumentTitle("Operations Dashboard");
  const approvals = useMemo(() => approvalStore.listApprovals(), []);
  const receipts = useMemo(() => receiptStore.listReceipts(), []);
  const assets = useMemo(() => assetStore.listAssets(), []);
  const participationRate = useMemo(() => attendanceStore.getParticipationRate(), []);

  const opsQueue = approvals.filter((a) => a.currentStage === "PENDING_OPERATIONS").length;
  const uploadedReceipts = receipts.filter((r) => r.verificationStatus === "UPLOADED").length;
  const agingAlerts = useMemo(() => assetStore.getAgingAlerts(), []);

  return (
    <div>
      <PageSection title="Operations Dashboard" subtitle="Operational status and pending actions">
        <Grid cols={4}>
          <MetricCard label="Ops Queue" value={opsQueue} />
          <MetricCard label="Receipts to Verify" value={uploadedReceipts} />
          <MetricCard label="Participation Rate" value={`${participationRate}%`} />
          <MetricCard label="Asset Alerts" value={agingAlerts.length} />
        </Grid>
      </PageSection>

      <PageSection title="Pending Actions">
        <Grid cols={2}>
          <Card>
            <h3 className="text-sm font-semibold mb-2">Approval Queue</h3>
            <p className="text-xs text-gray-500">
              {opsQueue > 0
                ? `${opsQueue} approval(s) pending Operations review.`
                : "No pending approvals."
              }
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-2">Receipt Verification</h3>
            <p className="text-xs text-gray-500">
              {uploadedReceipts > 0
                ? `${uploadedReceipts} receipt(s) uploaded and awaiting verification.`
                : "All receipts verified."
              }
            </p>
          </Card>
        </Grid>
      </PageSection>

      <PageSection title="Asset Health">
        <Grid cols={3}>
          <MetricCard label="Total Assets" value={assets.length} />
          <MetricCard label="Total Value" value={`GHS ${Math.round(assetStore.getTotalAssetValue()).toLocaleString()}`} />
          <MetricCard label="Aging/Poor Condition" value={agingAlerts.length} />
        </Grid>
        {agingAlerts.length > 0 && (
          <div className="mt-4">
            <Grid cols={1}>
              {agingAlerts.slice(0, 3).map((a) => (
                <Card key={a.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{a.name}</h3>
                      <p className="text-xs text-gray-500">{a.category} &middot; {a.location}</p>
                    </div>
                    <StatusBadge variant={a.condition === "Poor" ? "danger" : "warning"}>
                      {a.condition}
                    </StatusBadge>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>
        )}
      </PageSection>
    </div>
  );
}


