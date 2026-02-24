import { permissions as PERMISSIONS } from "./permissions";

/**
 * Navigation registry
 * Each item:
 * {
 *   label: string,
 *   path: string,
 *   permission?: string,
 *   roles?: string[] (optional hard restriction),
 *   children?: []
 * }
 */
export const NAVIGATION = {
  executive: [
    {
      label: "Dashboard",
      path: "/executive",
      permission: PERMISSIONS.VIEW_EXECUTIVE_DASHBOARD,
    },
    {
      label: "Intelligence",
      path: "/executive/intelligence",
      permission: PERMISSIONS.VIEW_INTELLIGENCE,
      feature: "EXEC_INTELLIGENCE_V2",
    },
    {
      label: "Compliance",
      path: "/executive/compliance",
      permission: PERMISSIONS.VIEW_COMPLIANCE,
    },
    {
      label: "Reports",
      path: "/executive/reports",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      label: "KPIs",
      path: "/executive/kpi",
      permission: PERMISSIONS.EXEC_VIEW_KPI,
      feature: "VIEW_KPI",
    },
    {
      label: "Notifications",
      path: "/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],

  finance: [
    {
      label: "Dashboard",
      path: "/finance",
      permission: PERMISSIONS.VIEW_FINANCE_DASHBOARD,
    },
    {
      label: "Treasury",
      path: "/finance/treasury",
      permission: PERMISSIONS.VIEW_TREASURY,
    },
    {
      label: "Audit",
      path: "/finance/audit",
      permission: PERMISSIONS.VIEW_AUDIT,
    },
    {
      label: "Budgets",
      path: "/finance/budgets",
      permission: PERMISSIONS.VIEW_BUDGETS,
    },
    {
      label: "Approvals",
      path: "/finance/approvals",
      permission: PERMISSIONS.VIEW_FO_APPROVALS,
    },
    {
      label: "Notifications",
      path: "/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],

  ceo: [
    {
      label: "Dashboard",
      path: "/ceo",
      permission: PERMISSIONS.VIEW_CEO_DASHBOARD,
    },
    {
      label: "Strategy",
      path: "/ceo/strategy",
      permission: PERMISSIONS.VIEW_STRATEGY,
      feature: "CEO_STRATEGIC_INSIGHT",
    },
    {
      label: "Oversight",
      path: "/ceo/oversight",
      permission: PERMISSIONS.VIEW_OVERSIGHT,
    },
    {
      label: "Approvals",
      path: "/ceo/approvals",
      permission: PERMISSIONS.VIEW_APPROVALS,
    },
    {
      label: "Notifications",
      path: "/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],

  dept_head: [
    {
      label: "Dashboard",
      path: "/dept-head",
      permission: PERMISSIONS.VIEW_DEPT_HEAD_DASHBOARD,
    },
    {
      label: "Notifications",
      path: "/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],

  operations: [
    {
      label: "Dashboard",
      path: "/operations",
      permission: PERMISSIONS.VIEW_OPERATIONS_DASHBOARD,
    },
    {
      label: "Approvals",
      path: "/operations/approvals",
      permission: PERMISSIONS.VIEW_OPS_APPROVALS,
    },
    {
      label: "Notifications",
      path: "/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],

  admin: [
    {
      label: "Dashboard",
      path: "/admin",
      permission: PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    },
    {
      label: "KPI Control",
      path: "/admin/kpi",
      permission: PERMISSIONS.ADMIN_ASSIGN_KPI,
      feature: "ASSIGN_KPI",
    },
    {
      label: "Users",
      path: "/admin/users",
      permission: PERMISSIONS.ADMIN_MANAGE_USERS,
    },
    {
      label: "Budgets",
      path: "/admin/budgets",
      permission: PERMISSIONS.ADMIN_MANAGE_USERS,
    },
    {
      label: "Notifications",
      path: "/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],
};
