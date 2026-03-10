export const SUPERVISOR_OPTIONS = [
  { value: "cto", label: "CTO" },
  { value: "coo", label: "COO" },
];

const SUPERVISOR_LABELS = {
  cto: "CTO",
  coo: "COO",
};

const LEGACY_PILLAR_SUPERVISOR_MAP = {
  education: "cto",
  softwares: "cto",
  software: "cto",
  manufacturing: "coo",
  "open labs": "coo",
  "open_labs": "coo",
};

const LEGACY_DEPARTMENT_SUPERVISOR_MAP = {
  "dept-exec-office": "cto",
  "dept-planning": "cto",
  "dept-education": "cto",
  "dept-health": "cto",
  "dept-sys-admin": "cto",
  "dept-finance": "coo",
  "dept-manufacturing": "coo",
  "dept-operations": "coo",
};

export function normalizeSupervisor(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "cto" || normalized === "coo" ? normalized : "";
}

export function getSupervisorLabel(value) {
  return SUPERVISOR_LABELS[normalizeSupervisor(value)] || "—";
}

export function mapLegacyPillarToSupervisor(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return LEGACY_PILLAR_SUPERVISOR_MAP[normalized] || "cto";
}

export function mapLegacyDepartmentToSupervisor(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return LEGACY_DEPARTMENT_SUPERVISOR_MAP[normalized] || "cto";
}
