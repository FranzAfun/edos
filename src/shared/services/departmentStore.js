/**
 * departmentStore.js
 * localStorage-backed department registry.
 * Key: edos_departments
 *
 * No React. Pure JS. Returns raw objects.
 *
 * Department shape:
 * {
 *   id: string,
 *   name: string,
 *   code: string,
 *   createdAt: string
 * }
 */

const KEY = "edos_departments";

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

const SEED_DEPARTMENTS = [
  { id: "dept-exec-office", name: "Executive Office", code: "EXEC" },
  { id: "dept-sys-admin", name: "System Administration", code: "SYSADM" },
  { id: "dept-planning", name: "Planning & Strategy", code: "PLAN" },
  { id: "dept-finance", name: "Finance", code: "FIN" },
  { id: "dept-operations", name: "Operations", code: "OPS" },
  { id: "dept-health", name: "Health", code: "HLTH" },
  { id: "dept-education", name: "Education", code: "EDU" },
  { id: "dept-manufacturing", name: "Manufacturing", code: "MFG" },
  { id: "dept-softwares", name: "Softwares", code: "SFT" },
  { id: "dept-open-labs", name: "Open Labs", code: "OLAB" },
];

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const seeds = SEED_DEPARTMENTS.map((d) => ({
    ...d,
    createdAt: now,
  }));

  write(seeds);
}

// Auto-seed on import
seedIfEmpty();

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function listDepartments() {
  return read();
}

export function getDepartmentById(id) {
  return read().find((d) => d.id === id) || null;
}

export function getDepartmentByName(name) {
  return read().find((d) => d.name === name) || null;
}
