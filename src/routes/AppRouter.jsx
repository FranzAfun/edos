import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useRole from "../hooks/useRole";
import { permissions } from "../config/permissions";
import { roles } from "../config/roles";
import { SkeletonCard } from "../shared/ui/Skeleton";

import ExecutiveLayout from "../layouts/ExecutiveLayout";
import FinanceLayout from "../layouts/FinanceLayout";
import CEOLayout from "../layouts/CEOLayout";
import OperationsLayout from "../layouts/OperationsLayout";
import AdminLayout from "../layouts/AdminLayout";

import NotFound from "../pages/NotFound";
import RequirePermission from "./RequirePermission";

const ExecutiveDashboard = lazy(() => import("../pages/executive/ExecutiveDashboard"));
const Intelligence = lazy(() => import("../pages/executive/modules/intelligence"));
const Compliance = lazy(() => import("../pages/executive/modules/compliance"));
const FinanceDashboard = lazy(() => import("../pages/finance/FinanceDashboard"));
const CEODashboard = lazy(() => import("../pages/ceo/CEODashboard"));
const Strategy = lazy(() => import("../pages/ceo/modules/strategy"));
const Oversight = lazy(() => import("../pages/ceo/modules/oversight"));
const CeoApprovalsPage = lazy(() => import("../modules/ceo/approvals"));
const FinanceApprovalsPage = lazy(() => import("../modules/finance/approvals"));
const OperationsApprovalsPage = lazy(() => import("../modules/operations/approvals"));
const OperationsDashboard = lazy(() => import("../modules/operations/dashboard"));
const AdminDashboard = lazy(() => import("../modules/admin/dashboard"));
const ExecutiveKpiPage = lazy(() => import("../modules/executive/kpi"));
const AdminKpiPage = lazy(() => import("../modules/admin/kpi"));
const AdminUsersPage = lazy(() => import("../modules/admin/users"));
const AdminBudgetsPage = lazy(() => import("../modules/admin/budgets"));
const NotificationsPage = lazy(() => import("../modules/common/notifications"));
const FundRequestForm = lazy(() => import("../modules/executive/fund-request"));
const ReceiptsPage = lazy(() => import("../modules/common/receipts"));
const BudgetOverviewPage = lazy(() => import("../modules/common/budgets"));
const RevenuePage = lazy(() => import("../modules/finance/revenue"));
const TreasuryPage = lazy(() => import("../modules/finance/treasury"));
const ProfitLossPage = lazy(() => import("../modules/finance/profit-loss"));
const CEOIntelligencePage = lazy(() => import("../modules/ceo/intelligence"));
const SpecialContributionsPage = lazy(() => import("../modules/common/contributions"));
const AssetManagementPage = lazy(() => import("../modules/common/assets"));
const AttendancePage = lazy(() => import("../modules/common/attendance"));
const CommunicationsPage = lazy(() => import("../modules/common/communications"));
const ReportsPage = lazy(() => import("../modules/common/reports"));
const AuditTrailPage = lazy(() => import("../modules/common/audit"));
const TransparencyPage = lazy(() => import("../modules/common/transparency"));

function RoleRootRedirect() {
  const { role } = useRole();
  const defaultRoute = roles[role]?.defaultRoute || "/executive";

  return <Navigate to={defaultRoute} replace />;
}

function RoleNotificationsRedirect() {
  const { role } = useRole();
  const defaultRoute = roles[role]?.defaultRoute || "/executive";

  return <Navigate to={`${defaultRoute}/notifications`} replace />;
}

function RoleApprovalsRedirect() {
  const { role } = useRole();

  if (role === "cto" || role === "coo") {
    return <Navigate to="/operations/approvals" replace />;
  }

  if (role === "finance") {
    return <Navigate to="/finance/approvals" replace />;
  }

  if (role === "ceo") {
    return <Navigate to="/ceo/approvals" replace />;
  }

  return <Navigate to={roles[role]?.defaultRoute || "/executive"} replace />;
}

function LoadingFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<RoleRootRedirect />} />
          <Route path="/approvals" element={<RoleApprovalsRedirect />} />

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
            path="kpi/contribution"
            element={
              <RequirePermission permission={permissions.VIEW_CONTRIBUTIONS}>
                <SpecialContributionsPage />
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
          <Route path="contributions" element={<Navigate to="/executive/kpi/contribution" replace />} />
          <Route
            path="notifications"
            element={
              <RequirePermission permission={permissions.VIEW_NOTIFICATIONS}>
                <NotificationsPage />
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
          <Route
            path="notifications"
            element={
              <RequirePermission permission={permissions.VIEW_NOTIFICATIONS}>
                <NotificationsPage />
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
          <Route
            path="notifications"
            element={
              <RequirePermission permission={permissions.VIEW_NOTIFICATIONS}>
                <NotificationsPage />
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
              <RequirePermission permission={permissions.VIEW_TECH_APPROVALS}>
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
          <Route
            path="notifications"
            element={
              <RequirePermission permission={permissions.VIEW_NOTIFICATIONS}>
                <NotificationsPage />
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
          <Route
            path="notifications"
            element={
              <RequirePermission permission={permissions.VIEW_NOTIFICATIONS}>
                <NotificationsPage />
              </RequirePermission>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route
          path="/notifications"
          element={<RoleNotificationsRedirect />}
        />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
