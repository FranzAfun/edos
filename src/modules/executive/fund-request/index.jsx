import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Fund Request Form (F1)
 * Executive submits: pillar, program, purpose, amount, vendor quotation,
 * expected outcome, attachment. Budget check before submission.
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import FormField from "../../../shared/ui/FormField";
import ApprovalRouteBadge from "../../../components/ui/ApprovalRouteBadge";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as fundRequestStore from "../../../shared/services/fundRequestStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as departmentStore from "../../../shared/services/departmentStore";
import * as userStore from "../../../shared/services/userStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as notificationStore from "../../../shared/services/notificationStore";
import useRole from "../../../hooks/useRole";
import { semanticStatus } from "@/theme/semanticColors";

const PILLARS = ["Education", "Manufacturing", "Softwares", "Open Labs"];

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

const RULES = {
  pillar: (v) => (!v ? "Pillar is required" : null),
  program: (v) => (!v?.trim() ? "Program name is required" : null),
  purpose: (v) => (!v?.trim() ? "Purpose is required" : v.trim().length < 10 ? "Purpose must be at least 10 characters" : null),
  amount: (v) => (!v || Number(v) <= 0 ? "Amount must be greater than 0" : null),
  vendorQuotation: (v) => (!v?.trim() ? "Vendor quotation details are required" : null),
  expectedOutcome: (v) => (!v?.trim() ? "Expected outcome is required" : null),
};

export default function FundRequestForm() {
  useDocumentTitle("Fund Request");
  const { role } = useRole();
  const currentUser = resolveUser(role);
  const currentUserId = currentUser?.id;
  const currentUserDeptId = currentUser?.departmentId;
  const currentUserName = currentUser?.name;
  const [submitted, setSubmitted] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);

  const departments = departmentStore.listDepartments();

  const { values, errors, handleChange, validate, reset } = useFormValidation(
    {
      pillar: "",
      program: "",
      purpose: "",
      amount: "",
      vendorQuotation: "",
      expectedOutcome: "",
      attachmentName: "",
      departmentId: currentUserDeptId || "",
    },
    RULES
  );

  const checkBudget = useCallback(() => {
    const deptId = values.departmentId || currentUserDeptId;
    if (!deptId || !values.amount) {
      setBudgetWarning(null);
      return;
    }
    const budget = budgetStore.getBudgetByDepartment(deptId);
    if (!budget) {
      setBudgetWarning(null);
      return;
    }
    if (budget.frozen) {
      setBudgetWarning("Department budget is frozen. Requests cannot be submitted.");
      return;
    }
    if (Number(values.amount) > budget.remainingLimit) {
      setBudgetWarning(
        `Insufficient budget. Remaining: GHS ${budget.remainingLimit.toLocaleString()}. Requested: GHS ${Number(values.amount).toLocaleString()}.`
      );
      return;
    }
    setBudgetWarning(null);
  }, [values.amount, values.departmentId, currentUserDeptId]);

  const handleAmountChange = useCallback(
    (e) => {
      handleChange(e);
      setTimeout(() => checkBudget(), 0);
    },
    [handleChange, checkBudget]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;

      const budget = budgetStore.getBudgetByDepartment(values.departmentId || currentUserDeptId);
      if (budget?.frozen) return;

      // Create fund request
      const fr = fundRequestStore.createFundRequest({
        userId: currentUserId,
        departmentId: values.departmentId || currentUserDeptId,
        pillar: values.pillar,
        program: values.program,
        purpose: values.purpose,
        amount: Number(values.amount),
        vendorQuotation: values.vendorQuotation,
        expectedOutcome: values.expectedOutcome,
        attachmentName: values.attachmentName || null,
      });

      // Create linked approval
      const approval = approvalStore.createApproval({
        title: `Fund Request: ${values.program}`,
        description: values.purpose,
        amount: Number(values.amount),
        sourceType: "FUND_REQUEST",
        sourceId: fr.id,
        requestedByUserId: currentUserId,
      });

      // Update fund request with approval link
      fundRequestStore.updateFundRequest(fr.id, { approvalId: approval.id });

      // Notify FO
      const foUser = resolveUser("finance");
      if (foUser) {
        notificationStore.createNotification({
          toUserId: foUser.id,
          type: "FUND_REQUEST",
          message: `New fund request: "${values.program}" for GHS ${Number(values.amount).toLocaleString()} from ${currentUserName || "Unknown"}.`,
        });
      }

      setSubmitted(true);
      reset({
        pillar: "", program: "", purpose: "", amount: "",
        vendorQuotation: "", expectedOutcome: "", attachmentName: "",
        departmentId: currentUserDeptId || "",
      });
      setTimeout(() => setSubmitted(false), 4000);
    },
    [validate, values, currentUserId, currentUserDeptId, currentUserName, reset]
  );

  return (
    <div>
      <PageSection
        title="Submit Fund Request"
        subtitle="Complete all fields to submit a funding request for approval."
      >
        {submitted && (
          <div
            className="mb-4 rounded p-3 text-sm"
            role="status"
            style={{
              backgroundColor: semanticStatus.success.bg,
              color: semanticStatus.success.text,
            }}
          >
            Fund request submitted successfully. It will be routed for approval.
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormField
                label="Pillar"
                name="pillar"
                type="select"
                value={values.pillar}
                onChange={handleChange}
                error={errors.pillar}
                required
              >
                <select
                  id="field-pillar"
                  name="pillar"
                  value={values.pillar}
                  onChange={handleChange}
                  required
                  className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.pillar ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-gray-300 focus:ring-[var(--color-accent)]"}`}
                >
                  <option value="">Select pillar</option>
                  {PILLARS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Program"
                name="program"
                value={values.program}
                onChange={handleChange}
                error={errors.program}
                required
                placeholder="e.g. Digital Literacy Initiative"
              />

              <FormField
                label="Amount (GHS)"
                name="amount"
                type="number"
                value={values.amount}
                onChange={handleAmountChange}
                error={errors.amount}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <FormField
                label="Department"
                name="departmentId"
                type="select"
                value={values.departmentId}
                onChange={handleChange}
              >
                <select
                  id="field-departmentId"
                  name="departmentId"
                  value={values.departmentId}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Purpose"
              name="purpose"
              type="textarea"
              value={values.purpose}
              onChange={handleChange}
              error={errors.purpose}
              required
              placeholder="Describe the purpose of this fund request..."
            />

            <FormField
              label="Vendor Quotation"
              name="vendorQuotation"
              value={values.vendorQuotation}
              onChange={handleChange}
              error={errors.vendorQuotation}
              required
              placeholder="e.g. TechVendor Ghana Ltd - GHS 2,500"
            />

            <FormField
              label="Expected Outcome"
              name="expectedOutcome"
              type="textarea"
              value={values.expectedOutcome}
              onChange={handleChange}
              error={errors.expectedOutcome}
              required
              placeholder="What outcome is expected from this expenditure?"
            />

            <FormField
              label="Attachment"
              name="attachmentName"
              value={values.attachmentName}
              onChange={handleChange}
              placeholder="File name (e.g. quotation.pdf)"
              helpText="Enter attachment file name. File uploads will be available when backend is connected."
            />

            {/* Approval Route Indicator (F2) */}
            {values.amount > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Approval Path</p>
                <ApprovalRouteBadge amount={Number(values.amount)} />
              </div>
            )}

            {/* Budget Warning */}
            {budgetWarning && (
              <div
                className="mb-4 rounded p-3 text-sm"
                role="alert"
                style={{
                  backgroundColor: semanticStatus.warning.bg,
                  color: semanticStatus.warning.text,
                }}
              >
                {budgetWarning}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!!budgetWarning && budgetWarning.includes("frozen")}
                className="rounded bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </form>
        </Card>
      </PageSection>
    </div>
  );
}


