import AuditTrailPage from "../../common/audit";
import { AUDIT_CATEGORIES } from "../../../shared/services/auditStore";

export default function SystemLogsPage() {
  return (
    <AuditTrailPage
      title="System Logs"
      subtitle="Technical platform events and administrative changes"
      defaultCategory={AUDIT_CATEGORIES.SYSTEM_LOG}
      categoryLocked
    />
  );
}
