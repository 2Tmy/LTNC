import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRedirect } from "./protectedRoutes.jsx";
import { ROUTE_PATHS, USER_ROLES } from "./routePaths.js";

const CustomerComplaintDetailPage = lazy(() => import("../pages/customer/CustomerComplaintDetailPage.jsx"));
const CustomerDashboardPage = lazy(() => import("../pages/customer/CustomerDashboardPage.jsx"));
const MyComplaintsPage = lazy(() => import("../pages/customer/MyComplaintsPage.jsx"));
const SubmitComplaintPage = lazy(() => import("../pages/customer/SubmitComplaintPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/errors/NotFoundPage.jsx"));
const UnauthorizedPage = lazy(() => import("../pages/errors/UnauthorizedPage.jsx"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx"));
const NotificationsPage = lazy(() => import("../pages/notifications/NotificationsPage.jsx"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage.jsx"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage.jsx"));
const AdminDashboardPage = lazy(() => import("../pages/admin/dashboard/AdminDashboardPage.jsx"));
const ReceiveComplaintsPage = lazy(() => import("../pages/admin/customer-service/ReceiveComplaintsPage.jsx"));
const AdminComplaintDetailPage = lazy(() => import("../pages/admin/customer-service/AdminComplaintDetailPage.jsx"));
const ValidateComplaintsPage = lazy(() => import("../pages/admin/process/ValidateComplaintsPage.jsx"));
const ProcessComplaintsPage = lazy(() => import("../pages/admin/process/ProcessComplaintsPage.jsx"));
const ResponseComplaintsPage = lazy(() => import("../pages/admin/process/ResponseComplaintsPage.jsx"));
const AdminUsersPage = lazy(() => import("../pages/admin/users/AdminUsersPage.jsx"));
const AdminComplaintsListPage = lazy(() => import("../pages/admin/complaints/AdminComplaintsListPage.jsx"));
const AnalysisPage = lazy(() => import("../pages/admin/AnalysisPage.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
      <div className="text-center">
        <span className="material-symbols-outlined animate-spin text-[36px] text-primary">
          progress_activity
        </span>
        <p className="mt-sm text-body-md text-on-surface-variant">Loading...</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path={ROUTE_PATHS.home} element={<RoleRedirect />} />
          <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />

          {/* Customer routes */}
          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.customer]} />}>
            <Route path={ROUTE_PATHS.customerDashboard} element={<CustomerDashboardPage />} />
            <Route path={ROUTE_PATHS.submitComplaint} element={<SubmitComplaintPage />} />
            <Route path={ROUTE_PATHS.myComplaints} element={<MyComplaintsPage />} />
            <Route path={ROUTE_PATHS.complaintDetail} element={<CustomerComplaintDetailPage />} />
            <Route path={ROUTE_PATHS.notifications} element={<NotificationsPage />} />
            <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.admin]} />}>
            <Route path={ROUTE_PATHS.adminDashboard} element={<AdminDashboardPage />} />
            <Route path={ROUTE_PATHS.adminAnalysis} element={<AnalysisPage />} />
            <Route path={ROUTE_PATHS.adminNotifications} element={<NotificationsPage />} />
            <Route path={ROUTE_PATHS.adminComplaintsAll} element={<AdminComplaintsListPage type="all" />} />
            <Route path={ROUTE_PATHS.adminComplaintsPending} element={<AdminComplaintsListPage type="pending" />} />
            <Route path={ROUTE_PATHS.adminComplaintsResolved} element={<AdminComplaintsListPage type="resolved" />} />
            <Route path={ROUTE_PATHS.adminComplaintsRejected} element={<AdminComplaintsListPage type="rejected" />} />
            <Route path={ROUTE_PATHS.adminReceive} element={<ReceiveComplaintsPage />} />
            <Route path={ROUTE_PATHS.adminReview} element={<ValidateComplaintsPage />} />
            <Route path={ROUTE_PATHS.adminProcess} element={<ProcessComplaintsPage />} />
            <Route path={ROUTE_PATHS.adminResponse} element={<ResponseComplaintsPage />} />
            <Route path={ROUTE_PATHS.adminComplaintDetail} element={<AdminComplaintDetailPage />} />
            <Route path={ROUTE_PATHS.adminUsers} element={<AdminUsersPage />} />
          </Route>

          <Route path={ROUTE_PATHS.unauthorized} element={<UnauthorizedPage />} />
          <Route path="/admin/complaints" element={<Navigate to={ROUTE_PATHS.adminComplaintsAll} replace />} />
          <Route path="/admin/complaint-status" element={<Navigate to={ROUTE_PATHS.adminProcess} replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
