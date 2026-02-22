import PageSection from "../../../../components/layout/PageSection";
import Card from "../../../../components/ui/Card";
import { permissions } from "../../../../config/permissions";
import Can from "../../../../components/security/Can";
import { useIntelligence } from "./hooks/useIntelligence";

export default function Intelligence() {
  const { data, loading } = useIntelligence();
  void data;

  return (
    <PageSection
      title="Intelligence Overview"
      subtitle="Strategic monitoring and executive insights"
    >
      <Card>
        {loading ? "Loading..." : "Data Loaded"}
      </Card>

      <Can permission={permissions.VIEW_INTELLIGENCE}>
        <Card className="mt-4">
          Permission: VIEW_INTELLIGENCE granted
        </Card>
      </Can>

      <Can permission={permissions.VIEW_APPROVALS}>
        <Card className="mt-4 border border-red-400">
          Permission: VIEW_APPROVALS granted
        </Card>
      </Can>
    </PageSection>
  );
}
