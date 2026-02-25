/**
 * revenueStore.js
 * localStorage-backed revenue recording.
 * Key: edos_revenue
 *
 * Revenue shape:
 * {
 *   id, pillar, program, productService, customerType,
 *   paymentMethod, amount, paymentStatus (INVOICE | PARTIAL | FULL),
 *   profitCategory, recordedByUserId, recordedAt
 * }
 */

const KEY = "edos_revenue";

function generateId() {
  return `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
      id: "rev-seed-1",
      pillar: "Education",
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
      pillar: "Manufacturing",
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
      pillar: "Softwares",
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
      pillar: "Open Labs",
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
export const PILLARS = ["Education", "Manufacturing", "Softwares", "Open Labs"];

export function listRevenue() { return read(); }

export function getRevenueByPillar(pillar) {
  return read().filter((r) => r.pillar === pillar);
}

export function getConfirmedRevenue() {
  return read().filter((r) => r.paymentStatus === "FULL" || r.paymentStatus === "PARTIAL");
}

export function getTotalRevenue() {
  return getConfirmedRevenue().reduce((sum, r) => sum + (r.amount || 0), 0);
}

export function createRevenue(payload) {
  const all = read();
  const entry = {
    ...payload,
    id: generateId(),
    recordedAt: new Date().toISOString(),
  };
  all.push(entry);
  write(all);
  return entry;
}

export function getRevenueByCategory() {
  const confirmed = getConfirmedRevenue();
  const grouped = {};
  confirmed.forEach((r) => {
    const cat = r.profitCategory || "Uncategorized";
    grouped[cat] = (grouped[cat] || 0) + r.amount;
  });
  return grouped;
}

export function getRevenueByPillarSummary() {
  const confirmed = getConfirmedRevenue();
  const grouped = {};
  confirmed.forEach((r) => {
    grouped[r.pillar] = (grouped[r.pillar] || 0) + r.amount;
  });
  return grouped;
}
