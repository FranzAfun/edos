/**
 * Asset Management Module (F20, F21, F22)
 * F20: Asset Register — full CRUD with categories, conditions, assignments
 * F21: Depreciation Engine — straight-line depreciation display
 * F22: Aging & Maintenance Alerts
 */
import { useState, useMemo, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import DataTable from "../../../shared/ui/DataTable";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as assetStore from "../../../shared/services/assetStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";

const CONDITION_VARIANT = {
  New: "success",
  Good: "info",
  Fair: "warning",
  Poor: "danger",
};

export default function AssetManagementPage() {
  const { role } = useRole();
  const [showForm, setShowForm] = useState(false);

  const [assets, setAssets] = useState(() => assetStore.listAssets());
  const departments = departmentStore.listDepartments();
  const [totalValue, setTotalValue] = useState(() => assetStore.getTotalAssetValue());
  const [agingAlerts, setAgingAlerts] = useState(() => assetStore.getAgingAlerts());
  const [deptValues, setDeptValues] = useState(() => assetStore.getAssetValueByDepartment());
  const reload = useCallback(() => {
    setAssets(assetStore.listAssets());
    setTotalValue(assetStore.getTotalAssetValue());
    setAgingAlerts(assetStore.getAgingAlerts());
    setDeptValues(assetStore.getAssetValueByDepartment());
  }, []);

  const canManage = role === "admin" || role === "operations" || role === "finance";

  const tableData = assets.map((a) => {
    const dep = assetStore.computeDepreciation(a);
    const dept = departments.find((d) => d.id === a.departmentId);
    const user = a.assignedToUserId ? userStore.getUserById(a.assignedToUserId) : null;
    return {
      ...a,
      departmentName: dept?.name || a.departmentId,
      assignedToName: user?.name || "—",
      currentValue: dep.currentValue,
      age: dep.age,
      remainingLife: dep.remainingLife,
      annualDepreciation: dep.annualDepreciation,
    };
  });

  return (
    <div>
      <PageSection title="Asset Management" subtitle="Organizational asset register, depreciation, and alerts">
        <Grid cols={4}>
          <MetricCard label="Total Assets" value={assets.length} />
          <MetricCard label="Total Current Value" value={`GHS ${Math.round(totalValue).toLocaleString()}`} />
          <MetricCard label="Total Purchase Cost" value={`GHS ${assets.reduce((s, a) => s + (a.purchaseCost || 0), 0).toLocaleString()}`} />
          <MetricCard label="Aging Alerts" value={agingAlerts.length} />
        </Grid>
      </PageSection>

      {/* F22: Aging Alerts */}
      {agingAlerts.length > 0 && (
        <PageSection title="Aging and Maintenance Alerts" subtitle="Assets nearing end of life or in poor condition">
          <Grid cols={1}>
            {agingAlerts.map((a) => {
              const dep = assetStore.computeDepreciation(a);
              return (
                <Card key={a.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold">{a.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {a.category} &middot; {a.location}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <StatusBadge variant={CONDITION_VARIANT[a.condition] || "neutral"}>
                          {a.condition}
                        </StatusBadge>
                        {dep.remainingLife <= 1 && (
                          <StatusBadge variant="danger">
                            {dep.remainingLife <= 0 ? "Fully Depreciated" : `${dep.remainingLife}yr remaining`}
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">GHS {Math.round(dep.currentValue).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">of GHS {a.purchaseCost.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </Grid>
        </PageSection>
      )}

      {/* F20: Asset Register + Add Form */}
      {canManage && (
        <PageSection title="Register Asset" subtitle="Add a new asset to the register">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="mb-4 rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            {showForm ? "Hide Form" : "Add New Asset"}
          </button>
          {showForm && <AssetForm departments={departments} onCreated={() => { reload(); setShowForm(false); }} />}
        </PageSection>
      )}

      {/* F21: Full Asset Table with Depreciation */}
      <PageSection title="Asset Register" subtitle="All organizational assets with depreciation data">
        <DataTable
          columns={[
            { key: "name", label: "Asset Name" },
            { key: "category", label: "Category" },
            { key: "departmentName", label: "Department" },
            {
              key: "condition",
              label: "Condition",
              render: (v) => <StatusBadge variant={CONDITION_VARIANT[v] || "neutral"}>{v}</StatusBadge>,
            },
            { key: "purchaseCost", label: "Purchase Cost", render: (v) => `GHS ${Number(v).toLocaleString()}` },
            { key: "currentValue", label: "Current Value", render: (v) => `GHS ${Math.round(v).toLocaleString()}` },
            { key: "annualDepreciation", label: "Annual Dep.", render: (v) => `GHS ${Math.round(v).toLocaleString()}` },
            { key: "age", label: "Age (yrs)", render: (v) => `${v}` },
            { key: "remainingLife", label: "Life Left (yrs)", render: (v) => `${v}` },
            { key: "assignedToName", label: "Assigned To" },
            { key: "location", label: "Location" },
            ...(canManage
              ? [{
                  key: "id",
                  label: "Action",
                  sortable: false,
                  render: (_, row) => <DeleteAssetButton assetId={row.id} name={row.name} onDeleted={reload} />,
                }]
              : []),
          ]}
          data={tableData}
          pageSize={10}
          emptyText="No assets registered."
        />
      </PageSection>

      {/* Department values */}
      <PageSection title="Asset Value by Department" subtitle="Current depreciated value per department">
        <Grid cols={3}>
          {Object.entries(deptValues).map(([deptId, value]) => {
            const dept = departments.find((d) => d.id === deptId);
            return (
              <Card key={deptId}>
                <p className="text-xs text-gray-500">{dept?.name || deptId}</p>
                <p className="text-lg font-bold mt-1">GHS {Math.round(value).toLocaleString()}</p>
              </Card>
            );
          })}
          {Object.keys(deptValues).length === 0 && (
            <Card><p className="text-sm text-gray-500">No asset data.</p></Card>
          )}
        </Grid>
      </PageSection>
    </div>
  );
}

function AssetForm({ departments, onCreated }) {
  const users = useMemo(() => userStore.listUsers(), []);
  const rules = {
    name: (v) => (!v ? "Asset name is required" : null),
    category: (v) => (!v ? "Category is required" : null),
    departmentId: (v) => (!v ? "Department is required" : null),
    purchaseCost: (v) => (!v || Number(v) <= 0 ? "Valid cost is required" : null),
    usefulLifeYears: (v) => (!v || Number(v) <= 0 ? "Useful life is required" : null),
    condition: (v) => (!v ? "Condition is required" : null),
    purchaseDate: (v) => (!v ? "Purchase date is required" : null),
  };

  const { values, errors, touched, handleChange, validate, reset } =
    useFormValidation(
      {
        name: "",
        category: "",
        departmentId: "",
        purchaseCost: "",
        usefulLifeYears: "",
        condition: "",
        location: "",
        assignedToUserId: "",
        purchaseDate: "",
      },
      rules
    );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      assetStore.createAsset({
        name: values.name,
        category: values.category,
        departmentId: values.departmentId,
        purchaseCost: Number(values.purchaseCost),
        usefulLifeYears: Number(values.usefulLifeYears),
        condition: values.condition,
        location: values.location,
        assignedToUserId: values.assignedToUserId || null,
        receiptId: null,
        purchaseDate: values.purchaseDate,
      });
      reset();
      onCreated();
    },
    [validate, values, reset, onCreated]
  );

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Grid cols={3}>
          <FormField label="Asset Name" name="name" required value={values.name} onChange={handleChange} error={touched.name ? errors.name : null} />
          <FormField label="Category" name="category" type="select" required value={values.category} onChange={handleChange} error={touched.category ? errors.category : null} options={assetStore.CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <FormField label="Department" name="departmentId" type="select" required value={values.departmentId} onChange={handleChange} error={touched.departmentId ? errors.departmentId : null} options={departments.map((d) => ({ value: d.id, label: d.name }))} />
        </Grid>
        <Grid cols={3}>
          <FormField label="Purchase Cost (GHS)" name="purchaseCost" type="number" required value={values.purchaseCost} onChange={handleChange} error={touched.purchaseCost ? errors.purchaseCost : null} />
          <FormField label="Useful Life (years)" name="usefulLifeYears" type="number" required value={values.usefulLifeYears} onChange={handleChange} error={touched.usefulLifeYears ? errors.usefulLifeYears : null} />
          <FormField label="Condition" name="condition" type="select" required value={values.condition} onChange={handleChange} error={touched.condition ? errors.condition : null} options={assetStore.CONDITIONS.map((c) => ({ value: c, label: c }))} />
        </Grid>
        <Grid cols={3}>
          <FormField label="Location" name="location" value={values.location} onChange={handleChange} />
          <FormField label="Assigned To" name="assignedToUserId" type="select" value={values.assignedToUserId} onChange={handleChange} options={users.map((u) => ({ value: u.id, label: u.name }))} />
          <FormField label="Purchase Date" name="purchaseDate" type="date" required value={values.purchaseDate} onChange={handleChange} error={touched.purchaseDate ? errors.purchaseDate : null} />
        </Grid>
        <button type="submit" className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700">
          Register Asset
        </button>
      </form>
    </Card>
  );
}

function DeleteAssetButton({ assetId, name, onDeleted }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <button onClick={() => setConfirm(true)} className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700">
        Delete
      </button>
      <ConfirmDialog
        open={confirm}
        title="Delete Asset"
        message={`Permanently delete "${name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { assetStore.deleteAsset(assetId); setConfirm(false); onDeleted(); }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
