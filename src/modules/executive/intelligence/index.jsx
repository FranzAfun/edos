import ModuleBoundary from "../../../shared/components/ModuleBoundary";
import Card from "../../../shared/ui/Card";
import Grid from "../../../shared/ui/Grid";
import PageSection from "../../../shared/ui/PageSection";
import GovernanceStageBadge from "../../../governance/GovernanceStageBadge";
import useGovernedModule from "../../../governance/useGovernedModule";
import useIntelligenceOverview from "./hooks/useIntelligenceOverview";

export default function ExecutiveIntelligence() {
  const query = useIntelligenceOverview();
  const {
    governedEntity,
    enforcement,
  } = useGovernedModule("intelligence", {
    id: "intel-1",
    title: "Executive Intelligence Overview",
    stage: query.data?.stage ?? "WORK",
    score: query.data?.riskScore ?? 0,
  });

  return (
    <PageSection>
      <ModuleBoundary
        query={query}
        title="Executive Intelligence"
        loadingText="Loading intelligence signals..."
        emptyText="No intelligence data available."
        errorText="Failed to load intelligence module."
      >
        {!enforcement.allowed ? (
          <Card>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700">
                Authority Level Insufficient
              </p>
              <p className="text-xs opacity-80">
                Required Level: {enforcement.requiredLevel}
              </p>
              <p className="text-xs opacity-80">
                Your Level: {enforcement.authorityLevel}
              </p>
              <p className="text-xs opacity-80">
                Enforcement Gap: {enforcement.enforcementGap}
              </p>
            </div>
          </Card>
        ) : (
          <Grid cols={3}>
            <Card>
              <div className="flex items-center justify-between">
                <Metric
                  label="Open Investigations"
                  value={query.data?.openInvestigations ?? 0}
                />
                <GovernanceStageBadge stage={governedEntity.stage} />
              </div>
            </Card>

            <Card>
              <Metric
                label="Pending Verifications"
                value={query.data?.pendingVerifications ?? 0}
              />
            </Card>

            <Card>
              <Metric
                label="Risk Score"
                value={query.data?.riskScore ?? 0}
              />
            </Card>
          </Grid>
        )}
      </ModuleBoundary>
    </PageSection>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs opacity-70">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
