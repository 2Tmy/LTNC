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
  adminReceive: "/admin/tiep-nhan",
  adminReview: "/admin/xem-xet",
  adminProcess: "/admin/xu-ly",
  adminResponse: "/admin/phan-hoi",
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
