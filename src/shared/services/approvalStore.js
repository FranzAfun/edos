/**
 * approvalStore.js
 * localStorage-backed approval data layer.
 * Key: edos_approvals
 *
 * No React. Pure JS. Returns raw objects.
 *
 * Approval shape:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   amount: number,
 *   sourceType: string,      // e.g. "BUDGET", "PROCUREMENT", "KPI"
 *   sourceId: string | null,
 *   supervisor?: "cto" | "coo",
 *   requestedByUserId: string,
 *   currentStage: string,    // from APPROVAL_STAGES
 *   history: [{ stage, action, userId, note, timestamp }],
 *   createdAt: string,
 * }
 */

import { APPROVAL_STAGES } from "../../governance/approvalStages";
import { getFundRequestById } from "./fundRequestStore";
import { mapLegacyPillarToSupervisor, normalizeSupervisor } from "../../utils/supervisor";

const KEY = "edos_approvals";
const LEGACY_STAGE_MAP = {
  PENDING_OPERATIONS: APPROVAL_STAGES.PENDING_TECH_REVIEW,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return `appr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function normalizeStage(stage) {
  return LEGACY_STAGE_MAP[stage] || stage;
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function migrateLegacyStages() {
  const approvals = read();
  let changed = false;

  const migrated = approvals.map((approval) => {
    const currentStage = normalizeStage(approval.currentStage);
    const linkedRequest = approval.sourceType === "FUND_REQUEST" && approval.sourceId
      ? getFundRequestById(approval.sourceId)
      : null;
    const supervisor = normalizeSupervisor(approval.supervisor)
      || normalizeSupervisor(linkedRequest?.supervisor)
      || mapLegacyPillarToSupervisor(linkedRequest?.pillar);
    const history = (approval.history || []).map((entry) => {
      const stage = normalizeStage(entry.stage);
      if (stage !== entry.stage) changed = true;
      return { ...entry, stage };
    });

    if (currentStage !== approval.currentStage) {
      changed = true;
    }

    if (approval.supervisor !== supervisor && linkedRequest) {
      changed = true;
    }

    return {
      ...approval,
      supervisor: approval.sourceType === "FUND_REQUEST" ? supervisor : approval.supervisor,
      currentStage,
      history,
    };
  });

  if (changed) {
    write(migrated);
  }
}

// ---------------------------------------------------------------------------
// Seed data (first run only)
// ---------------------------------------------------------------------------

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;

  const now = new Date().toISOString();

  const seeds = [
    {
      id: "appr-seed-1",
      title: "Q2 Infrastructure Budget Request",
      description: "Capital expenditure for server room upgrade and network modernization.",
      amount: 45000000,
      sourceType: "BUDGET",
      sourceId: null,
      requestedByUserId: "user-exec-1",
      currentStage: APPROVAL_STAGES.PENDING_TECH_REVIEW,
      history: [
        {
          stage: APPROVAL_STAGES.PENDING_TECH_REVIEW,
          action: "CREATED",
          userId: "user-exec-1",
          note: "Initial submission",
          timestamp: now,
        },
      ],
      createdAt: now,
    },
    {
      id: "appr-seed-2",
      title: "Staff Training Programme Funding",
      description: "Annual capacity building grants for field teams.",
      amount: 12000000,
      sourceType: "PROCUREMENT",
      sourceId: null,
      requestedByUserId: "user-exec-2",
      currentStage: APPROVAL_STAGES.PENDING_FO,
      history: [
        {
          stage: APPROVAL_STAGES.PENDING_TECH_REVIEW,
          action: "CREATED",
          userId: "user-exec-2",
          note: "Initial submission",
          timestamp: now,
        },
        {
          stage: APPROVAL_STAGES.PENDING_FO,
          action: "APPROVED",
          userId: "user-cto-1",
          note: "Technical review passed",
          timestamp: now,
        },
      ],
      createdAt: now,
    },
  ];

  write(seeds);
}

// Auto-seed on import
seedIfEmpty();
migrateLegacyStages();

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function listApprovals() {
  return read();
}

export function getApprovalById(id) {
  return read().find((a) => a.id === id) || null;
}

export function createApproval(payload) {
  const all = read();
  const now = new Date().toISOString();
  const initialStage = payload.initialStage || APPROVAL_STAGES.PENDING_TECH_REVIEW;
  const entry = {
    ...payload,
    supervisor: normalizeSupervisor(payload.supervisor) || payload.supervisor,
    id: generateId(),
    currentStage: initialStage,
    history: [
      {
        stage: initialStage,
        action: "CREATED",
        userId: payload.requestedByUserId,
        note: payload.note || "Initial submission",
        timestamp: now,
      },
    ],
    createdAt: now,
  };
  all.push(entry);
  write(all);
  return entry;
}

export function updateApprovalStage(id, { nextStage, action, userId, note }) {
  const all = read();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();

  all[idx] = {
    ...all[idx],
    currentStage: nextStage,
    history: [
      ...all[idx].history,
      {
        stage: nextStage,
        action,
        userId,
        note: note || "",
        timestamp: now,
      },
    ],
  };

  write(all);
  return all[idx];
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getApprovalsByStage(stage) {
  return read().filter((a) => a.currentStage === stage);
}

export function getTechReviewApprovalsForSupervisor(supervisorRole) {
  const reviewerRole = normalizeSupervisor(supervisorRole);

  return read().filter((approval) => {
    if (approval.currentStage !== APPROVAL_STAGES.PENDING_TECH_REVIEW) {
      return false;
    }

    if (!reviewerRole) {
      return true;
    }

    return normalizeSupervisor(approval.supervisor) === reviewerRole;
  });
}

export function getApprovalsByRequester(userId) {
  return read().filter((a) => a.requestedByUserId === userId);
}
