export const ROUTE_PATHS = {
  home: "/",
  login: "/login",
  register: "/register",
  customerDashboard: "/customer/dashboard",
  submitComplaint: "/customer/complaints/new",
  complaintDetail: "/customer/complaints/:complaintId",
  notifications: "/customer/notifications",
  profile: "/customer/profile",
  adminDashboard: "/admin/dashboard",
  adminComplaints: "/admin/complaints",
  adminComplaintStatus: "/admin/complaint-status",
  adminComplaintDetail: "/admin/complaints/:complaintId",
  adminStaff: "/admin/staff",
  adminUsers: "/admin/users",
  adminSettings: "/admin/settings",
  unauthorized: "/unauthorized",
};

export const USER_ROLES = {
  customer: "customer",
  admin: "admin",
};

export const BACKEND_ROLES = {
  customer: "CUSTOMER",
  customerService: "CS_STAFF",
  specialist: "SPECIALIST",
  management: "MANAGEMENT",
};

export const STAFF_BACKEND_ROLES = [
  BACKEND_ROLES.customerService,
  BACKEND_ROLES.specialist,
  BACKEND_ROLES.management,
];

export const mapBackendRoleToRouteRole = (role) =>
  STAFF_BACKEND_ROLES.includes(role) ? USER_ROLES.admin : USER_ROLES.customer;
