/**
 * notificationStore.js
 * localStorage-backed notification system.
 * Key: edos_notifications
 *
 * No React. Pure JS. Returns raw objects.
 */

import * as userStoreModule from "./userStore";

const KEY = "edos_notifications";

// ---------------------------------------------------------------------------
// Event emitter (synchronous, in-memory)
// ---------------------------------------------------------------------------

const listeners = new Set();

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifySubscribers() {
  listeners.forEach((fn) => {
    try { fn(); } catch { /* swallow */ }
  });
}

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
// CRUD
// ---------------------------------------------------------------------------

export function createNotification(payload) {
  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  notifySubscribers();
  return entry;
}

export function listNotificationsForUser(userId) {
  return read()
    .filter((n) => n.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function markAsRead(id) {
  const all = read();
  const idx = all.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], read: true };
  write(all);
  notifySubscribers();
  return all[idx];
}

export function markAllAsRead(userId) {
  const all = read();
  let count = 0;
  for (let i = 0; i < all.length; i++) {
    if (all[i].toUserId === userId && !all[i].read) {
      all[i] = { ...all[i], read: true };
      count++;
    }
  }
  write(all);
  notifySubscribers();
  return count;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function getUnreadCount(userId) {
  return read().filter((n) => n.toUserId === userId && !n.read).length;
}

export function getUnreadCountByRole(roleKey) {
  const users = userStoreModule.getUsersByRole(roleKey);
  if (users.length === 0) return 0;
  return getUnreadCount(users[0].id);
}
