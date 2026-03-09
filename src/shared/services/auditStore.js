/**
 * auditStore.js
 * localStorage-backed audit trail.
 * Key: edos_audit_log
 *
 * AuditEntry shape:
 * { id, userId, action, entityType, entityId, details (object), timestamp }
 */

const KEY = "edos_audit_log";

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
      action: "APPROVAL_ADVANCED",
      entityType: "approval",
      entityId: "appr-seed-2",
      details: { fromStage: "PENDING_TECH_REVIEW", toStage: "PENDING_FO", note: "Technical review passed" },
      timestamp: now,
    },
    {
      id: "aud-seed-2",
      userId: "user-admin-1",
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

export function createAuditEntry(payload) {
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
