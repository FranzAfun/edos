import { permissions } from "./permissions";

export const ROLES = {
  ADMIN: "admin",
  CEO: "ceo",
  CTO: "cto",
  COO: "coo",
  FINANCE: "finance",
  EXECUTIVE: "executive"
};

export const AUTHORITY_LEVEL = {
  ADMIN: 0,
  CEO: 1,
  CTO: 2,
  COO: 2,
  FINANCE: 3,
  EXECUTIVE: 4
};

export const OPERATIONAL_ROLES = [ROLES.CTO, ROLES.COO];

export function isOperationalRole(role) {
  return OPERATIONAL_ROLES.includes(role);
}

export function getOperationalRoleLabel(role) {
  if (role === ROLES.CTO) return "CTO";
  if (role === ROLES.COO) return "COO";
  return "Operations";
}

export const roles = {
  [ROLES.EXECUTIVE]: {
    key: ROLES.EXECUTIVE,
    label: "EXECUTIVE",
    defaultRoute: "/executive",
    tier: AUTHORITY_LEVEL.EXECUTIVE,
    permissions: [
      permissions.VIEW_EXECUTIVE_DASHBOARD,
      permissions.VIEW_INTELLIGENCE,
      permissions.VIEW_COMPLIANCE,
      permissions.VIEW_REPORTS,
      permissions.EXEC_VIEW_KPI,
      permissions.EXEC_SUBMIT_KPI_EVIDENCE,
      permissions.VIEW_NOTIFICATIONS,
      permissions.VIEW_FUND_REQUEST,
      permissions.VIEW_RECEIPTS,
      permissions.VIEW_ATTENDANCE,
      permissions.VIEW_COMMUNICATIONS,
      permissions.VIEW_CONTRIBUTIONS
    ]
  },
  [ROLES.FINANCE]: {
    key: ROLES.FINANCE,
    label: "FINANCE",
    defaultRoute: "/finance",
    tier: AUTHORITY_LEVEL.FINANCE,
    permissions: [
      permissions.VIEW_FINANCE_DASHBOARD,
      permissions.VIEW_TREASURY,
      permissions.VIEW_AUDIT,
      permissions.VIEW_BUDGETS,
      permissions.VIEW_FO_APPROVALS,
      permissions.VIEW_NOTIFICATIONS,
      permissions.VIEW_REVENUE,
      permissions.VIEW_PROFIT_LOSS,
      permissions.VIEW_RECEIPTS,
      permissions.VIEW_ATTENDANCE,
      permissions.VIEW_COMMUNICATIONS,
      permissions.VIEW_REPORTS
    ]
  },
  [ROLES.CTO]: {
    key: ROLES.CTO,
    label: "CTO",
    defaultRoute: "/operations",
    tier: AUTHORITY_LEVEL.CTO,
    permissions: [
      permissions.VIEW_OPERATIONS_DASHBOARD,
      permissions.VIEW_TECH_APPROVALS,
      permissions.VIEW_NOTIFICATIONS,
      permissions.VIEW_RECEIPTS,
      permissions.VIEW_ASSETS,
      permissions.VIEW_ATTENDANCE,
      permissions.VIEW_COMMUNICATIONS,
      permissions.VIEW_CONTRIBUTIONS
    ]
  },
  [ROLES.COO]: {
    key: ROLES.COO,
    label: "COO",
    defaultRoute: "/operations",
    tier: AUTHORITY_LEVEL.COO,
    permissions: [
      permissions.VIEW_OPERATIONS_DASHBOARD,
      permissions.VIEW_TECH_APPROVALS,
      permissions.VIEW_NOTIFICATIONS,
      permissions.VIEW_RECEIPTS,
      permissions.VIEW_ASSETS,
      permissions.VIEW_ATTENDANCE,
      permissions.VIEW_COMMUNICATIONS,
      permissions.VIEW_CONTRIBUTIONS
    ]
  },
  [ROLES.CEO]: {
    key: ROLES.CEO,
    label: "CEO",
    defaultRoute: "/ceo",
    tier: AUTHORITY_LEVEL.CEO,
    permissions: [
      permissions.VIEW_CEO_DASHBOARD,
      permissions.VIEW_STRATEGY,
      permissions.VIEW_OVERSIGHT,
      permissions.VIEW_APPROVALS,
      permissions.VIEW_NOTIFICATIONS,
      permissions.VIEW_CEO_INTELLIGENCE,
      permissions.VIEW_CONTRIBUTIONS,
      permissions.VIEW_TRANSPARENCY,
      permissions.VIEW_REPORTS,
      permissions.VIEW_ATTENDANCE,
      permissions.VIEW_COMMUNICATIONS
    ]
  },
  [ROLES.ADMIN]: {
    key: ROLES.ADMIN,
    label: "ADMIN",
    defaultRoute: "/admin",
    tier: AUTHORITY_LEVEL.ADMIN,
    permissions: [
      permissions.VIEW_ADMIN_DASHBOARD,
      permissions.ADMIN_ASSIGN_KPI,
      permissions.ADMIN_GRADE_KPI,
      permissions.ADMIN_MANAGE_USERS,
      permissions.VIEW_NOTIFICATIONS,
      permissions.VIEW_ASSETS,
      permissions.VIEW_AUDIT,
      permissions.VIEW_REPORTS,
      permissions.VIEW_ATTENDANCE,
      permissions.VIEW_COMMUNICATIONS,
      permissions.VIEW_TRANSPARENCY,
      permissions.VIEW_CONTRIBUTIONS,
      permissions.VIEW_BUDGETS
    ]
  }
};
