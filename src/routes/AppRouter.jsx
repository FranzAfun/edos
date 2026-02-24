import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useRole from "../hooks/useRole";
import { permissions } from "../config/permissions";
import { roles } from "../config/roles";

import ExecutiveLayout from "../layouts/ExecutiveLayout";
import FinanceLayout from "../layouts/FinanceLayout";
import CEOLayout from "../layouts/CEOLayout";
import DeptHeadLayout from "../layouts/DeptHeadLayout";
import OperationsLayout from "../layouts/OperationsLayout";
import AdminLayout from "../layouts/AdminLayout";

import ExecutiveDashboard from "../pages/executive/ExecutiveDashboard";
import Intelligence from "../pages/executive/modules/intelligence";
import Compliance from "../pages/executive/modules/compliance";
import Reports from "../pages/executive/modules/reports";
import FinanceDashboard from "../pages/finance/FinanceDashboard";
import Treasury from "../pages/finance/modules/treasury";
import Audit from "../pages/finance/modules/audit";
import Budgets from "../pages/finance/modules/budgets";
import CEODashboard from "../pages/ceo/CEODashboard";
import Strategy from "../pages/ceo/modules/strategy";
import Oversight from "../pages/ceo/modules/oversight";
import CeoApprovalsPage from "../modules/ceo/approvals";
import FinanceApprovalsPage from "../modules/finance/approvals";
import OperationsApprovalsPage from "../modules/operations/approvals";
import DeptHeadDashboard from "../modules/dept_head/dashboard";
import OperationsDashboard from "../modules/operations/dashboard";
import AdminDashboard from "../modules/admin/dashboard";
import ExecutiveKpiPage from "../modules/executive/kpi";
import AdminKpiPage from "../modules/admin/kpi";
import AdminUsersPage from "../modules/admin/users";
import AdminBudgetsPage from "../modules/admin/budgets";
import NotificationsPage from "../modules/common/notifications";
import NotFound from "../pages/NotFound";

import RequirePermission from "./RequirePermission";

function RoleRootRedirect() {
  const { role } = useRole();
  const defaultRoute = roles[role]?.defaultRoute || "/executive";

  return <Navigate to={defaultRoute} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRootRedirect />} />

        <Route path="/executive" element={<ExecutiveLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={permissions.VIEW_EXECUTIVE_DASHBOARD}>
                <ExecutiveDashboard />
              </RequirePermission>
            }
          />
          <Route
            path="intelligence"
            element={
              <RequirePermission permission={permissions.VIEW_INTELLIGENCE}>
                <Intelligence />
              </RequirePermission>
            }
          />
          <Route
            path="compliance"
            element={
              <RequirePermission permission={permissions.VIEW_COMPLIANCE}>
                <Compliance />
              </RequirePermission>
            }
          />
          <Route
            path="reports"
            element={
              <RequirePermission permission={permissions.VIEW_REPORTS}>
                <Reports />
              </RequirePermission>
            }
          />
          <Route
            path="kpi"
            element={
              <RequirePermission permission={permissions.EXEC_VIEW_KPI}>
                <ExecutiveKpiPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/finance" element={<FinanceLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={permissions.VIEW_FINANCE_DASHBOARD}>
                <FinanceDashboard />
              </RequirePermission>
            }
          />
          <Route
            path="treasury"
            element={
              <RequirePermission permission={permissions.VIEW_TREASURY}>
                <Treasury />
              </RequirePermission>
            }
          />
          <Route
            path="audit"
            element={
              <RequirePermission permission={permissions.VIEW_AUDIT}>
                <Audit />
              </RequirePermission>
            }
          />
          <Route
            path="budgets"
            element={
              <RequirePermission permission={permissions.VIEW_BUDGETS}>
                <Budgets />
              </RequirePermission>
            }
          />
          <Route
            path="approvals"
            element={
              <RequirePermission permission={permissions.VIEW_FO_APPROVALS}>
                <FinanceApprovalsPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/ceo" element={<CEOLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={permissions.VIEW_CEO_DASHBOARD}>
                <CEODashboard />
              </RequirePermission>
            }
          />
          <Route
            path="strategy"
            element={
              <RequirePermission permission={permissions.VIEW_STRATEGY}>
                <Strategy />
              </RequirePermission>
            }
          />
          <Route
            path="oversight"
            element={
              <RequirePermission permission={permissions.VIEW_OVERSIGHT}>
                <Oversight />
              </RequirePermission>
            }
          />
          <Route
            path="approvals"
            element={
              <RequirePermission permission={permissions.VIEW_APPROVALS}>
                <CeoApprovalsPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/dept-head" element={<DeptHeadLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={permissions.VIEW_DEPT_HEAD_DASHBOARD}>
                <DeptHeadDashboard />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/operations" element={<OperationsLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={permissions.VIEW_OPERATIONS_DASHBOARD}>
                <OperationsDashboard />
              </RequirePermission>
            }
          />
          <Route
            path="approvals"
            element={
              <RequirePermission permission={permissions.VIEW_OPS_APPROVALS}>
                <OperationsApprovalsPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={
              <RequirePermission permission={permissions.VIEW_ADMIN_DASHBOARD}>
                <AdminDashboard />
              </RequirePermission>
            }
          />
          <Route
            path="kpi"
            element={
              <RequirePermission permission={permissions.ADMIN_ASSIGN_KPI}>
                <AdminKpiPage />
              </RequirePermission>
            }
          />
          <Route
            path="users"
            element={
              <RequirePermission permission={permissions.ADMIN_MANAGE_USERS}>
                <AdminUsersPage />
              </RequirePermission>
            }
          />
          <Route
            path="budgets"
            element={
              <RequirePermission permission={permissions.ADMIN_MANAGE_USERS}>
                <AdminBudgetsPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/notifications"
          element={
            <RequirePermission permission={permissions.VIEW_NOTIFICATIONS}>
              <NotificationsPage />
            </RequirePermission>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
