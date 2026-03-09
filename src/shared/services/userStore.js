/**
 * userStore.js
 * localStorage-backed User Registry.
 * Key: edos_users
 *
 * No React. Pure JS. Returns raw objects.
 */

import * as departmentStore from "./departmentStore";

const KEY = "edos_users";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
// Seed data (first run only)
// ---------------------------------------------------------------------------

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;

  const now = new Date().toISOString();

  const seedUsers = [
    {
      id: "user-ceo-1",
      name: "Jane Okafor",
      email: "ceo@edos.gov",
      authorityLevel: 5,
      roleKey: "ceo",
      departmentId: "dept-exec-office",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-admin-1",
      name: "Samuel Adeyemi",
      email: "admin@edos.gov",
      authorityLevel: 0,
      roleKey: "admin",
      departmentId: "dept-sys-admin",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-exec-1",
      name: "Tunde Bakare",
      email: "exec1@edos.gov",
      authorityLevel: 1,
      roleKey: "executive",
      departmentId: "dept-planning",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-finance-1",
      name: "Amina Bello",
      email: "finance1@edos.gov",
      authorityLevel: 3,
      roleKey: "finance",
      departmentId: "dept-finance",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-cto-1",
      name: "Chidi Nwosu",
      email: "cto@edos.gov",
      authorityLevel: 2,
      roleKey: "cto",
      departmentId: "dept-operations",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-coo-1",
      name: "Halima Garba",
      email: "coo@edos.gov",
      authorityLevel: 2,
      roleKey: "coo",
      departmentId: "dept-operations",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-depthead-1",
      name: "Funke Adeola",
      email: "depthead1@edos.gov",
      authorityLevel: 2,
      roleKey: "dept_head",
      departmentId: "dept-health",
      featureFlags: [],
      createdAt: now,
    },
  ];

  write(seedUsers);
}

// ---------------------------------------------------------------------------
// Migration: department (string) → departmentId
// ---------------------------------------------------------------------------

function migrateDepartmentField() {
  const users = read();
  let changed = false;

  const migrated = users.map((u) => {
    if (u.department && !u.departmentId) {
      const dept = departmentStore.getDepartmentByName(u.department);
      if (dept) {
        const { department: _removed, ...rest } = u;
        changed = true;
        return { ...rest, departmentId: dept.id };
      }
    }
    return u;
  });

  if (changed) {
    write(migrated);
  }
}

function ensureTechnicalReviewUsers() {
  const users = read();
  const existingRoles = new Set(users.map((user) => user.roleKey));
  if (existingRoles.has("cto") && existingRoles.has("coo")) return;

  const now = new Date().toISOString();
  const nextUsers = [...users];

  if (!existingRoles.has("cto")) {
    nextUsers.push({
      id: "user-cto-1",
      name: "Chidi Nwosu",
      email: "cto@edos.gov",
      authorityLevel: 2,
      roleKey: "cto",
      departmentId: "dept-operations",
      featureFlags: [],
      createdAt: now,
    });
  }

  if (!existingRoles.has("coo")) {
    nextUsers.push({
      id: "user-coo-1",
      name: "Halima Garba",
      email: "coo@edos.gov",
      authorityLevel: 2,
      roleKey: "coo",
      departmentId: "dept-operations",
      featureFlags: [],
      createdAt: now,
    });
  }

  write(nextUsers);
}

// Auto-seed then migrate on import
seedIfEmpty();
migrateDepartmentField();
ensureTechnicalReviewUsers();

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function listUsers() {
  return read();
}

export function getUserById(id) {
  return read().find((u) => u.id === id) || null;
}

export function createUser(user) {
  const users = read();
  const newUser = {
    ...user,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  write(users);
  return newUser;
}

export function updateUser(id, patch) {
  const users = read();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  write(users);
  return users[idx];
}

export function deleteUser(id) {
  const users = read().filter((u) => u.id !== id);
  write(users);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getUsersByRole(roleKey) {
  return read().filter((u) => u.roleKey === roleKey);
}

export function getUsersByAuthorityLevel(level) {
  return read().filter((u) => u.authorityLevel === level);
}
