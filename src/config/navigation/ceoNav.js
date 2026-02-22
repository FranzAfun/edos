import { permissions } from "../permissions";

export default [
  {
    label: "Dashboard",
    path: "/ceo",
    permission: permissions.VIEW_CEO_DASHBOARD
  },
  {
    label: "Strategy",
    path: "/ceo/strategy",
    permission: permissions.VIEW_STRATEGY
  },
  {
    label: "Oversight",
    path: "/ceo/oversight",
    permission: permissions.VIEW_OVERSIGHT
  },
  {
    label: "Approvals",
    path: "/ceo/approvals",
    permission: permissions.VIEW_APPROVALS
  }
];
