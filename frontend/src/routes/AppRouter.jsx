import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CustomerComplaintDetailPage from "../pages/customer/CustomerComplaintDetailPage.jsx";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage.jsx";
import MyComplaintsPage from "../pages/customer/MyComplaintsPage.jsx";
import SubmitComplaintPage from "../pages/customer/SubmitComplaintPage.jsx";
import NotFoundPage from "../pages/errors/NotFoundPage.jsx";
import UnauthorizedPage from "../pages/errors/UnauthorizedPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";
import ProfilePage from "../pages/profile/ProfilePage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import AdminDashboardPage from "../pages/admin/dashboard/AdminDashboardPage.jsx";
import ReceiveComplaintsPage from "../pages/admin/customer-service/ReceiveComplaintsPage.jsx";
import AdminComplaintDetailPage from "../pages/admin/customer-service/AdminComplaintDetailPage.jsx";
import XemXetPage from "../pages/admin/process/XemXetPage.jsx";
import XuLyPage from "../pages/admin/process/XuLyPage.jsx";
import PhanHoiPage from "../pages/admin/process/PhanHoiPage.jsx";
import AdminUsersPage from "../pages/admin/users/AdminUsersPage.jsx";
import { ProtectedRoute, RoleRedirect } from "./protectedRoutes.jsx";
import { ROUTE_PATHS, USER_ROLES } from "./routePaths.js";

export default function AppRouter() {
  return (
    <BrowserRouter>
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
          <Route path={ROUTE_PATHS.adminReceive} element={<ReceiveComplaintsPage />} />
          <Route path={ROUTE_PATHS.adminReview} element={<XemXetPage />} />
          <Route path={ROUTE_PATHS.adminProcess} element={<XuLyPage />} />
          <Route path={ROUTE_PATHS.adminResponse} element={<PhanHoiPage />} />
          <Route path={ROUTE_PATHS.adminComplaintDetail} element={<AdminComplaintDetailPage />} />
          <Route path={ROUTE_PATHS.adminUsers} element={<AdminUsersPage />} />
        </Route>

        <Route path={ROUTE_PATHS.unauthorized} element={<UnauthorizedPage />} />
        <Route path="/admin/complaints" element={<Navigate to={ROUTE_PATHS.adminReceive} replace />} />
        <Route path="/admin/complaint-status" element={<Navigate to={ROUTE_PATHS.adminProcess} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
