export const adminUser = {
  name: "Admin",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCILdE8Jy3Lovzgf3qbggg6eMbkGXFMM0_IlYPeo47SssEUV8gxncDTDjX9AtQFqHLTwCmIZQ0hK6va9wvaiQM9lXBXTf63pZbGLzVDLMrt-4rO-cy-N-Nd9E80RfKk0uB0rkRsKHr52jdXzUnjEFj0CCykfJxZqtiin5iSCKPj6DfclgYRJGcvXQUwH4EmHkQ-e1ltK7_wJwrJ4LF4vMAOW4vxt6x7ZhunDPDJ1pdciokKBkOX2emCM48Z0eOTTzKFf9ra6mRlRBc7",
};

export const adminComplaints = [
  {
    id: "#10234",
    initials: "JD",
    customer: "Jane Doe",
    title: "Login Issue - Password reset not working",
    status: "Pending",
    department: "IT Support",
    date: "Oct 24, 2023",
    priority: "High",
    assignee: "Maya Chen",
    avatarClassName: "bg-slate-100 text-secondary",
  },
  {
    id: "#10235",
    initials: "JS",
    customer: "John Smith",
    title: "Billing Error - Double charge",
    status: "Resolved",
    department: "Finance",
    date: "Oct 23, 2023",
    priority: "Medium",
    assignee: "Liam Tran",
    avatarClassName: "bg-blue-100 text-blue-700",
  },
  {
    id: "#10236",
    initials: "MW",
    customer: "Mike Wilson",
    title: "Feature Request - Dark mode",
    status: "Under Review",
    department: "Product",
    date: "Oct 22, 2023",
    priority: "Low",
    assignee: "Nora Patel",
    avatarClassName: "bg-amber-100 text-amber-700",
  },
  {
    id: "#10237",
    initials: "AB",
    customer: "Alice Brown",
    title: "Service Outage - East region",
    status: "Rejected",
    department: "Infrastructure",
    date: "Oct 21, 2023",
    priority: "Urgent",
    assignee: "Owen Park",
    avatarClassName: "bg-rose-100 text-rose-700",
  },
];

export const staffMembers = [
  { name: "Maya Chen", role: "Customer Service", workload: 18, status: "Available", email: "maya@company.com" },
  { name: "Liam Tran", role: "Finance Specialist", workload: 12, status: "Available", email: "liam@company.com" },
  { name: "Nora Patel", role: "Investigator", workload: 21, status: "Busy", email: "nora@company.com" },
  { name: "Owen Park", role: "Manager", workload: 9, status: "Available", email: "owen@company.com" },
];

export const users = [
  { name: "Alex Johnson", email: "my@gmail.com", role: "Customer", complaints: 5, status: "Active" },
  { name: "Jane Doe", email: "jane@example.com", role: "Customer", complaints: 2, status: "Active" },
  { name: "John Smith", email: "john@example.com", role: "Customer", complaints: 1, status: "Active" },
  { name: "Demo Admin", email: "admin@gmail.com", role: "Admin", complaints: 0, status: "Active" },
];

export const statusFlow = [
  { label: "Received", count: 156, color: "bg-slate-500" },
  { label: "Validated", count: 118, color: "bg-blue-600" },
  { label: "Investigating", count: 84, color: "bg-indigo-600" },
  { label: "Pending Approval", count: 29, color: "bg-amber-500" },
  { label: "Resolved", count: 982, color: "bg-green-600" },
];
