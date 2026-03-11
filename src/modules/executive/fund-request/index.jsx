import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Fund Request Form (F1)
 * Executive submits: supervisor, program, purpose, amount, vendor quotation,
 * expected outcome, attachment. Budget check runs when a legacy department budget is available.
 */
import { useState, useMemo } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as fundRequestStore from "../../../shared/services/fundRequestStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as userStore from "../../../shared/services/userStore";
import useRole from "../../../hooks/useRole";
import { semanticStatus } from "@/theme/semanticColors";
import { createApproval } from "../../common/approvals/services/approvalService";
import { SUPERVISOR_OPTIONS } from "../../../utils/supervisor";

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

export default function FundRequestForm() {
  useDocumentTitle("Fund Request");
  const { role } = useRole();
  const currentUser = resolveUser(role);
  const currentUserId = currentUser?.id;
  const currentUserDeptId = currentUser?.departmentId;
  const [submitted, setSubmitted] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);

  const requiresSupervisor = role === "executive";
  const currentUserSupervisor = requiresSupervisor
    ? currentUser?.supervisorRole || ""
    : (role === "cto" || role === "coo" ? role : "");

  const rules = useMemo(
    () => ({
      supervisor: (value) => (requiresSupervisor && !value ? "Supervisor is required" : null),
      program: (value) => (!value?.trim() ? "Program name is required" : null),
      purpose: (value) => (!value?.trim() ? "Purpose is required" : value.trim().length < 10 ? "Purpose must be at least 10 characters" : null),
      amount: (value) => (!value || Number(value) <= 0 ? "Amount must be greater than 0" : null),
      vendorQuotation: (value) => (!value?.trim() ? "Vendor quotation details are required" : null),
      expectedOutcome: (value) => (!value?.trim() ? "Expected outcome is required" : null),
    }),
    [requiresSupervisor]
  );

  const { values, errors, handleChange, validate, reset } = useFormValidation(
    {
      supervisor: currentUserSupervisor,
      program: "",
      purpose: "",
      amount: "",
      vendorQuotation: "",
      expectedOutcome: "",
      attachmentName: "",
      departmentId: currentUserDeptId || "",
    },
    rules
  );

  function checkBudget(nextAmount = values.amount, nextDepartmentId = values.departmentId) {
    const deptId = nextDepartmentId || currentUserDeptId;
    if (!deptId || !nextAmount) {
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

    if (Number(nextAmount) > budget.remainingLimit) {
      setBudgetWarning(
        `Insufficient budget. Remaining: GHS ${budget.remainingLimit.toLocaleString()}. Requested: GHS ${Number(nextAmount).toLocaleString()}.`
      );
      return;
    }

    setBudgetWarning(null);
  }

  function handleAmountChange(event) {
    handleChange(event);
    checkBudget(event.target.value, values.departmentId);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const budget = budgetStore.getBudgetByDepartment(values.departmentId || currentUserDeptId);
    if (budget?.frozen) return;

    const fundRequest = fundRequestStore.createFundRequest({
      userId: currentUserId,
      requesterRole: role,
      departmentId: values.departmentId || currentUserDeptId,
      supervisor: values.supervisor,
      program: values.program,
      purpose: values.purpose,
      amount: Number(values.amount),
      vendorQuotation: values.vendorQuotation,
      expectedOutcome: values.expectedOutcome,
      attachmentName: values.attachmentName || null,
    });

    const approvalResponse = await createApproval({
      title: `Fund Request: ${values.program}`,
      description: values.purpose,
      amount: Number(values.amount),
      sourceType: "FUND_REQUEST",
      sourceId: fundRequest.id,
      supervisor: values.supervisor,
      requestedByUserId: currentUserId,
    });

    if (!approvalResponse?.success || !approvalResponse.data) {
      return;
    }

    const approval = approvalResponse.data;

    fundRequestStore.updateFundRequest(fundRequest.id, { approvalId: approval.id });

    setSubmitted(true);
    reset({
      supervisor: currentUserSupervisor,
      program: "",
      purpose: "",
      amount: "",
      vendorQuotation: "",
      expectedOutcome: "",
      attachmentName: "",
      departmentId: currentUserDeptId || "",
    });
    setBudgetWarning(null);
    setTimeout(() => setSubmitted(false), 4000);
  }

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
              {requiresSupervisor ? (
                <FormField
                  label="Supervisor"
                  name="supervisor"
                  type="select"
                  value={values.supervisor}
                  onChange={handleChange}
                  error={errors.supervisor}
                  required
                >
                  <select
                    id="field-supervisor"
                    name="supervisor"
                    value={values.supervisor}
                    onChange={handleChange}
                    required
                    className={`w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors.supervisor ? "border-[var(--color-danger)] focus:ring-[var(--color-danger)]" : "border-gray-300 focus:ring-[var(--color-accent)]"}`}
                  >
                    <option value="">Select supervisor</option>
                    {SUPERVISOR_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : (
                <Card>
                  <p className="text-xs text-gray-500">Approval Entry</p>
                  <p className="mt-2 text-sm font-semibold">
                    {role === "finance" ? "CEO review first" : "Financial Officer review first"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {role === "finance"
                      ? "Finance requests skip the FO stage and go directly to CEO approval."
                      : "Senior operational requests start with Financial Officer review."}
                  </p>
                </Card>
              )}

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
                className="rounded bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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


