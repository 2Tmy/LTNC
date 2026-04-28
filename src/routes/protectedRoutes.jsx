import { Navigate, Outlet } from "react-router-dom";
import { ROUTE_PATHS, USER_ROLES } from "./routePaths.js";

const getCurrentUser = () => {
  const savedRole = window.localStorage.getItem("demoRole");

  return {
    role: savedRole,
  };
};

export function ProtectedRoute({ allowedRoles }) {
  const currentUser = getCurrentUser();

  if (!currentUser.role) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />;
  }

  return <Outlet />;
}

export function RoleRedirect() {
  const currentUser = getCurrentUser();

  if (!currentUser.role) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  if (currentUser.role === USER_ROLES.admin) {
    return <Navigate to={ROUTE_PATHS.adminDashboard} replace />;
  }

  return <Navigate to={ROUTE_PATHS.customerDashboard} replace />;
}
