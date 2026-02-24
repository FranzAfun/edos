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
 *   isFundingBlocked: boolean,
 *   lastUpdated: string,
 *   flaggedReason: string
 * }
 */

import * as userStoreModule from "./userStore";

const KEY = "edos_user_compliance";

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
  return read();
}

export function getCompliance(userId) {
  return read().find((c) => c.userId === userId) || null;
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
