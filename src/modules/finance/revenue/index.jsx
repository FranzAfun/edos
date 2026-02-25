/**
 * Revenue Recording Module (F11)
 * Record revenue entries with pillar, program, payment status,
 * customer type, and profit categorization.
 */
import { useState, useMemo, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import DataTable from "../../../shared/ui/DataTable";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as revenueStore from "../../../shared/services/revenueStore";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";

const PAYMENT_STATUS_VARIANT = {
  INVOICE: "warning",
  PARTIAL: "info",
  FULL: "success",
};

export default function RevenuePage() {
  const { role } = useRole();
  const [revenue, setRevenue] = useState(() => revenueStore.listRevenue());
  const reload = useCallback(() => setRevenue(revenueStore.listRevenue()), []);
  const totalRevenue = revenueStore.getTotalRevenue();
  const confirmedRevenue = revenueStore.getConfirmedRevenue();
  const pillarSummary = revenueStore.getRevenueByPillarSummary();

  const canRecord = role === "finance" || role === "admin" || role === "ceo";

  return (
    <div>
      <PageSection title="Revenue" subtitle="Revenue recording and tracking">
        <Grid cols={4}>
          <MetricCard label="Total Revenue" value={`GHS ${totalRevenue.toLocaleString()}`} />
          <MetricCard label="Confirmed" value={`GHS ${confirmedRevenue.toLocaleString()}`} />
          <MetricCard label="Entries" value={revenue.length} />
          <MetricCard
            label="Outstanding"
            value={`GHS ${(totalRevenue - confirmedRevenue).toLocaleString()}`}
          />
        </Grid>
      </PageSection>

      <PageSection title="Revenue by Pillar" subtitle="Breakdown by organizational pillar">
        <Grid cols={3}>
          {Object.entries(pillarSummary).map(([pillar, amount]) => (
            <Card key={pillar}>
              <p className="text-xs text-gray-500">{pillar}</p>
              <p className="text-lg font-bold mt-1">GHS {amount.toLocaleString()}</p>
            </Card>
          ))}
          {Object.keys(pillarSummary).length === 0 && (
            <Card><p className="text-sm text-gray-500">No revenue recorded yet.</p></Card>
          )}
        </Grid>
      </PageSection>

      {canRecord && (
        <PageSection title="Record Revenue" subtitle="Add a new revenue entry">
          <RevenueForm onRecorded={reload} role={role} />
        </PageSection>
      )}

      <PageSection title="Revenue Ledger" subtitle="All revenue entries">
        <DataTable
          columns={[
            { key: "pillar", label: "Pillar" },
            { key: "program", label: "Program" },
            { key: "productService", label: "Product/Service" },
            {
              key: "amount",
              label: "Amount",
              render: (v) => `GHS ${Number(v).toLocaleString()}`,
            },
            {
              key: "paymentStatus",
              label: "Payment",
              render: (v) => (
                <StatusBadge variant={PAYMENT_STATUS_VARIANT[v] || "neutral"}>
                  {v}
                </StatusBadge>
              ),
            },
            { key: "customerType", label: "Customer" },
            { key: "profitCategory", label: "Category" },
            {
              key: "recordedAt",
              label: "Date",
              render: (v) => new Date(v).toLocaleDateString(),
            },
          ]}
          data={revenue}
          pageSize={10}
          emptyText="No revenue entries found."
        />
      </PageSection>
    </div>
  );
}

function RevenueForm({ onRecorded, role }) {
  const currentUser = useMemo(() => {
    const users = userStore.getUsersByRole(role);
    return users.length > 0 ? users[0] : null;
  }, [role]);

  const rules = {
    pillar: (v) => (!v ? "Pillar is required" : null),
    program: (v) => (!v ? "Program is required" : null),
    productService: (v) => (!v ? "Product/Service is required" : null),
    amount: (v) => (!v || Number(v) <= 0 ? "Valid amount is required" : null),
    paymentStatus: (v) => (!v ? "Payment status is required" : null),
    customerType: (v) => (!v ? "Customer type is required" : null),
    profitCategory: (v) => (!v ? "Profit category is required" : null),
  };

  const { values, errors, touched, handleChange, validate, reset } =
    useFormValidation(
      {
        pillar: "",
        program: "",
        productService: "",
        amount: "",
        paymentStatus: "",
        customerType: "",
        paymentMethod: "",
        profitCategory: "",
      },
      rules
    );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;
      revenueStore.createRevenue({
        pillar: values.pillar,
        program: values.program,
        productService: values.productService,
        amount: Number(values.amount),
        paymentStatus: values.paymentStatus,
        customerType: values.customerType,
        paymentMethod: values.paymentMethod,
        profitCategory: values.profitCategory,
        recordedByUserId: currentUser?.id,
      });
      reset();
      onRecorded();
    },
    [validate, values, currentUser, reset, onRecorded]
  );

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Grid cols={3}>
          <FormField
            label="Pillar"
            name="pillar"
            type="select"
            required
            value={values.pillar}
            onChange={handleChange}
            error={touched.pillar ? errors.pillar : null}
            options={revenueStore.PILLARS.map((p) => ({ value: p, label: p }))}
          />
          <FormField
            label="Program"
            name="program"
            required
            value={values.program}
            onChange={handleChange}
            error={touched.program ? errors.program : null}
          />
          <FormField
            label="Product / Service"
            name="productService"
            required
            value={values.productService}
            onChange={handleChange}
            error={touched.productService ? errors.productService : null}
          />
        </Grid>
        <Grid cols={3}>
          <FormField
            label="Amount (GHS)"
            name="amount"
            type="number"
            required
            value={values.amount}
            onChange={handleChange}
            error={touched.amount ? errors.amount : null}
          />
          <FormField
            label="Payment Status"
            name="paymentStatus"
            type="select"
            required
            value={values.paymentStatus}
            onChange={handleChange}
            error={touched.paymentStatus ? errors.paymentStatus : null}
            options={revenueStore.PAYMENT_STATUSES.map((s) => ({
              value: s,
              label: s,
            }))}
          />
          <FormField
            label="Customer Type"
            name="customerType"
            type="select"
            required
            value={values.customerType}
            onChange={handleChange}
            error={touched.customerType ? errors.customerType : null}
            options={revenueStore.CUSTOMER_TYPES.map((t) => ({
              value: t,
              label: t,
            }))}
          />
        </Grid>
        <Grid cols={2}>
          <FormField
            label="Payment Method"
            name="paymentMethod"
            type="select"
            value={values.paymentMethod}
            onChange={handleChange}
            options={revenueStore.PAYMENT_METHODS.map((m) => ({
              value: m,
              label: m,
            }))}
          />
          <FormField
            label="Profit Category"
            name="profitCategory"
            type="select"
            required
            value={values.profitCategory}
            onChange={handleChange}
            error={touched.profitCategory ? errors.profitCategory : null}
            options={revenueStore.PROFIT_CATEGORIES.map((c) => ({
              value: c,
              label: c,
            }))}
          />
        </Grid>
        <button
          type="submit"
          className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Record Revenue
        </button>
      </form>
    </Card>
  );
}
