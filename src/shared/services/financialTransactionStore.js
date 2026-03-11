/**
 * financialTransactionStore.js
 * localStorage-backed financial transaction ledger.
 * Key: edos_financial_transactions
 */

const KEY = "edos_financial_transactions";

function generateId() {
  return `txn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

export function listTransactions() {
  return read().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function listTransactionsByType(type) {
  return listTransactions().filter((entry) => entry.type === type);
}

export function createTransaction(payload) {
  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  all.push(entry);
  write(all);
  return entry;
}