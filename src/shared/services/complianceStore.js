/**
 * complianceStore.js
 * localStorage-backed user funding compliance registry.
 * Key: edos_user_compliance
 *
 * No React. Pure JS. Returns raw objects.
 *
 * Compliance shape:
 * {
 *   userId: string,
 *   outstandingEvidenceCount: number,
 *   outstandingReceiptCount?: number,
 *   isFundingBlocked: boolean,
 *   lastUpdated: string,
 *   flaggedReason: string
 * }
 */

import * as approvalStoreModule from "./approvalStore";
import * as receiptStoreModule from "./receiptStore";
import * as userStoreModule from "./userStore";

const KEY = "edos_user_compliance";
const OUTSTANDING_RECEIPT_STATUSES = new Set(["AWAITING_RECEIPT"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Seed (first run only)
// ---------------------------------------------------------------------------

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const users = userStoreModule.listUsers();

  const seeds = users.map((u) => ({
    userId: u.id,
    outstandingEvidenceCount: 0,
    isFundingBlocked: false,
    lastUpdated: now,
    flaggedReason: "",
  }));

  write(seeds);
}

// Auto-seed on import
seedIfEmpty();

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function listCompliance() {
  return read().map((entry) => ({
    ...entry,
    outstandingReceiptCount: getOutstandingReceiptCount(entry.userId),
  }));
}

export function getCompliance(userId) {
  const compliance = read().find((c) => c.userId === userId);
  if (!compliance) return null;

  return {
    ...compliance,
    outstandingReceiptCount: getOutstandingReceiptCount(userId),
  };
}

export function getOutstandingReceiptCount(userId) {
  const approvalIds = new Set(
    approvalStoreModule.getApprovalsByRequester(userId).map((approval) => approval.id)
  );

  return receiptStoreModule
    .listReceipts()
    .filter(
      (receipt) =>
        approvalIds.has(receipt.approvalId) &&
        OUTSTANDING_RECEIPT_STATUSES.has(receipt.verificationStatus)
    ).length;
}

export function hasOutstandingReceipts(userId) {
  return getOutstandingReceiptCount(userId) > 0;
}

export function incrementOutstanding(userId) {
  const all = read();
  const now = new Date().toISOString();
  const idx = all.findIndex((c) => c.userId === userId);

  if (idx === -1) {
    all.push({
      userId,
      outstandingEvidenceCount: 1,
      isFundingBlocked: false,
      lastUpdated: now,
      flaggedReason: "",
    });
  } else {
    all[idx] = {
      ...all[idx],
      outstandingEvidenceCount: all[idx].outstandingEvidenceCount + 1,
      lastUpdated: now,
    };
  }

  write(all);
  return all.find((c) => c.userId === userId);
}

export function clearOutstanding(userId) {
  const all = read();
  const idx = all.findIndex((c) => c.userId === userId);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    outstandingEvidenceCount: 0,
    lastUpdated: new Date().toISOString(),
  };
  write(all);
  return all[idx];
}

export function setBlocked(userId, reason) {
  const all = read();
  const now = new Date().toISOString();
  const idx = all.findIndex((c) => c.userId === userId);

  if (idx === -1) {
    all.push({
      userId,
      outstandingEvidenceCount: 0,
      isFundingBlocked: true,
      lastUpdated: now,
      flaggedReason: reason || "",
    });
  } else {
    all[idx] = {
      ...all[idx],
      isFundingBlocked: true,
      flaggedReason: reason || "",
      lastUpdated: now,
    };
  }

  write(all);
  return all.find((c) => c.userId === userId);
}

export function unblockUser(userId) {
  const all = read();
  const idx = all.findIndex((c) => c.userId === userId);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    isFundingBlocked: false,
    flaggedReason: "",
    lastUpdated: new Date().toISOString(),
  };
  write(all);
  return all[idx];
}
