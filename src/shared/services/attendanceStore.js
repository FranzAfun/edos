/**
 * attendanceStore.js
 * localStorage-backed attendance tracking.
 * Key: edos_attendance
 *
 * Attendance shape:
 * { id, userId, clockIn, clockOut, date }
 */

const KEY = "edos_attendance";

function generateId() {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

export function listAttendance() { return read(); }

export function getAttendanceByUser(userId) {
  return read().filter((a) => a.userId === userId);
}

export function getAttendanceByDate(date) {
  return read().filter((a) => a.date === date);
}

export function getTodayAttendance(userId) {
  const today = new Date().toISOString().split("T")[0];
  return read().find((a) => a.userId === userId && a.date === today) || null;
}

export function clockIn(userId) {
  const today = new Date().toISOString().split("T")[0];
  const existing = getTodayAttendance(userId);
  if (existing) return existing;

  const all = read();
  const entry = {
    id: generateId(),
    userId,
    clockIn: new Date().toISOString(),
    clockOut: null,
    date: today,
  };
  all.push(entry);
  write(all);
  return entry;
}

export function clockOut(userId) {
  const today = new Date().toISOString().split("T")[0];
  const all = read();
  const idx = all.findIndex((a) => a.userId === userId && a.date === today);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], clockOut: new Date().toISOString() };
  write(all);
  return all[idx];
}

export function getParticipationRate(userId, days = 30) {
  const records = getAttendanceByUser(userId);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const recent = records.filter((r) => r.date >= cutoff);
  // Exclude weekends for workdays calculation
  let workdays = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    if (d.getDay() !== 0 && d.getDay() !== 6) workdays++;
  }
  return workdays > 0 ? Math.round((recent.length / workdays) * 100) : 0;
}
