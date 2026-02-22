import Grid from "../../components/layout/Grid";
import PageSection from "../../components/layout/PageSection";
import MetricCard from "../../components/ui/MetricCard";

export default function ExecutiveDashboard() {
  return (
    <PageSection
      title="Executive Overview"
      subtitle="High-level performance indicators"
    >
      <Grid cols={3}>
        <MetricCard
          label="Active Directives"
          value="42"
          trend="up"
          delta="+5% this month"
        />

        <MetricCard
          label="Compliance Rate"
          value="91%"
          trend="down"
          delta="-2% this week"
        />

        <MetricCard
          label="Pending Reviews"
          value="8"
        />
      </Grid>
    </PageSection>
  );
}
