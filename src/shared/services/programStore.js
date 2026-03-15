/**
 * programStore.js
 * localStorage-backed Program Registry.
 * Key: edos_programs
 *
 * Program shape:
 * {
 *   id,
 *   name,
 *   supervisor, // cto | coo
 *   createdAt,
 *   createdBy,
 *   status // active | archived
 * }
 */

import { normalizeSupervisor } from "../../utils/supervisor";

const KEY = "edos_programs";

function generateId() {
  return `prog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

function migratePrograms() {
  const programs = read();
  let changed = false;

  const migrated = programs.map((program) => {
    const supervisor = normalizeSupervisor(program.supervisor) || "coo";
    const status = program.status === "archived" ? "archived" : "active";

    if (supervisor !== program.supervisor || status !== program.status) {
      changed = true;
    }

    return {
      ...program,
      supervisor,
      status,
    };
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
      id: "prog-seed-1",
      name: "Digital Literacy Initiative",
      supervisor: "cto",
      createdAt: now,
      createdBy: "admin",
      status: "active",
    },
    {
      id: "prog-seed-2",
      name: "Raw Material Procurement",
      supervisor: "coo",
      createdAt: now,
      createdBy: "admin",
      status: "active",
    },
  ]);
}

seedIfEmpty();
migratePrograms();

export function getPrograms() {
  return read().sort((a, b) => a.name.localeCompare(b.name));
}

export function getProgramById(programId) {
  return read().find((program) => program.id === programId) || null;
}

export function createProgram(program) {
  const all = read();
  const entry = {
    id: generateId(),
    name: (program.name || "").trim(),
    supervisor: normalizeSupervisor(program.supervisor) || "coo",
    createdAt: new Date().toISOString(),
    createdBy: program.createdBy || "admin",
    status: program.status === "archived" ? "archived" : "active",
  };

  all.push(entry);
  write(all);
  return entry;
}

export function updateProgram(programId, updates) {
  const all = read();
  const idx = all.findIndex((program) => program.id === programId);
  if (idx === -1) return null;

  const next = {
    ...all[idx],
    ...updates,
  };

  if (typeof updates.name === "string") {
    next.name = updates.name.trim();
  }

  if (typeof updates.supervisor === "string") {
    next.supervisor = normalizeSupervisor(updates.supervisor) || all[idx].supervisor;
  }

  if (typeof updates.status === "string") {
    next.status = updates.status === "archived" ? "archived" : "active";
  }

  all[idx] = next;
  write(all);
  return all[idx];
}

export function archiveProgram(programId) {
  return updateProgram(programId, { status: "archived" });
}
