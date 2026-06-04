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

export const mapBackendRoleToRouteRole = (role) =>
  role === BACKEND_ROLES.admin ? USER_ROLES.admin : USER_ROLES.customer;
