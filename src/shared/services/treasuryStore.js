/**
 * treasuryStore.js
 * localStorage-backed treasury balance (SINGLE ROW).
 * Key: edos_treasury
 *
 * Treasury shape: { balance: number, lastUpdated: string }
 * CRITICAL RULE: budget != treasury. This is one real-money balance.
 */

const KEY = "edos_treasury";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function seedIfEmpty() {
  const existing = read();
  if (existing) return;
  write({
    balance: 85000,
    lastUpdated: new Date().toISOString(),
  });
}

seedIfEmpty();

export function getTreasury() {
  return read() || { balance: 0, lastUpdated: new Date().toISOString() };
}

export function setBalance(amount) {
  write({ balance: amount, lastUpdated: new Date().toISOString() });
  return getTreasury();
}

export function recordExpense(amount) {
  const t = getTreasury();
  t.balance = Math.max(0, t.balance - amount);
  t.lastUpdated = new Date().toISOString();
  write(t);
  return t;
}

export function recordIncome(amount) {
  const t = getTreasury();
  t.balance += amount;
  t.lastUpdated = new Date().toISOString();
  write(t);
  return t;
}
