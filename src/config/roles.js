import { permissions } from "./permissions";

export const roles = {
  executive: {
    key: "executive",
    label: "EXECUTIVE",
    defaultRoute: "/executive",
    tier: 1,
    permissions: [
      permissions.VIEW_EXECUTIVE_DASHBOARD,
      permissions.VIEW_INTELLIGENCE,
      permissions.VIEW_COMPLIANCE,
      permissions.VIEW_REPORTS
    ]
  },
  finance: {
    key: "finance",
    label: "FINANCE",
    defaultRoute: "/finance",
    tier: 2,
    permissions: [
      permissions.VIEW_FINANCE_DASHBOARD,
      permissions.VIEW_TREASURY,
      permissions.VIEW_AUDIT,
      permissions.VIEW_BUDGETS
    ]
  },
  ceo: {
    key: "ceo",
    label: "CEO",
    defaultRoute: "/ceo",
    tier: 3,
    permissions: [
      permissions.VIEW_CEO_DASHBOARD,
      permissions.VIEW_STRATEGY,
      permissions.VIEW_OVERSIGHT,
      permissions.VIEW_APPROVALS
    ]
  }
};
