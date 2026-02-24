/**
 * budgetStore.js
 * localStorage-backed department budget registry.
 * Key: edos_department_budgets
 *
 * No React. Pure JS. Returns raw objects.
 *
 * Budget shape:
 * {
 *   departmentId: string,   (references departmentStore id)
 *   monthlyLimit: number,
 *   remainingLimit: number,
 *   frozen: boolean,
 *   updatedAt: string
 * }
 */

import * as departmentStoreModule from "./departmentStore";

const KEY = "edos_department_budgets";

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
  const departments = departmentStoreModule.listDepartments();

  const seeds = departments.map((dept) => ({
    departmentId: dept.id,
    monthlyLimit: 10000,
    remainingLimit: 10000,
    frozen: false,
    updatedAt: now,
  }));

  write(seeds);
}

// ---------------------------------------------------------------------------
// Migration: string-name departmentId → proper department id
// ---------------------------------------------------------------------------

function migrateDepartmentIds() {
  const all = read();
  let changed = false;

  const migrated = all.map((b) => {
    // If departmentId looks like a name (no "dept-" prefix), resolve it
    if (b.departmentId && !b.departmentId.startsWith("dept-")) {
      const dept = departmentStoreModule.getDepartmentByName(b.departmentId);
      if (dept) {
        changed = true;
        return { ...b, departmentId: dept.id };
      }
    }
    return b;
  });

  if (changed) {
    write(migrated);
  }
}

// Auto-seed then migrate on import
seedIfEmpty();
migrateDepartmentIds();

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function listBudgets() {
  return read();
}

export function getBudgetByDepartment(departmentId) {
  return read().find((b) => b.departmentId === departmentId) || null;
}

export function setMonthlyLimit(departmentId, amount) {
  const all = read();
  const now = new Date().toISOString();
  const idx = all.findIndex((b) => b.departmentId === departmentId);

  if (idx === -1) {
    // Create new entry
    all.push({
      departmentId,
      monthlyLimit: amount,
      remainingLimit: amount,
      frozen: false,
      updatedAt: now,
    });
  } else {
    all[idx] = {
      ...all[idx],
      monthlyLimit: amount,
      remainingLimit: amount,
      updatedAt: now,
    };
  }

  write(all);
  return all.find((b) => b.departmentId === departmentId);
}

export function freezeDepartment(departmentId) {
  const all = read();
  const idx = all.findIndex((b) => b.departmentId === departmentId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], frozen: true, updatedAt: new Date().toISOString() };
  write(all);
  return all[idx];
}

export function unfreezeDepartment(departmentId) {
  const all = read();
  const idx = all.findIndex((b) => b.departmentId === departmentId);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], frozen: false, updatedAt: new Date().toISOString() };
  write(all);
  return all[idx];
}
