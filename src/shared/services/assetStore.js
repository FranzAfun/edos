/**
 * assetStore.js
 * localStorage-backed asset management.
 * Key: edos_assets
 *
 * Asset shape:
 * {
 *   id, name, category, departmentId, purchaseCost,
 *   usefulLifeYears, condition (New | Good | Fair | Poor),
 *   location, assignedToUserId, receiptId,
 *   purchaseDate, createdAt
 * }
 */

const KEY = "edos_assets";

const CATEGORIES = ["Equipment", "Furniture", "Vehicle", "Electronics", "Software", "Building", "Other"];
const CONDITIONS = ["New", "Good", "Fair", "Poor"];

function generateId() {
  return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
      id: "asset-seed-1",
      name: "Dell Latitude Laptop",
      category: "Electronics",
      departmentId: "dept-education",
      purchaseCost: 3500,
      usefulLifeYears: 4,
      condition: "Good",
      location: "Office A",
      assignedToUserId: "user-exec-1",
      receiptId: null,
      purchaseDate: "2025-06-15",
      createdAt: now,
    },
    {
      id: "asset-seed-2",
      name: "Conference Table",
      category: "Furniture",
      departmentId: "dept-exec-office",
      purchaseCost: 1200,
      usefulLifeYears: 10,
      condition: "New",
      location: "Board Room",
      assignedToUserId: null,
      receiptId: null,
      purchaseDate: "2025-11-01",
      createdAt: now,
    },
    {
      id: "asset-seed-3",
      name: "3D Printer MK3",
      category: "Equipment",
      departmentId: "dept-manufacturing",
      purchaseCost: 8000,
      usefulLifeYears: 5,
      condition: "Good",
      location: "Manufacturing Floor",
      assignedToUserId: null,
      receiptId: null,
      purchaseDate: "2024-03-20",
      createdAt: now,
    },
  ]);
}

seedIfEmpty();

export { CATEGORIES, CONDITIONS };

export function listAssets() { return read(); }

export function getAssetById(id) {
  return read().find((a) => a.id === id) || null;
}

export function getAssetsByDepartment(departmentId) {
  return read().filter((a) => a.departmentId === departmentId);
}

export function createAsset(payload) {
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

export function updateAsset(id, patch) {
  const all = read();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  write(all);
  return all[idx];
}

export function deleteAsset(id) {
  write(read().filter((a) => a.id !== id));
}

/**
 * Straight-line depreciation:
 * annual = purchaseCost / usefulLifeYears
 * age = years since purchaseDate
 * currentValue = max(0, purchaseCost - (annual * age))
 * remainingLife = max(0, usefulLifeYears - age)
 */
export function computeDepreciation(asset) {
  if (!asset.purchaseDate || !asset.usefulLifeYears || !asset.purchaseCost) {
    return { annualDepreciation: 0, currentValue: asset.purchaseCost || 0, age: 0, remainingLife: 0 };
  }
  const purchaseDate = new Date(asset.purchaseDate);
  const age = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const annual = asset.purchaseCost / asset.usefulLifeYears;
  const currentValue = Math.max(0, asset.purchaseCost - annual * age);
  const remainingLife = Math.max(0, asset.usefulLifeYears - age);

  return {
    annualDepreciation: Math.round(annual * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    age: Math.round(age * 10) / 10,
    remainingLife: Math.round(remainingLife * 10) / 10,
  };
}

export function getTotalAssetValue() {
  return read().reduce((sum, a) => {
    const dep = computeDepreciation(a);
    return sum + dep.currentValue;
  }, 0);
}

export function getAssetValueByDepartment() {
  const assets = read();
  const grouped = {};
  assets.forEach((a) => {
    const dep = computeDepreciation(a);
    grouped[a.departmentId] = (grouped[a.departmentId] || 0) + dep.currentValue;
  });
  return grouped;
}

export function getAgingAlerts() {
  return read().filter((a) => {
    const dep = computeDepreciation(a);
    return dep.remainingLife <= 1 || a.condition === "Poor";
  });
}
