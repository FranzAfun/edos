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
      permissions.VIEW_REPORTS,
      permissions.EXEC_VIEW_KPI,
      permissions.EXEC_SUBMIT_KPI_EVIDENCE,
      permissions.VIEW_NOTIFICATIONS
    ]
  },
  dept_head: {
    key: "dept_head",
    label: "DEPARTMENT HEAD",
    defaultRoute: "/dept-head",
    tier: 2,
    permissions: [
      permissions.VIEW_DEPT_HEAD_DASHBOARD,
      permissions.VIEW_NOTIFICATIONS
    ]
  },
  finance: {
    key: "finance",
    label: "FINANCE",
    defaultRoute: "/finance",
    tier: 3,
    permissions: [
      permissions.VIEW_FINANCE_DASHBOARD,
      permissions.VIEW_TREASURY,
      permissions.VIEW_AUDIT,
      permissions.VIEW_BUDGETS,
      permissions.VIEW_FO_APPROVALS,
      permissions.VIEW_NOTIFICATIONS
    ]
  },
  operations: {
    key: "operations",
    label: "OPERATIONS",
    defaultRoute: "/operations",
    tier: 4,
    permissions: [
      permissions.VIEW_OPERATIONS_DASHBOARD,
      permissions.VIEW_OPS_APPROVALS,
      permissions.VIEW_NOTIFICATIONS
    ]
  },
  ceo: {
    key: "ceo",
    label: "CEO",
    defaultRoute: "/ceo",
    tier: 5,
    permissions: [
      permissions.VIEW_CEO_DASHBOARD,
      permissions.VIEW_STRATEGY,
      permissions.VIEW_OVERSIGHT,
      permissions.VIEW_APPROVALS,
      permissions.VIEW_NOTIFICATIONS
    ]
  },
  admin: {
    key: "admin",
    label: "ADMIN",
    defaultRoute: "/admin",
    tier: 0,
    permissions: [
      permissions.VIEW_ADMIN_DASHBOARD,
      permissions.ADMIN_ASSIGN_KPI,
      permissions.ADMIN_GRADE_KPI,
      permissions.ADMIN_MANAGE_USERS,
      permissions.VIEW_NOTIFICATIONS
    ]
  }
};
