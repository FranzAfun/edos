/**
 * specialContributionStore.js
 * localStorage-backed special KPI contributions (F15).
 * Key: edos_special_contributions
 *
 * Shape:
 * { id, userId, description, evidencePath, bonusScore,
 *   status (PENDING | REVIEWED | APPROVED | REJECTED),
 *   reviewedByUserId, reviewNote, createdAt }
 */

const KEY = "edos_special_contributions";

function generateId() {
  return `sc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

export function listContributions() { return read(); }

export function getContributionsByUser(userId) {
  return read().filter((c) => c.userId === userId);
}

export function getPendingContributions() {
  return read().filter((c) => c.status === "PENDING");
}

export function createContribution(payload) {
  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    status: "PENDING",
    bonusScore: 0,
    reviewedByUserId: null,
    reviewNote: "",
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  return entry;
}

export function reviewContribution(id, { bonusScore, reviewedByUserId, reviewNote, status }) {
  const all = read();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    bonusScore: bonusScore || 0,
    reviewedByUserId,
    reviewNote: reviewNote || "",
    status: status || "REVIEWED",
  };
  write(all);
  return all[idx];
}
