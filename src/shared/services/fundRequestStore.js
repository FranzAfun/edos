/**
 * fundRequestStore.js
 * localStorage-backed fund request data layer.
 * Key: edos_fund_requests
 *
 * Fund Request shape:
 * {
 *   id, userId, departmentId, supervisor, programId, program, purpose,
 *   amount, vendorQuotation, expectedOutcome, attachmentName,
 *   status (PENDING_TECH_REVIEW | PENDING_FO | PENDING_CEO | APPROVED | READY_FOR_DISBURSEMENT | DISBURSED | REJECTED | REJECTED_COMPLIANCE),
 *   approvalId (linked approval),
 *   createdAt
 * }
 */

import { APPROVAL_STAGES } from "../../governance/approvalStages";
import { mapLegacyPillarToSupervisor, normalizeSupervisor } from "../../utils/supervisor";

const KEY = "edos_fund_requests";
const REJECTED_REQUEST_STATUSES = new Set(["REJECTED", "REJECTED_COMPLIANCE"]);
export const FO_FINAL_APPROVAL_LIMIT = 1000;
export const CEO_JUSTIFICATION_THRESHOLD = 3000;

export function getInitialApprovalStageForRole(roleKey) {
  if (roleKey === "finance" || roleKey === "ceo") {
    return APPROVAL_STAGES.PENDING_CEO;
  }

  if (roleKey === "cto" || roleKey === "coo") {
    return APPROVAL_STAGES.PENDING_FO;
  }

  return APPROVAL_STAGES.PENDING_TECH_REVIEW;
}

const SMALL_REQUEST_APPROVAL_PIPELINE = [
  APPROVAL_STAGES.PENDING_TECH_REVIEW,
  APPROVAL_STAGES.PENDING_FO,
  APPROVAL_STAGES.APPROVED,
];

const SENIOR_REQUEST_APPROVAL_PIPELINE = [
  APPROVAL_STAGES.PENDING_FO,
  APPROVAL_STAGES.APPROVED,
];

const SENIOR_REQUEST_CEO_PIPELINE = [
  APPROVAL_STAGES.PENDING_FO,
  APPROVAL_STAGES.PENDING_CEO,
  APPROVAL_STAGES.APPROVED,
];

const FINANCE_REQUEST_APPROVAL_PIPELINE = [
  APPROVAL_STAGES.PENDING_CEO,
  APPROVAL_STAGES.APPROVED,
];

const CEO_APPROVAL_PIPELINE = [
  APPROVAL_STAGES.PENDING_TECH_REVIEW,
  APPROVAL_STAGES.PENDING_FO,
  APPROVAL_STAGES.PENDING_CEO,
  APPROVAL_STAGES.APPROVED,
];

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

function migrateLegacyFundRequests() {
  const all = read();
  let changed = false;

  const migrated = all.map((request) => {
    const supervisor = normalizeSupervisor(request.supervisor)
      || mapLegacyPillarToSupervisor(request.pillar);

    const programId = request.programId || null;

    if (request.supervisor !== supervisor || "pillar" in request || request.programId !== programId) {
      changed = true;
    }

    return {
      ...request,
      supervisor,
      programId,
    };
  }).map((request) => {
    const nextRequest = { ...request };
    delete nextRequest.pillar;
    return nextRequest;
  });

  if (changed) {
    write(migrated);
  }
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
      supervisor: "cto",
      programId: "prog-seed-1",
      program: "Digital Literacy Initiative",
      purpose: "Purchase of 50 tablets for student training program",
      amount: 2500,
      vendorQuotation: "TechVendor Ghana Ltd - GHS 2,500",
      expectedOutcome: "50 students equipped with digital devices for Q2 program",
      attachmentName: "quotation_tablets.pdf",
      status: APPROVAL_STAGES.PENDING_TECH_REVIEW,
      approvalId: "appr-seed-1",
      createdAt: now,
    },
    {
      id: "fr-seed-2",
      userId: "user-exec-1",
      departmentId: "dept-manufacturing",
      supervisor: "coo",
      programId: "prog-seed-2",
      program: "Raw Material Procurement",
      purpose: "Monthly raw materials for production line",
      amount: 800,
      vendorQuotation: "MaterialsPlus - GHS 800",
      expectedOutcome: "Sustain production for March",
      attachmentName: null,
      status: APPROVAL_STAGES.PENDING_TECH_REVIEW,
      approvalId: null,
      createdAt: now,
    },
  ]);
}

seedIfEmpty();
migrateLegacyFundRequests();

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
  const requesterRole = payload.requesterRole || "executive";
  const entry = {
    ...payload,
    supervisor: normalizeSupervisor(payload.supervisor) || payload.supervisor || "",
    programId: payload.programId || null,
    program: payload.program || "",
    id: generateId(),
    status: getInitialApprovalStageForRole(requesterRole),
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
      !REJECTED_REQUEST_STATUSES.has(r.status)
  );
  const total = recent.reduce((sum, r) => sum + (r.amount || 0), 0);
  return { flagged: total > 3000, total, count: recent.length, requests: recent };
}

/**
 * Get approval route info based on amount.
 * UI tracker reflects the actual governance order and hides
 * the CEO stage when FO is the final approver.
 */
export function getApprovalRoute(amount, requesterRole = "executive") {
  if (requesterRole === "finance" || requesterRole === "ceo") {
    return {
      route: "CEO_ONLY",
      label: "CEO Direct Approval",
      stages: FINANCE_REQUEST_APPROVAL_PIPELINE,
    };
  }

  if (requesterRole === "cto" || requesterRole === "coo") {
    if (amount <= FO_FINAL_APPROVAL_LIMIT) {
      return {
        route: "FO_ONLY",
        label: "FO Final Approval",
        stages: SENIOR_REQUEST_APPROVAL_PIPELINE,
      };
    }

    return {
      route: amount <= CEO_JUSTIFICATION_THRESHOLD ? "FO_CEO" : "CEO_JUSTIFICATION",
      label: amount <= CEO_JUSTIFICATION_THRESHOLD ? "FO + CEO Approval" : "CEO Mandatory Justification Review",
      stages: SENIOR_REQUEST_CEO_PIPELINE,
    };
  }

  if (amount <= FO_FINAL_APPROVAL_LIMIT) {
    return {
      route: "FO_ONLY",
      label: "FO Final Approval",
      stages: SMALL_REQUEST_APPROVAL_PIPELINE,
    };
  }
  if (amount <= CEO_JUSTIFICATION_THRESHOLD) {
    return {
      route: "FO_CEO",
      label: "FO + CEO Approval",
      stages: CEO_APPROVAL_PIPELINE,
    };
  }
  return {
    route: "CEO_JUSTIFICATION",
    label: "CEO Mandatory Justification Review",
    stages: CEO_APPROVAL_PIPELINE,
  };
}

export function requiresCeoApproval(amount) {
  return Number(amount) > FO_FINAL_APPROVAL_LIMIT;
}

export function requiresCeoJustification(amount) {
  return Number(amount) > CEO_JUSTIFICATION_THRESHOLD;
}
