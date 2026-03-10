import useDocumentTitle from "../../../hooks/useDocumentTitle";
/**
 * Receipt Upload & Management (F7 + F8 + F9)
 * - F7: Receipt Upload System — upload receipt after spending
 * - F8: Receipt Verification Logic UI — Ops verifies receipts
 * - F9: Receipt Reminder Timeline — visual timeline of reminder stages
 */
import { useState, useCallback } from "react";
import PageSection from "../../../components/layout/PageSection";
import Card from "../../../components/ui/Card";
import Grid from "../../../components/layout/Grid";
import MetricCard from "../../../components/ui/MetricCard";
import StatusBadge from "../../../shared/ui/StatusBadge";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import DataTable from "../../../shared/ui/DataTable";
import FormField from "../../../shared/ui/FormField";
import useFormValidation from "../../../shared/hooks/useFormValidation";
import * as receiptStore from "../../../shared/services/receiptStore";
import * as approvalStore from "../../../shared/services/approvalStore";
import * as userStore from "../../../shared/services/userStore";
import * as notificationStore from "../../../shared/services/notificationStore";
import useRole from "../../../hooks/useRole";
import { isOperationalRole } from "../../../config/roles";

const STATUS_VARIANT = {
  AWAITING_RECEIPT: "warning",
  UPLOADED: "info",
  VERIFIED: "success",
  DISCREPANCY: "danger",
  ESCALATED: "purple",
};

const STATUS_LABEL = {
  AWAITING_RECEIPT: "Awaiting Receipt",
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
  DISCREPANCY: "Discrepancy",
  ESCALATED: "Escalated",
};

function resolveUser(roleKey) {
  const users = userStore.getUsersByRole(roleKey);
  return users.length > 0 ? users[0] : null;
}

export default function ReceiptsPage() {
  useDocumentTitle("Receipts");
  const { role } = useRole();
  const [receipts, setReceipts] = useState(() => receiptStore.listReceipts());
  const reload = useCallback(() => setReceipts(receiptStore.listReceipts()), []);

  const awaitingCount = receipts.filter((r) => r.verificationStatus === "AWAITING_RECEIPT").length;
  const uploadedCount = receipts.filter((r) => r.verificationStatus === "UPLOADED").length;
  const verifiedCount = receipts.filter((r) => r.verificationStatus === "VERIFIED").length;
  const discrepancyCount = receipts.filter((r) => r.verificationStatus === "DISCREPANCY" || r.verificationStatus === "ESCALATED").length;

  const isOps = isOperationalRole(role);

  return (
    <div>
      <PageSection title="Receipts" subtitle="Post-spending accountability and receipt tracking">
        <Grid cols={4}>
          <MetricCard label="Awaiting Receipt" value={awaitingCount} />
          <MetricCard label="Uploaded" value={uploadedCount} />
          <MetricCard label="Verified" value={verifiedCount} />
          <MetricCard label="Issues" value={discrepancyCount} />
        </Grid>
      </PageSection>

      {/* F7: Upload panel for executives */}
      {role === "executive" && (
        <PageSection title="Upload Receipt" subtitle="Submit receipt for an approved fund request">
          <UploadReceiptPanel onUploaded={reload} role={role} />
        </PageSection>
      )}

      {/* F8: Verification panel for CTO/COO */}
      {isOps && (
        <PageSection title="Verify Receipts" subtitle="Review uploaded receipts for accuracy">
          <Grid cols={1}>
            {receipts
              .filter((r) => r.verificationStatus === "UPLOADED")
              .map((r) => (
                <VerifyReceiptCard key={r.id} receipt={r} onVerified={reload} role={role} />
              ))}
            {receipts.filter((r) => r.verificationStatus === "UPLOADED").length === 0 && (
              <Card><p className="text-sm text-gray-500">No receipts awaiting verification.</p></Card>
            )}
          </Grid>
        </PageSection>
      )}

      {/* F9: Receipt Reminder Timeline */}
      <PageSection title="Receipt Timeline" subtitle="Reminder stages for pending receipts">
        <Grid cols={1}>
          {receipts
            .filter((r) => r.verificationStatus === "AWAITING_RECEIPT")
            .map((r) => (
              <ReminderTimelineCard key={r.id} receipt={r} />
            ))}
          {receipts.filter((r) => r.verificationStatus === "AWAITING_RECEIPT").length === 0 && (
            <Card><p className="text-sm text-gray-500">No pending receipts.</p></Card>
          )}
        </Grid>
      </PageSection>

      {/* All receipts table */}
      <PageSection title="All Receipts" subtitle="Complete receipt ledger">
        <DataTable
          columns={[
            {
              key: "verificationStatus", label: "Status",
              render: (v) => <StatusBadge variant={STATUS_VARIANT[v] || "neutral"}>{STATUS_LABEL[v] || v}</StatusBadge>,
            },
            { key: "vendorName", label: "Vendor" },
            { key: "actualAmount", label: "Amount", render: (v) => v != null ? `GHS ${Number(v).toLocaleString()}` : "—" },
            { key: "fileName", label: "File", render: (v) => v || "—" },
            { key: "receiptDate", label: "Receipt Date", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
            { key: "authorizedAt", label: "Authorized", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
          ]}
          data={receipts}
          pageSize={10}
          emptyText="No receipts found."
        />
      </PageSection>
    </div>
  );
}

/**
 * F7: Upload receipt for an awaiting placeholder
 */
function UploadReceiptPanel({ onUploaded }) {
  const awaitingReceipts = receiptStore.getPendingReceipts().filter(
    (r) => r.verificationStatus === "AWAITING_RECEIPT"
  );
  const [selectedId, setSelectedId] = useState("");

  const rules = {
    vendorName: (v) => (!v ? "Vendor name is required" : null),
    actualAmount: (v) => (!v || Number(v) <= 0 ? "Valid amount is required" : null),
    receiptDate: (v) => (!v ? "Receipt date is required" : null),
    fileName: (v) => (!v ? "File name is required" : null),
  };

  const { values, errors, touched, handleChange, validate, reset } = useFormValidation(
    { vendorName: "", actualAmount: "", receiptDate: "", fileName: "" },
    rules
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate() || !selectedId) return;
      receiptStore.uploadReceipt(selectedId, {
        fileName: values.fileName,
        vendorName: values.vendorName,
        actualAmount: Number(values.actualAmount),
        receiptDate: values.receiptDate,
      });
      const reviewerUsers = [resolveUser("cto"), resolveUser("coo")].filter(Boolean);
      reviewerUsers.forEach((reviewerUser) => {
        notificationStore.createNotification({
          toUserId: reviewerUser.id,
          type: "RECEIPT_UPLOADED",
          message: `Receipt uploaded for verification — GHS ${Number(values.actualAmount).toLocaleString()}.`,
        });
      });
      reset();
      setSelectedId("");
      onUploaded();
    },
    [validate, values, selectedId, reset, onUploaded]
  );

  if (awaitingReceipts.length === 0) {
    return <Card><p className="text-sm text-gray-500">No receipts awaiting upload.</p></Card>;
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Select Receipt Placeholder" required>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            <option value="">Select…</option>
            {awaitingReceipts.map((r) => {
              const appr = approvalStore.getApprovalById(r.approvalId);
              return (
                <option key={r.id} value={r.id}>
                  {appr?.title || r.approvalId} — Authorized{" "}
                  {new Date(r.authorizedAt).toLocaleDateString()}
                </option>
              );
            })}
          </select>
        </FormField>
        <Grid cols={2}>
          <FormField
            label="Vendor Name"
            name="vendorName"
            required
            value={values.vendorName}
            onChange={handleChange}
            error={touched.vendorName ? errors.vendorName : null}
          />
          <FormField
            label="Actual Amount (GHS)"
            name="actualAmount"
            type="number"
            required
            value={values.actualAmount}
            onChange={handleChange}
            error={touched.actualAmount ? errors.actualAmount : null}
          />
        </Grid>
        <Grid cols={2}>
          <FormField
            label="Receipt Date"
            name="receiptDate"
            type="date"
            required
            value={values.receiptDate}
            onChange={handleChange}
            error={touched.receiptDate ? errors.receiptDate : null}
          />
          <FormField
            label="File Name"
            name="fileName"
            required
            value={values.fileName}
            onChange={handleChange}
            error={touched.fileName ? errors.fileName : null}
            placeholder="e.g. invoice-2024-001.pdf"
          />
        </Grid>
        <button
          type="submit"
          disabled={!selectedId}
          className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Upload Receipt
        </button>
      </form>
    </Card>
  );
}

/**
 * F8: CTO/COO receipt verification card
 */
function VerifyReceiptCard({ receipt, onVerified, role }) {
  const [confirmAction, setConfirmAction] = useState(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const currentUser = resolveUser(role);
  const approval = approvalStore.getApprovalById(receipt.approvalId);

  const handleVerify = useCallback(
    (status) => {
      setBusy(true);
      receiptStore.verifyReceipt(receipt.id, {
        verifiedBy: currentUser?.id,
        status,
        notes,
      });
      if (status === "DISCREPANCY") {
        const finUser = resolveUser("finance");
        if (finUser) {
          notificationStore.createNotification({
            toUserId: finUser.id,
            type: "RECEIPT_DISCREPANCY",
            message: `Receipt discrepancy for "${approval?.title || receipt.approvalId}". Notes: ${notes}`,
          });
        }
      }
      setBusy(false);
      setConfirmAction(null);
      setNotes("");
      onVerified();
    },
    [receipt, currentUser, notes, approval, onVerified]
  );

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">{approval?.title || "Receipt"}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Vendor: {receipt.vendorName} &middot; File: {receipt.fileName}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Actual: GHS {Number(receipt.actualAmount || 0).toLocaleString()}
              {approval && <> &middot; Approved: GHS {Number(approval.amount || 0).toLocaleString()}</>}
            </p>
            {approval && receipt.actualAmount != null && receipt.actualAmount !== approval.amount && (
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Amount differs from approval by GHS {Math.abs(receipt.actualAmount - approval.amount).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <textarea
            placeholder="Verification notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded border px-2 py-1 text-xs"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmAction("VERIFIED")}
              disabled={busy}
              className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
            >
              Verify
            </button>
            <button
              onClick={() => setConfirmAction("DISCREPANCY")}
              disabled={busy}
              className="rounded bg-amber-600 px-3 py-1 text-xs text-white hover:bg-amber-700 disabled:opacity-50"
            >
              Flag Discrepancy
            </button>
            <button
              onClick={() => setConfirmAction("ESCALATED")}
              disabled={busy}
              className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
            >
              Escalate
            </button>
          </div>
        </div>
      </Card>
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction === "VERIFIED" ? "Verify Receipt" : confirmAction === "DISCREPANCY" ? "Flag Discrepancy" : "Escalate Receipt"}
        message={`Mark this receipt as "${confirmAction}"?`}
        confirmLabel="Confirm"
        variant={confirmAction === "VERIFIED" ? "accent" : "danger"}
        onConfirm={() => handleVerify(confirmAction)}
        onCancel={() => setConfirmAction(null)}
        busy={busy}
      />
    </>
  );
}

/**
 * F9: Receipt Reminder Timeline
 */
function ReminderTimelineCard({ receipt }) {
  const stage = receiptStore.calculateReminderStage(receipt.authorizedAt);
  const approval = approvalStore.getApprovalById(receipt.approvalId);
  const [now] = useState(() => Date.now());
  const daysElapsed = Math.floor(
    (now - new Date(receipt.authorizedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const stages = [
    { day: 0, label: "Authorized", reached: true },
    { day: 2, label: "Day 2 Reminder", reached: stage >= 2 },
    { day: 3, label: "Day 3 Warning", reached: stage >= 3 },
    { day: 5, label: "Day 5 Escalation", reached: stage >= 5 },
    { day: 7, label: "Day 7 Block", reached: stage >= 7 },
  ];

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold">{approval?.title || "Receipt"}</h3>
          <p className="text-xs text-gray-500">
            {daysElapsed} day{daysElapsed !== 1 ? "s" : ""} since authorization
          </p>
        </div>
        {stage >= 7 && (
          <StatusBadge variant="danger">Overdue — Funding may be blocked</StatusBadge>
        )}
        {stage >= 5 && stage < 7 && (
          <StatusBadge variant="warning">Escalated</StatusBadge>
        )}
      </div>
      <div className="flex items-center gap-0">
        {stages.map((s, i) => (
          <div key={s.day} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                  s.reached
                    ? stage >= 7
                      ? "border-red-600 bg-red-600 text-white"
                      : stage >= 5
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {s.day}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 text-center w-16 leading-tight">
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  stages[i + 1].reached ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}


