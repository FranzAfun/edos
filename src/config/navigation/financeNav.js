import { permissions } from "../permissions";

export default [
  {
    label: "Dashboard",
    path: "/finance",
    permission: permissions.VIEW_FINANCE_DASHBOARD
  },
  {
    label: "Treasury",
    path: "/finance/treasury",
    permission: permissions.VIEW_TREASURY
  },
  {
    label: "Audit",
    path: "/finance/audit",
    permission: permissions.VIEW_AUDIT
  },
  {
    label: "Budgets",
    path: "/finance/budgets",
    permission: permissions.VIEW_BUDGETS
  }
];
