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
import FinanceDashboard from "../pages/finance/FinanceDashboard";
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

// New module imports
import FundRequestForm from "../modules/executive/fund-request";
import ReceiptsPage from "../modules/common/receipts";
import BudgetOverviewPage from "../modules/common/budgets";
import RevenuePage from "../modules/finance/revenue";
import TreasuryPage from "../modules/finance/treasury";
import ProfitLossPage from "../modules/finance/profit-loss";
import CEOIntelligencePage from "../modules/ceo/intelligence";
import SpecialContributionsPage from "../modules/common/contributions";
import AssetManagementPage from "../modules/common/assets";
import AttendancePage from "../modules/common/attendance";
import CommunicationsPage from "../modules/common/communications";
import ReportsPage from "../modules/common/reports";
import AuditTrailPage from "../modules/common/audit";
import TransparencyPage from "../modules/common/transparency";

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
                <ReportsPage />
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
          <Route
            path="fund-request"
            element={
              <RequirePermission permission={permissions.VIEW_FUND_REQUEST}>
                <FundRequestForm />
              </RequirePermission>
            }
          />
          <Route
            path="receipts"
            element={
              <RequirePermission permission={permissions.VIEW_RECEIPTS}>
                <ReceiptsPage />
              </RequirePermission>
            }
          />
          <Route
            path="attendance"
            element={
              <RequirePermission permission={permissions.VIEW_ATTENDANCE}>
                <AttendancePage />
              </RequirePermission>
            }
          />
          <Route
            path="communications"
            element={
              <RequirePermission permission={permissions.VIEW_COMMUNICATIONS}>
                <CommunicationsPage />
              </RequirePermission>
            }
          />
          <Route
            path="contributions"
            element={
              <RequirePermission permission={permissions.VIEW_CONTRIBUTIONS}>
                <SpecialContributionsPage />
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
                <TreasuryPage />
              </RequirePermission>
            }
          />
          <Route
            path="audit"
            element={
              <RequirePermission permission={permissions.VIEW_AUDIT}>
                <AuditTrailPage />
              </RequirePermission>
            }
          />
          <Route
            path="budgets"
            element={
              <RequirePermission permission={permissions.VIEW_BUDGETS}>
                <BudgetOverviewPage />
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
          <Route
            path="revenue"
            element={
              <RequirePermission permission={permissions.VIEW_REVENUE}>
                <RevenuePage />
              </RequirePermission>
            }
          />
          <Route
            path="profit-loss"
            element={
              <RequirePermission permission={permissions.VIEW_PROFIT_LOSS}>
                <ProfitLossPage />
              </RequirePermission>
            }
          />
          <Route
            path="receipts"
            element={
              <RequirePermission permission={permissions.VIEW_RECEIPTS}>
                <ReceiptsPage />
              </RequirePermission>
            }
          />
          <Route
            path="reports"
            element={
              <RequirePermission permission={permissions.VIEW_REPORTS}>
                <ReportsPage />
              </RequirePermission>
            }
          />
          <Route
            path="attendance"
            element={
              <RequirePermission permission={permissions.VIEW_ATTENDANCE}>
                <AttendancePage />
              </RequirePermission>
            }
          />
          <Route
            path="communications"
            element={
              <RequirePermission permission={permissions.VIEW_COMMUNICATIONS}>
                <CommunicationsPage />
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
          <Route
            path="intelligence"
            element={
              <RequirePermission permission={permissions.VIEW_CEO_INTELLIGENCE}>
                <CEOIntelligencePage />
              </RequirePermission>
            }
          />
          <Route
            path="contributions"
            element={
              <RequirePermission permission={permissions.VIEW_CONTRIBUTIONS}>
                <SpecialContributionsPage />
              </RequirePermission>
            }
          />
          <Route
            path="transparency"
            element={
              <RequirePermission permission={permissions.VIEW_TRANSPARENCY}>
                <TransparencyPage />
              </RequirePermission>
            }
          />
          <Route
            path="reports"
            element={
              <RequirePermission permission={permissions.VIEW_REPORTS}>
                <ReportsPage />
              </RequirePermission>
            }
          />
          <Route
            path="attendance"
            element={
              <RequirePermission permission={permissions.VIEW_ATTENDANCE}>
                <AttendancePage />
              </RequirePermission>
            }
          />
          <Route
            path="communications"
            element={
              <RequirePermission permission={permissions.VIEW_COMMUNICATIONS}>
                <CommunicationsPage />
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
          <Route
            path="receipts"
            element={
              <RequirePermission permission={permissions.VIEW_RECEIPTS}>
                <ReceiptsPage />
              </RequirePermission>
            }
          />
          <Route
            path="attendance"
            element={
              <RequirePermission permission={permissions.VIEW_ATTENDANCE}>
                <AttendancePage />
              </RequirePermission>
            }
          />
          <Route
            path="communications"
            element={
              <RequirePermission permission={permissions.VIEW_COMMUNICATIONS}>
                <CommunicationsPage />
              </RequirePermission>
            }
          />
          <Route
            path="contributions"
            element={
              <RequirePermission permission={permissions.VIEW_CONTRIBUTIONS}>
                <SpecialContributionsPage />
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
          <Route
            path="receipts"
            element={
              <RequirePermission permission={permissions.VIEW_RECEIPTS}>
                <ReceiptsPage />
              </RequirePermission>
            }
          />
          <Route
            path="assets"
            element={
              <RequirePermission permission={permissions.VIEW_ASSETS}>
                <AssetManagementPage />
              </RequirePermission>
            }
          />
          <Route
            path="attendance"
            element={
              <RequirePermission permission={permissions.VIEW_ATTENDANCE}>
                <AttendancePage />
              </RequirePermission>
            }
          />
          <Route
            path="communications"
            element={
              <RequirePermission permission={permissions.VIEW_COMMUNICATIONS}>
                <CommunicationsPage />
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
              <RequirePermission permission={permissions.VIEW_BUDGETS}>
                <AdminBudgetsPage />
              </RequirePermission>
            }
          />
          <Route
            path="assets"
            element={
              <RequirePermission permission={permissions.VIEW_ASSETS}>
                <AssetManagementPage />
              </RequirePermission>
            }
          />
          <Route
            path="reports"
            element={
              <RequirePermission permission={permissions.VIEW_REPORTS}>
                <ReportsPage />
              </RequirePermission>
            }
          />
          <Route
            path="audit"
            element={
              <RequirePermission permission={permissions.VIEW_AUDIT}>
                <AuditTrailPage />
              </RequirePermission>
            }
          />
          <Route
            path="attendance"
            element={
              <RequirePermission permission={permissions.VIEW_ATTENDANCE}>
                <AttendancePage />
              </RequirePermission>
            }
          />
          <Route
            path="communications"
            element={
              <RequirePermission permission={permissions.VIEW_COMMUNICATIONS}>
                <CommunicationsPage />
              </RequirePermission>
            }
          />
          <Route
            path="transparency"
            element={
              <RequirePermission permission={permissions.VIEW_TRANSPARENCY}>
                <TransparencyPage />
              </RequirePermission>
            }
          />
          <Route
            path="contributions"
            element={
              <RequirePermission permission={permissions.VIEW_CONTRIBUTIONS}>
                <SpecialContributionsPage />
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
