/**
 * messageStore.js
 * localStorage-backed messaging/announcements.
 * Key: edos_messages
 *
 * Message shape:
 * {
 *   id, fromUserId, toUserId (null for announcements/bulk),
 *   subject, body, type (message | announcement | bulk_email),
 *   recipients (array for bulk), read, createdAt
 * }
 */

const KEY = "edos_messages";

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;
  const now = new Date().toISOString();
  write([
    {
      id: "msg-seed-1",
      fromUserId: "user-ceo-1",
      toUserId: null,
      subject: "Welcome to ERA Digital Operating System",
      body: "Welcome to EDOS. Please complete your profile setup and familiarize yourself with the platform features.",
      type: "announcement",
      recipients: [],
      read: false,
      createdAt: now,
    },
  ]);
}

seedIfEmpty();

export function listMessages() { return read(); }

export function getMessagesForUser(userId) {
  return read().filter(
    (m) => m.toUserId === userId || m.type === "announcement" || (m.recipients && m.recipients.includes(userId))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getSentMessages(userId) {
  return read().filter((m) => m.fromUserId === userId);
}

export function createMessage(payload) {
  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  return entry;
}

export function markMessageRead(id) {
  const all = read();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], read: true };
  write(all);
  return all[idx];
}

export function getAnnouncements() {
  return read().filter((m) => m.type === "announcement").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
