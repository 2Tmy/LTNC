import { Navigate, Outlet } from "react-router-dom";
import { mapBackendRoleToRouteRole, ROUTE_PATHS, USER_ROLES } from "./routePaths.js";

const decodeJwtPayload = (token) => {
  const encodedPayload = token.split(".")[1];
  const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return JSON.parse(window.atob(paddedBase64));
};

const getCurrentUser = () => {
  const token = window.localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = decodeJwtPayload(token);
    if (!payload.role || (payload.exp && payload.exp * 1000 <= Date.now())) {
      return null;
    }

    return { role: mapBackendRoleToRouteRole(payload.role) };
  } catch {
    return null;
  }
};

export function ProtectedRoute({ allowedRoles }) {
  const currentUser = getCurrentUser();

  if (!currentUser?.role) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />;
  }

  return <Outlet />;
}

export function RoleRedirect() {
  const currentUser = getCurrentUser();

  if (!currentUser?.role) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  if (currentUser.role === USER_ROLES.admin) {
    return <Navigate to={ROUTE_PATHS.adminDashboard} replace />;
  }

  return <Navigate to={ROUTE_PATHS.customerDashboard} replace />;
}
