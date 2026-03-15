/**
 * receiptStore.js
 * localStorage-backed receipt tracking.
 * Key: edos_receipts
 *
 * Receipt shape:
 * {
 *   id, approvalId, fundRequestId, fileName, vendorName,
 *   actualAmount, receiptDate, verificationStatus
 *   (AWAITING_RECEIPT | UPLOADED | VERIFIED | DISCREPANCY | ESCALATED),
 *   uploadedAt, verifiedAt, verifiedBy, notes,
 *   authorizedAt (when the approval was authorized),
 *   reminderStage (0 | 2 | 3 | 5 | 7)
 * }
 */

import * as auditStore from "./auditStore";

const KEY = "edos_receipts";

function generateId() {
  return `rcpt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function listReceipts() { return read(); }

export function getReceiptByApproval(approvalId) {
  return read().find((r) => r.approvalId === approvalId) || null;
}

export function getReceiptById(id) {
  return read().find((r) => r.id === id) || null;
}

export function getPendingReceipts() {
  return read().filter((r) => r.verificationStatus === "AWAITING_RECEIPT" || r.verificationStatus === "UPLOADED");
}

export function createReceiptPlaceholder(approvalId, fundRequestId, authorizedAt) {
  const all = read();
  const existing = all.find((receipt) => receipt.approvalId === approvalId);
  if (existing) return existing;

  const entry = {
    id: generateId(),
    approvalId,
    fundRequestId,
    fileName: null,
    vendorName: "",
    actualAmount: null,
    receiptDate: null,
    verificationStatus: "AWAITING_RECEIPT",
    uploadedAt: null,
    verifiedAt: null,
    verifiedBy: null,
    notes: "",
    authorizedAt: authorizedAt || new Date().toISOString(),
    reminderStage: 0,
  };
  all.push(entry);
  write(all);
  return entry;
}

export function uploadReceipt(id, { fileName, vendorName, actualAmount, receiptDate, uploadedBy }) {
  const all = read();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    fileName,
    vendorName,
    actualAmount,
    receiptDate,
    verificationStatus: "UPLOADED",
    uploadedAt: new Date().toISOString(),
  };
  write(all);

  auditStore.createAuditEntry({
    userId: uploadedBy || null,
    category: auditStore.AUDIT_CATEGORIES.FINANCIAL_AUDIT,
    action: auditStore.FINANCIAL_AUDIT_ACTIONS.RECEIPT_UPLOADED,
    entityType: "receipt",
    entityId: all[idx].id,
    details: {
      approvalId: all[idx].approvalId,
      fundRequestId: all[idx].fundRequestId,
      vendorName,
      actualAmount,
      receiptDate,
      fileName,
    },
  });

  return all[idx];
}

export function verifyReceipt(id, { verifiedBy, status, notes }) {
  const all = read();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    verificationStatus: status || "VERIFIED",
    verifiedBy,
    verifiedAt: new Date().toISOString(),
    notes: notes || "",
  };
  write(all);

  auditStore.createAuditEntry({
    userId: verifiedBy || null,
    category: auditStore.AUDIT_CATEGORIES.FINANCIAL_AUDIT,
    action: auditStore.FINANCIAL_AUDIT_ACTIONS.RECEIPT_VERIFIED,
    entityType: "receipt",
    entityId: all[idx].id,
    details: {
      approvalId: all[idx].approvalId,
      fundRequestId: all[idx].fundRequestId,
      status: all[idx].verificationStatus,
      notes: all[idx].notes,
    },
  });

  return all[idx];
}

export function updateReminderStage(id, stage) {
  const all = read();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], reminderStage: stage };
  write(all);
  return all[idx];
}

/**
 * Calculate receipt reminder timeline stage based on days since authorization.
 */
export function calculateReminderStage(authorizedAt) {
  if (!authorizedAt) return 0;
  const days = Math.floor((Date.now() - new Date(authorizedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 7) return 7;
  if (days >= 5) return 5;
  if (days >= 3) return 3;
  if (days >= 2) return 2;
  return 0;
}
