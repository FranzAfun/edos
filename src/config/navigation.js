import { permissions as PERMISSIONS } from "./permissions";
import { ROLES } from "./roles";

const OPERATIONAL_NAVIGATION = [
  {
    label: "Dashboard",
    path: "/operations",
    permission: PERMISSIONS.VIEW_OPERATIONS_DASHBOARD,
  },
  {
    label: "Fund Request",
    path: "/operations/fund-request",
    permission: PERMISSIONS.VIEW_FUND_REQUEST,
  },
  {
    label: "Technical Approvals",
    path: "/operations/approvals",
    permission: PERMISSIONS.VIEW_TECH_APPROVALS,
  },
  {
    label: "Receipt Verification",
    path: "/operations/receipts",
    permission: PERMISSIONS.VIEW_RECEIPTS,
  },
  {
    label: "Assets",
    path: "/operations/assets",
    permission: PERMISSIONS.VIEW_ASSETS,
  },
  {
    label: "Participation / Activity",
    path: "/operations/attendance",
    permission: PERMISSIONS.VIEW_ATTENDANCE,
  },
  {
    label: "Communications",
    path: "/operations/communications",
    permission: PERMISSIONS.VIEW_COMMUNICATIONS,
  },
  {
    label: "Notifications",
    path: "/operations/notifications",
    permission: PERMISSIONS.VIEW_NOTIFICATIONS,
  },
];

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
      label: "Fund Request",
      path: "/executive/fund-request",
      permission: PERMISSIONS.VIEW_FUND_REQUEST,
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
      label: "Receipts",
      path: "/executive/receipts",
      permission: PERMISSIONS.VIEW_RECEIPTS,
    },
    {
      label: "Attendance",
      path: "/executive/attendance",
      permission: PERMISSIONS.VIEW_ATTENDANCE,
    },
    {
      label: "Communications",
      path: "/executive/communications",
      permission: PERMISSIONS.VIEW_COMMUNICATIONS,
    },
    {
      label: "Notifications",
      path: "/executive/notifications",
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
      label: "Fund Request",
      path: "/finance/fund-request",
      permission: PERMISSIONS.VIEW_FUND_REQUEST,
    },
    {
      label: "Approvals",
      path: "/finance/approvals",
      permission: PERMISSIONS.VIEW_FO_APPROVALS,
    },
    {
      label: "Treasury",
      path: "/finance/treasury",
      permission: PERMISSIONS.VIEW_TREASURY,
    },
    {
      label: "Revenue",
      path: "/finance/revenue",
      permission: PERMISSIONS.VIEW_REVENUE,
    },
    {
      label: "Profit & Loss",
      path: "/finance/profit-loss",
      permission: PERMISSIONS.VIEW_PROFIT_LOSS,
    },
    {
      label: "Budgets",
      path: "/finance/budgets",
      permission: PERMISSIONS.VIEW_BUDGETS,
    },
    {
      label: "Receipts",
      path: "/finance/receipts",
      permission: PERMISSIONS.VIEW_RECEIPTS,
    },
    {
      label: "Reports",
      path: "/finance/reports",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      label: "Audit",
      path: "/finance/audit",
      permission: PERMISSIONS.VIEW_AUDIT,
    },
    {
      label: "Attendance",
      path: "/finance/attendance",
      permission: PERMISSIONS.VIEW_ATTENDANCE,
    },
    {
      label: "Communications",
      path: "/finance/communications",
      permission: PERMISSIONS.VIEW_COMMUNICATIONS,
    },
    {
      label: "Notifications",
      path: "/finance/notifications",
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
      label: "Approvals",
      path: "/ceo/approvals",
      permission: PERMISSIONS.VIEW_APPROVALS,
    },
    {
      label: "Financial Insights",
      path: "/ceo/intelligence",
      permission: PERMISSIONS.VIEW_CEO_INTELLIGENCE,
    },
    {
      label: "Expense Log",
      path: "/ceo/expense-log",
      permission: PERMISSIONS.VIEW_CEO_EXPENSE_LOG,
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
      label: "Reports",
      path: "/ceo/reports",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      label: "Transparency",
      path: "/ceo/transparency",
      permission: PERMISSIONS.VIEW_TRANSPARENCY,
    },
    {
      label: "Attendance",
      path: "/ceo/attendance",
      permission: PERMISSIONS.VIEW_ATTENDANCE,
    },
    {
      label: "Communications",
      path: "/ceo/communications",
      permission: PERMISSIONS.VIEW_COMMUNICATIONS,
    },
    {
      label: "Notifications",
      path: "/ceo/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],

  [ROLES.CTO]: OPERATIONAL_NAVIGATION,

  [ROLES.COO]: OPERATIONAL_NAVIGATION,

  operations: OPERATIONAL_NAVIGATION,

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
      permission: PERMISSIONS.VIEW_BUDGETS,
    },
    {
      label: "Assets",
      path: "/admin/assets",
      permission: PERMISSIONS.VIEW_ASSETS,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      permission: PERMISSIONS.VIEW_REPORTS,
    },
    {
      label: "Audit",
      path: "/admin/audit",
      permission: PERMISSIONS.VIEW_AUDIT,
    },
    {
      label: "Transparency",
      path: "/admin/transparency",
      permission: PERMISSIONS.VIEW_TRANSPARENCY,
    },
    {
      label: "Attendance",
      path: "/admin/attendance",
      permission: PERMISSIONS.VIEW_ATTENDANCE,
    },
    {
      label: "Communications",
      path: "/admin/communications",
      permission: PERMISSIONS.VIEW_COMMUNICATIONS,
    },
    {
      label: "Notifications",
      path: "/admin/notifications",
      permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    },
  ],
};
