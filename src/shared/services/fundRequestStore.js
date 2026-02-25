/**
 * fundRequestStore.js
 * localStorage-backed fund request data layer.
 * Key: edos_fund_requests
 *
 * Fund Request shape:
 * {
 *   id, userId, departmentId, pillar, program, purpose,
 *   amount, vendorQuotation, expectedOutcome, attachmentName,
 *   status (DRAFT | SUBMITTED | AUTHORIZED | AWAITING_RECEIPT | VERIFIED),
 *   approvalId (linked approval),
 *   createdAt
 * }
 */

const KEY = "edos_fund_requests";

function generateId() {
  return `fr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
      id: "fr-seed-1",
      userId: "user-exec-1",
      departmentId: "dept-education",
      pillar: "Education",
      program: "Digital Literacy Initiative",
      purpose: "Purchase of 50 tablets for student training program",
      amount: 2500,
      vendorQuotation: "TechVendor Ghana Ltd - GHS 2,500",
      expectedOutcome: "50 students equipped with digital devices for Q2 program",
      attachmentName: "quotation_tablets.pdf",
      status: "SUBMITTED",
      approvalId: "appr-seed-1",
      createdAt: now,
    },
    {
      id: "fr-seed-2",
      userId: "user-exec-1",
      departmentId: "dept-manufacturing",
      pillar: "Manufacturing",
      program: "Raw Material Procurement",
      purpose: "Monthly raw materials for production line",
      amount: 800,
      vendorQuotation: "MaterialsPlus - GHS 800",
      expectedOutcome: "Sustain production for March",
      attachmentName: null,
      status: "SUBMITTED",
      approvalId: null,
      createdAt: now,
    },
  ]);
}

seedIfEmpty();

export function listFundRequests() { return read(); }

export function getFundRequestById(id) {
  return read().find((r) => r.id === id) || null;
}

export function getFundRequestsByUser(userId) {
  return read().filter((r) => r.userId === userId);
}

export function getFundRequestsByDepartment(departmentId) {
  return read().filter((r) => r.departmentId === departmentId);
}

export function createFundRequest(payload) {
  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    status: "SUBMITTED",
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  return entry;
}

export function updateFundRequest(id, patch) {
  const all = read();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  write(all);
  return all[idx];
}

/**
 * Detect anti-bypass: multiple requests within 7 days totaling > 3000
 * from same user or department.
 */
export function detectAntiBypass(userId, departmentId) {
  const all = read();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recent = all.filter(
    (r) =>
      (r.userId === userId || r.departmentId === departmentId) &&
      r.createdAt >= sevenDaysAgo &&
      r.status !== "REJECTED"
  );
  const total = recent.reduce((sum, r) => sum + (r.amount || 0), 0);
  return { flagged: total > 3000, total, count: recent.length, requests: recent };
}

/**
 * Get approval route info based on amount.
 * 0 - 1,000: FO only
 * 1,000 - 3,000: FO + CEO
 * > 3,000: CEO mandatory justification review
 */
export function getApprovalRoute(amount) {
  if (amount <= 1000) {
    return { route: "FO_ONLY", label: "FO Approval Only", stages: ["FO"] };
  }
  if (amount <= 3000) {
    return { route: "FO_CEO", label: "FO + CEO Approval", stages: ["FO", "CEO"] };
  }
  return { route: "CEO_JUSTIFICATION", label: "CEO Mandatory Justification Review", stages: ["FO", "OPS", "CEO"] };
}
