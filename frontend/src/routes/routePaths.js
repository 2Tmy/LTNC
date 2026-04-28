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
  adminStaff: "/admin/staff",
  adminUsers: "/admin/users",
  adminSettings: "/admin/settings",
  unauthorized: "/unauthorized",
};

export const USER_ROLES = {
  customer: "customer",
  admin: "admin",
};
