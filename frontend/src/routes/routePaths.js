export const ROUTE_PATHS = {
  home: "/",
  login: "/login",
  register: "/register",

  // Customer
  customerDashboard: "/customer/dashboard",
  submitComplaint: "/customer/complaints/new",
  myComplaints: "/customer/complaints",
  complaintDetail: "/customer/complaints/:complaintId",
  notifications: "/customer/notifications",
  profile: "/customer/profile",

  // Admin — dashboard + 4 process steps + user management
  adminDashboard: "/admin/dashboard",
  adminAnalysis: "/admin/analysis",
  adminNotifications: "/admin/notifications",
  adminComplaintsAll: "/admin/complaints/all",
  adminComplaintsPending: "/admin/complaints/pending",
  adminComplaintsResolved: "/admin/complaints/resolved",
  adminComplaintsRejected: "/admin/complaints/rejected",
  adminReceive: "/admin/receive",
  adminReview: "/admin/validate",
  adminProcess: "/admin/process",
  adminResponse: "/admin/response",
  adminComplaintDetail: "/admin/complaints/:complaintId",
  adminUsers: "/admin/users",

  unauthorized: "/unauthorized",
};

export const USER_ROLES = {
  customer: "customer",
  admin: "admin",
};

export const BACKEND_ROLES = {
  customer: "CUSTOMER",
  admin: "ADMIN",
};

export const mapBackendRoleToRouteRole = (role) => {
  if (role === BACKEND_ROLES.admin) return USER_ROLES.admin;
  if (role === BACKEND_ROLES.customer) return USER_ROLES.customer;
  return null;
};
