/**
 * revenueStore.js
 * localStorage-backed revenue recording.
 * Key: edos_revenue
 *
 * Revenue shape:
 * {
 *   id, supervisor, program, productService, customerType,
 *   paymentMethod, amount, paymentStatus (INVOICE | PARTIAL | FULL),
 *   profitCategory, recordedByUserId, recordedAt
 * }
 */

import { mapLegacyPillarToSupervisor, normalizeSupervisor } from "../../utils/supervisor";

const KEY = "edos_revenue";

function generateId() {
  return `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

function migrateLegacyRevenue(entries) {
  let changed = false;

  const migrated = (entries || [])
    .map((entry) => {
      const supervisor = normalizeSupervisor(entry?.supervisor)
        || mapLegacyPillarToSupervisor(entry?.pillar);

      if (entry?.supervisor !== supervisor || "pillar" in (entry || {})) {
        changed = true;
      }

      return {
        ...entry,
        supervisor,
      };
    })
    .map((entry) => {
      const nextEntry = { ...entry };
      delete nextEntry.pillar;
      return nextEntry;
    });

  if (changed) {
    write(migrated);
  }

  return migrated;
}

function seedIfEmpty() {
  const existing = read();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  write([
    {
      id: "rev-seed-1",
      supervisor: "cto",
      program: "Digital Literacy",
      productService: "Student Training Fee",
      customerType: "Individual",
      paymentMethod: "Mobile Money",
      amount: 5000,
      paymentStatus: "FULL",
      profitCategory: "Training Fees",
      recordedByUserId: "user-finance-1",
      recordedAt: now,
    },
    {
      id: "rev-seed-2",
      supervisor: "coo",
      program: "Custom Orders",
      productService: "Product Manufacturing",
      customerType: "Business",
      paymentMethod: "Bank Transfer",
      amount: 12000,
      paymentStatus: "PARTIAL",
      profitCategory: "Product Sales",
      recordedByUserId: "user-finance-1",
      recordedAt: now,
    },
    {
      id: "rev-seed-3",
      supervisor: "cto",
      program: "SaaS Products",
      productService: "Software License",
      customerType: "Business",
      paymentMethod: "Bank Transfer",
      amount: 8000,
      paymentStatus: "FULL",
      profitCategory: "Licensing",
      recordedByUserId: "user-finance-1",
      recordedAt: now,
    },
    {
      id: "rev-seed-4",
      supervisor: "coo",
      program: "Workshop Revenue",
      productService: "Lab Access",
      customerType: "Individual",
      paymentMethod: "Cash",
      amount: 2000,
      paymentStatus: "FULL",
      profitCategory: "Services",
      recordedByUserId: "user-finance-1",
      recordedAt: now,
    },
  ]);
}

seedIfEmpty();

export const PAYMENT_STATUSES = ["INVOICE", "PARTIAL", "FULL"];
export const CUSTOMER_TYPES = ["Individual", "Business", "Government", "NGO"];
export const PAYMENT_METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Cheque"];
export const PROFIT_CATEGORIES = ["Training Fees", "Product Sales", "Licensing", "Services", "Consulting", "Grants"];

export function listRevenue() {
  return migrateLegacyRevenue(read());
}

export function getRevenueBySupervisor(supervisor) {
  const normalized = normalizeSupervisor(supervisor);
  return listRevenue().filter((entry) => entry.supervisor === normalized);
}

export function getConfirmedRevenueEntries() {
  return listRevenue().filter((entry) => entry.paymentStatus === "FULL");
}

export function getConfirmedRevenue() {
  return getConfirmedRevenueEntries().reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

export function getTotalRevenue() {
  return listRevenue().reduce((sum, entry) => sum + (entry.amount || 0), 0);
}

export function createRevenue(payload) {
  const all = listRevenue();
  const entry = {
    ...payload,
    supervisor: normalizeSupervisor(payload?.supervisor) || mapLegacyPillarToSupervisor(payload?.pillar),
    id: generateId(),
    recordedAt: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  return entry;
}

export function getRevenueByCategory() {
  const confirmed = getConfirmedRevenueEntries();
  const grouped = {};
  confirmed.forEach((entry) => {
    const category = entry.profitCategory || "Uncategorized";
    grouped[category] = (grouped[category] || 0) + entry.amount;
  });
  return grouped;
}

export function getRevenueBySupervisorSummary() {
  const confirmed = getConfirmedRevenueEntries();
  const grouped = {};
  confirmed.forEach((entry) => {
    grouped[entry.supervisor] = (grouped[entry.supervisor] || 0) + entry.amount;
  });
  return grouped;
}

export function getRevenueByProgramSummary() {
  const confirmed = getConfirmedRevenueEntries();
  const grouped = {};
  confirmed.forEach((entry) => {
    const program = entry.program || "Unassigned Program";
    grouped[program] = (grouped[program] || 0) + entry.amount;
  });
  return grouped;
}
