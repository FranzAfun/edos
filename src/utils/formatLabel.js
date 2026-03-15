const TOKEN_LABEL_OVERRIDES = {
  cto: "CTO",
  coo: "COO",
  ceo: "CEO",
  fo: "FO",
  kpi: "KPI",
};

export function formatTokenLabel(value, fallback = "—") {
  if (!value) return fallback;

  return String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (TOKEN_LABEL_OVERRIDES[lower]) {
        return TOKEN_LABEL_OVERRIDES[lower];
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
