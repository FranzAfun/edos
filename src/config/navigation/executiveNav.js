import { permissions } from "../permissions";

export default [
  {
    label: "Dashboard",
    path: "/executive",
    permission: permissions.VIEW_EXECUTIVE_DASHBOARD
  },
  {
    label: "Intelligence",
    path: "/executive/intelligence",
    permission: permissions.VIEW_INTELLIGENCE
  },
  {
    label: "Compliance",
    path: "/executive/compliance",
    permission: permissions.VIEW_COMPLIANCE
  },
  {
    label: "Reports",
    path: "/executive/reports",
    permission: permissions.VIEW_REPORTS
  }
];
