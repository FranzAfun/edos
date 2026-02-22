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
  ],
};
