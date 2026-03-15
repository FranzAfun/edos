import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Fund Request Form (F1)
 * Executive submits: program, purpose, amount, vendor quotation,
 * expected outcome, attachment. Budget check runs when a legacy department budget is available.
 */
import { useState, useMemo } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import FormField from "../../../shared/ui/FormField";
import SelectField from "../../../shared/ui/SelectField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as fundRequestStore from "../../../shared/services/fundRequestStore";
import * as budgetStore from "../../../shared/services/budgetStore";
import * as userStore from "../../../shared/services/userStore";
import * as programStore from "../../../shared/services/programStore";
import useRole from "../../../hooks/useRole";
import { semanticStatus } from "@/theme/semanticColors";
import { createApproval } from "../../common/approvals/services/approvalService";
import { getSupervisorLabel } from "../../../utils/supervisor";
import { APPROVAL_STAGE_LABELS } from "../../../governance/approvalStages";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

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
  const [submittedStatus, setSubmittedStatus] = useState("");
  const [budgetWarning, setBudgetWarning] = useState(null);
  const activePrograms = programStore.getPrograms().filter((program) => program.status === "active");

  const rules = useMemo(
    () => ({
      programId: (value) => (!value?.trim() ? "Program is required" : null),
      purpose: (value) => (!value?.trim() ? "Purpose is required" : value.trim().length < 10 ? "Purpose must be at least 10 characters" : null),
      amount: (value) => (!value || Number(value) <= 0 ? "Amount must be greater than 0" : null),
      vendorName: (value) => (!value?.trim() ? "Vendor name is required" : null),
      quotationAmount: (value) => (!value || Number(value) <= 0 ? "Quotation amount must be greater than 0" : null),
      expectedOutcome: (value) => (!value?.trim() ? "Expected outcome is required" : null),
    }),
    []
  );

  const { values, errors, handleChange, setValue, validate, reset } = useFormValidation(
    {
      programId: "",
      purpose: "",
      amount: "",
      vendorName: "",
      quotationAmount: "",
      quotationReference: "",
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
      setBudgetWarning("Request exceeds remaining program budget.");
      return;
    }

    setBudgetWarning(null);
  }

  function handleAmountChange(event) {
    handleChange(event);
    checkBudget(event.target.value, values.departmentId);

    if (!values.quotationAmount) {
      setValue("quotationAmount", event.target.value);
    }
  }

  const selectedProgram = useMemo(
    () => activePrograms.find((program) => program.id === values.programId) || null,
    [activePrograms, values.programId]
  );

  const supervisorUser = useMemo(() => {
    if (!selectedProgram?.supervisor) return null;
    const users = userStore.getUsersByRole(selectedProgram.supervisor);
    return users.length > 0 ? users[0] : null;
  }, [selectedProgram]);

  const budget = useMemo(
    () => budgetStore.getBudgetByDepartment(values.departmentId || currentUserDeptId),
    [values.departmentId, currentUserDeptId]
  );

  const requestedAmount = Number(values.amount || 0);
  const budgetAfterRequest = budget ? Number(budget.remainingLimit) - requestedAmount : null;
  const isOverBudget = !!budget && requestedAmount > Number(budget.remainingLimit);

  const supervisorLabel = selectedProgram?.supervisor ? getSupervisorLabel(selectedProgram.supervisor) : "";
  const supervisorPreview = selectedProgram
    ? `${supervisorLabel} - ${supervisorUser?.name || "Unassigned"}`
    : "Select a program to view assigned supervisor.";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const selectedProgram = programStore.getProgramById(values.programId);
    if (!selectedProgram || selectedProgram.status !== "active") {
      return;
    }

    const budget = budgetStore.getBudgetByDepartment(values.departmentId || currentUserDeptId);
    if (budget?.frozen) return;

    const fundRequest = fundRequestStore.createFundRequest({
      userId: currentUserId,
      requesterRole: role,
      departmentId: values.departmentId || currentUserDeptId,
      supervisor: selectedProgram.supervisor,
      programId: selectedProgram.id,
      program: selectedProgram.name,
      purpose: values.purpose,
      amount: Number(values.amount),
      vendorQuotation: `${values.vendorName} - ${formatCurrency(values.quotationAmount)}${
        values.quotationReference?.trim() ? ` (Ref: ${values.quotationReference.trim()})` : ""
      }`,
      vendorName: values.vendorName.trim(),
      quotationAmount: Number(values.quotationAmount),
      quotationReference: values.quotationReference?.trim() || null,
      expectedOutcome: values.expectedOutcome,
      attachmentName: values.attachmentName || null,
    });

    const approvalResponse = await createApproval({
      title: `Fund Request: ${selectedProgram.name}`,
      description: values.purpose,
      amount: Number(values.amount),
      sourceType: "FUND_REQUEST",
      sourceId: fundRequest.id,
      supervisor: selectedProgram.supervisor,
      requestedByUserId: currentUserId,
    });

    if (!approvalResponse?.success || !approvalResponse.data) {
      return;
    }

    const approval = approvalResponse.data;

    fundRequestStore.updateFundRequest(fundRequest.id, { approvalId: approval.id });

    const stageLabel = APPROVAL_STAGE_LABELS[approval.currentStage] || "Pending Supervisor Review";
    setSubmitted(true);
    setSubmittedStatus(stageLabel);
    reset({
      programId: "",
      purpose: "",
      amount: "",
      vendorName: "",
      quotationAmount: "",
      quotationReference: "",
      expectedOutcome: "",
      attachmentName: "",
      departmentId: currentUserDeptId || "",
    });
    setBudgetWarning(null);
    setTimeout(() => {
      setSubmitted(false);
      setSubmittedStatus("");
    }, 5000);
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
            <p className="font-semibold">Request Submitted Successfully</p>
            <p className="mt-1">Current Status: {submittedStatus || "Pending Supervisor Review"}</p>
          </div>
        )}

        <Card>
          {activePrograms.length === 0 && (
            <div
              className="mb-4 rounded p-3 text-sm"
              role="alert"
              style={{
                backgroundColor: semanticStatus.warning.bg,
                color: semanticStatus.warning.text,
              }}
            >
              No active programs available. Ask Admin to create and activate a program first.
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormField
                label="Program"
                name="programId"
                type="select"
                value={values.programId}
                onChange={handleChange}
                error={errors.programId}
                required
              >
                <SelectField
                  id="field-programId"
                  name="programId"
                  value={values.programId}
                  onChange={handleChange}
                  className="w-full rounded border px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select program</option>
                  {activePrograms.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </SelectField>

                <div className="mt-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
                  <p className="font-semibold text-[var(--color-text-secondary)]">Supervisor</p>
                  <p className="mt-1 text-[var(--color-text-primary)]">{supervisorPreview}</p>
                </div>
              </FormField>

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

              {budget && (
                <div className="mb-4 -mt-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs">
                  <p className="font-semibold text-[var(--color-text-secondary)]">Department Budget Remaining</p>
                  <p className="mt-1 text-[var(--color-text-primary)]">{formatCurrency(budget.remainingLimit)}</p>
                  <p className="mt-2 font-semibold text-[var(--color-text-secondary)]">After Request</p>
                  <p className={`mt-1 ${budgetAfterRequest < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-text-primary)]"}`}>
                    {budgetAfterRequest < 0
                      ? `${formatCurrency(Math.abs(budgetAfterRequest))} over budget`
                      : `${formatCurrency(budgetAfterRequest)} remaining`}
                  </p>
                  {isOverBudget && <p className="mt-2 text-[var(--color-danger)]">Request exceeds remaining program budget.</p>}
                </div>
              )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormField
                label="Vendor Name"
                name="vendorName"
                value={values.vendorName}
                onChange={handleChange}
                error={errors.vendorName}
                required
                placeholder="e.g. TechVendor Ghana Ltd"
              />

              <FormField
                label="Quotation Amount (GHS)"
                name="quotationAmount"
                type="number"
                value={values.quotationAmount}
                onChange={handleChange}
                error={errors.quotationAmount}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <FormField
              label="Quotation Reference"
              name="quotationReference"
              value={values.quotationReference}
              onChange={handleChange}
              placeholder="Invoice / Quote ID"
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

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">Upload Vendor Quotation</label>
              <div className="mx-auto w-full max-w-xl rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 text-center text-sm">
                <p className="font-medium text-[var(--color-text-primary)]">Drag and drop file here</p>
                <p className="my-1 text-[var(--color-text-muted)]">or</p>
                <button
                  type="button"
                  disabled
                  className="btn-secondary rounded px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Browse Files
                </button>
                <input type="file" disabled className="hidden" aria-hidden="true" />
                <p className="mt-3 text-xs font-medium text-[var(--color-text-muted)]">Accepted formats: PDF, JPG, PNG. Upload is disabled until backend integration.</p>
              </div>
            </div>

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
                disabled={
                  activePrograms.length === 0
                  || (!!budgetWarning && budgetWarning.includes("frozen"))
                  || isOverBudget
                }
                className="btn-primary rounded px-6 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
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


