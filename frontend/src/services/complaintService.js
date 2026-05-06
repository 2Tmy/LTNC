import apiClient from "./apiClient";

const statusMap = {
  SUBMITTED: "Pending",
  PENDING_VALIDATION: "Validating",
  INVESTIGATING: "Investigating",
  RESOLVING: "Resolving",
  RESOLVED: "Resolved",
  CLOSED: "Resolved",
  REJECTED: "Rejected",
  NEED_MORE_INFO: "Needs Info",
};

const formatDate = (value) => {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  if (!name) return "CU";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const toComplaintUiModel = (c) => ({
  id: `#${c.complaintCode}`,
  rawId: c.id,
  complaintCode: c.complaintCode,
  slug: c.complaintCode,

  title: c.title || "",
  category: c.category || "Not specified",
  department: c.category || "Customer Service",
  priority: c.priority || "Medium",
  status: statusMap[c.status] || c.status,
  rawStatus: c.status,

  orderId: c.orderId || "Not provided",
  phone: c.phone || "Not provided",
  description: c.description || "",
  resolution: c.resolution || "No resolution has been proposed yet.",

  customer: c.customerName || "Customer",
  email: c.customerEmail || "Not available",
  initials: getInitials(c.customerName),
  avatarClassName: "bg-blue-100 text-blue-700",

  validatedById: c.validatedById,
  validatedByName: c.validatedByName,
  validatedAt: formatDate(c.validatedAt),

  assignedToId: c.assignedToId,
  assignedToName: c.assignedToName,
  assignedAt: formatDate(c.assignedAt),

  approvedById: c.approvedById,
  approvedByName: c.approvedByName,

  editCount: c.editCount ?? 0,
  lastEditedAt: formatDate(c.lastEditedAt),
  editDeadline: formatDate(c.editDeadline),

  submittedAt: formatDate(c.submittedAt || c.createdAt),
  date: formatDate(c.submittedAt || c.createdAt),
  lastUpdated: formatDate(c.updatedAt),

  evidence: (c.evidenceFiles || []).map((name) => ({
    name,
    type: "Uploaded file",
  })),
});

export const createComplaint = async (payload) => {
  const response = await apiClient.post("/api/complaints", payload);
  return toComplaintUiModel(response.data.data);
};

export const getMyComplaints = async () => {
  const response = await apiClient.get("/api/complaints/my");
  return response.data.data.map(toComplaintUiModel);
};

export const getComplaintById = async (id) => {
  const response = await apiClient.get(`/api/complaints/${id}`);
  return response.data.data;
};

export const getComplaintByCode = async (complaintCode) => {
  const response = await apiClient.get(`/api/complaints/code/${complaintCode}`);
  return toComplaintUiModel(response.data.data);
};

export const getAllComplaints = async () => {
  const response = await apiClient.get("/api/complaints");
  return response.data.data.map(toComplaintUiModel);
};

export const getSubmittedComplaints = async () => {
  const response = await apiClient.get("/api/complaints/submitted");
  return response.data.data.map(toComplaintUiModel);
};

export const getMonthlyComplaintVolume = async () => {
  const response = await apiClient.get("/api/complaints/statistics/monthly-volume");
  return response.data.data;
};