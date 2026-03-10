/**
 * userStore.js
 * localStorage-backed User Registry.
 * Key: edos_users
 *
 * No React. Pure JS. Returns raw objects.
 */

import {
  mapLegacyDepartmentToSupervisor,
  normalizeSupervisor,
} from "../../utils/supervisor";

const KEY = "edos_users";
const LEGACY_REMOVED_ROLE = ["dept", "head"].join("_");

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
      supervisorRole: "",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-admin-1",
      name: "Samuel Adeyemi",
      email: "admin@edos.gov",
      authorityLevel: 0,
      roleKey: "admin",
      supervisorRole: "",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-exec-1",
      name: "Tunde Bakare",
      email: "exec1@edos.gov",
      authorityLevel: 1,
      roleKey: "executive",
      supervisorRole: "cto",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-exec-2",
      name: "Funke Adeola",
      email: "exec2@edos.gov",
      authorityLevel: 1,
      roleKey: "executive",
      supervisorRole: "coo",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-finance-1",
      name: "Amina Bello",
      email: "finance1@edos.gov",
      authorityLevel: 3,
      roleKey: "finance",
      supervisorRole: "",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-cto-1",
      name: "Chidi Nwosu",
      email: "cto@edos.gov",
      authorityLevel: 2,
      roleKey: "cto",
      supervisorRole: "",
      featureFlags: [],
      createdAt: now,
    },
    {
      id: "user-coo-1",
      name: "Halima Garba",
      email: "coo@edos.gov",
      authorityLevel: 2,
      roleKey: "coo",
      supervisorRole: "",
      featureFlags: [],
      createdAt: now,
    },
  ];

  write(seedUsers);
}

// ---------------------------------------------------------------------------
// Migration: legacy roles/fields → supervisor model
// ---------------------------------------------------------------------------

function migrateUserSupervisorModel() {
  const users = read();
  let changed = false;

  const migrated = users.map((user) => {
    const nextRoleKey = user.roleKey === LEGACY_REMOVED_ROLE ? "executive" : user.roleKey;
    const supervisorRole = nextRoleKey === "executive"
      ? normalizeSupervisor(user.supervisorRole || user.supervisor)
        || mapLegacyDepartmentToSupervisor(user.departmentId || user.department)
      : "";

    const nextUser = {
      ...user,
      roleKey: nextRoleKey,
      supervisorRole,
    };

    if ("supervisor" in nextUser) {
      delete nextUser.supervisor;
      changed = true;
    }

    if ("department" in nextUser) {
      delete nextUser.department;
      changed = true;
    }

    if (user.roleKey !== nextRoleKey || user.supervisorRole !== supervisorRole) {
      changed = true;
    }

    return nextUser;
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
      supervisorRole: "",
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
      supervisorRole: "",
      featureFlags: [],
      createdAt: now,
    });
  }

  write(nextUsers);
}

// Auto-seed then migrate on import
seedIfEmpty();
migrateUserSupervisorModel();
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
    supervisorRole: normalizeSupervisor(user.supervisorRole),
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
