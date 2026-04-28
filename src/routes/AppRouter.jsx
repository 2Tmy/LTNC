import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CustomerComplaintDetailPage from "../pages/customer/CustomerComplaintDetailPage.jsx";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage.jsx";
import SubmitComplaintPage from "../pages/customer/SubmitComplaintPage.jsx";
import NotFoundPage from "../pages/errors/NotFoundPage.jsx";
import UnauthorizedPage from "../pages/errors/UnauthorizedPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";
import ProfilePage from "../pages/profile/ProfilePage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import AssignComplaintPage from "../pages/staff/customer-service/AssignComplaintPage.jsx";
import ReceiveComplaintsPage from "../pages/staff/customer-service/ReceiveComplaintsPage.jsx";
import StaffDashboardPage from "../pages/staff/dashboard/StaffDashboardPage.jsx";
import TrackingDashboardPage from "../pages/staff/dashboard/TrackingDashboardPage.jsx";
import ManagerDashboardPage from "../pages/staff/manager/ManagerDashboardPage.jsx";
import PendingApprovalsPage from "../pages/staff/manager/PendingApprovalsPage.jsx";
import { ProtectedRoute, RoleRedirect } from "./protectedRoutes.jsx";
import { ROUTE_PATHS, USER_ROLES } from "./routePaths.js";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTE_PATHS.home} element={<RoleRedirect />} />
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />

        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.customer]} />}>
          <Route path={ROUTE_PATHS.customerDashboard} element={<CustomerDashboardPage />} />
          <Route path={ROUTE_PATHS.submitComplaint} element={<SubmitComplaintPage />} />
          <Route path={ROUTE_PATHS.complaintDetail} element={<CustomerComplaintDetailPage />} />
          <Route path={ROUTE_PATHS.notifications} element={<NotificationsPage />} />
          <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.admin]} />}>
          <Route path={ROUTE_PATHS.adminDashboard} element={<StaffDashboardPage />} />
          <Route path={ROUTE_PATHS.adminComplaints} element={<ReceiveComplaintsPage />} />
          <Route path={ROUTE_PATHS.adminComplaintStatus} element={<TrackingDashboardPage />} />
          <Route path={ROUTE_PATHS.adminStaff} element={<AssignComplaintPage />} />
          <Route path={ROUTE_PATHS.adminUsers} element={<ManagerDashboardPage />} />
          <Route path={ROUTE_PATHS.adminSettings} element={<PendingApprovalsPage />} />
        </Route>

        <Route path={ROUTE_PATHS.unauthorized} element={<UnauthorizedPage />} />
        <Route path="/staff/dashboard" element={<Navigate to={ROUTE_PATHS.adminDashboard} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
