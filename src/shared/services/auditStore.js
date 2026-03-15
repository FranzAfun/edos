/**
 * auditStore.js
 * localStorage-backed audit trail.
 * Key: edos_audit_log
 *
 * AuditEntry shape:
 * { id, userId, category, action, entityType, entityId, details (object), timestamp }
 */

const KEY = "edos_audit_log";

export const AUDIT_CATEGORIES = {
  SYSTEM_LOG: "SYSTEM_LOG",
  FINANCIAL_AUDIT: "FINANCIAL_AUDIT",
};

export const SYSTEM_LOG_ACTIONS = {
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  ROLE_CHANGED: "ROLE_CHANGED",
  FEATURE_FLAG_CHANGED: "FEATURE_FLAG_CHANGED",
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
};

export const FINANCIAL_AUDIT_ACTIONS = {
  REQUEST_CREATED: "REQUEST_CREATED",
  SUPERVISOR_APPROVED: "SUPERVISOR_APPROVED",
  FINANCE_APPROVED: "FINANCE_APPROVED",
  CEO_APPROVED: "CEO_APPROVED",
  FUNDS_DISBURSED: "FUNDS_DISBURSED",
  RECEIPT_UPLOADED: "RECEIPT_UPLOADED",
  RECEIPT_VERIFIED: "RECEIPT_VERIFIED",
  CEO_EXPENSE_RECORDED: "CEO_EXPENSE_RECORDED",
};

function generateId() {
  return `aud-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;
  const now = new Date().toISOString();
  write([
    {
      id: "aud-seed-1",
      userId: "user-cto-1",
      category: AUDIT_CATEGORIES.SYSTEM_LOG,
      action: "APPROVAL_ADVANCED",
      entityType: "approval",
      entityId: "appr-seed-2",
      details: { fromStage: "PENDING_TECH_REVIEW", toStage: "PENDING_FO", note: "Technical review passed" },
      timestamp: now,
    },
    {
      id: "aud-seed-2",
      userId: "user-admin-1",
      category: AUDIT_CATEGORIES.SYSTEM_LOG,
      action: "USER_CREATED",
      entityType: "user",
      entityId: "user-exec-1",
      details: { name: "Tunde Bakare", role: "executive" },
      timestamp: now,
    },
  ]);
}

seedIfEmpty();

export function listAuditLog() {
  return read().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getAuditByEntity(entityType, entityId) {
  return read().filter((a) => a.entityType === entityType && a.entityId === entityId);
}

export function getAuditByUser(userId) {
  return read().filter((a) => a.userId === userId);
}

export function getAuditByAction(action) {
  return read().filter((a) => a.action === action);
}

export function getAuditByCategory(category) {
  return read().filter((a) => a.category === category);
}

export function createAuditEntry(payload) {
  if (!payload?.category) {
    throw new Error("Audit category is required");
  }

  if (!Object.values(AUDIT_CATEGORIES).includes(payload.category)) {
    throw new Error(`Invalid audit category: ${payload.category}`);
  }

  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  return entry;
}
