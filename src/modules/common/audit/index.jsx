import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Audit Trail UI (F39)
 * View system audit log with filtering by entity, user, action.
 */
import { useState, useMemo } from "react";
import PageSection from "../../../components/layout/PageSection";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import DataTable from "../../../shared/ui/DataTable";
import * as auditStore from "../../../shared/services/auditStore";
import * as userStore from "../../../shared/services/userStore";

export default function AuditTrailPage({
  title = "Audit Trail",
  subtitle = "System activity log for transparency and accountability",
  defaultCategory = auditStore.AUDIT_CATEGORIES.FINANCIAL_AUDIT,
  categoryLocked = false,
}) {
  useDocumentTitle(title);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || "");

  const allLogs = useMemo(() => auditStore.listAuditLog(), []);

  const scopedLogs = useMemo(() => {
    if (!selectedCategory) {
      return allLogs;
    }

    return allLogs.filter((log) => log.category === selectedCategory);
  }, [allLogs, selectedCategory]);

  const actions = useMemo(
    () => [...new Set(scopedLogs.map((log) => log.action))],
    [scopedLogs]
  );

  const entityTypes = useMemo(
    () => [...new Set(scopedLogs.map((log) => log.entityType))],
    [scopedLogs]
  );

  const filteredLogs = useMemo(() => {
    let logs = scopedLogs;
    if (filterAction) logs = logs.filter((log) => log.action === filterAction);
    if (filterEntity) logs = logs.filter((log) => log.entityType === filterEntity);
    return logs;
  }, [scopedLogs, filterAction, filterEntity]);

  return (
    <div>
      <PageSection title={title} subtitle={subtitle}>
        <Grid cols={3}>
          <MetricCard label="Total Events" value={scopedLogs.length} />
          <MetricCard label="Unique Actions" value={actions.length} />
          <MetricCard label="Entity Types" value={entityTypes.length} />
        </Grid>
      </PageSection>

      <PageSection title="Filter">
        <div className="flex gap-4 mb-4">
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
            disabled={categoryLocked}
          >
            <option value="">All Categories</option>
            {Object.values(auditStore.AUDIT_CATEGORIES).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="">All Entities</option>
            {entityTypes.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </PageSection>

      <PageSection title="Audit Log">
        <DataTable
          columns={[
            {
              key: "timestamp",
              label: "Time",
              render: (v) => new Date(v).toLocaleString(),
            },
            {
              key: "userId",
              label: "User",
              render: (v) => {
                const u = userStore.getUserById(v);
                return u?.name || v || "System";
              },
            },
            { key: "action", label: "Action" },
            { key: "category", label: "Category" },
            { key: "entityType", label: "Entity Type" },
            { key: "entityId", label: "Entity ID" },
            {
              key: "details",
              label: "Details",
              render: (v) =>
                typeof v === "object" ? JSON.stringify(v).slice(0, 80) : v || "—",
            },
          ]}
          data={filteredLogs}
          pageSize={20}
          emptyText="No audit log entries found."
        />
      </PageSection>
    </div>
  );
}


