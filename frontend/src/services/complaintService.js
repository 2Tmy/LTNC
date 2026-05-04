import apiClient from "./apiClient";

const statusMap = {
  SUBMITTED: "Pending",
  RECEIVED: "Validating",
  IN_PROGRESS: "Investigating",
  RESOLVED: "Resolved",
  CLOSED: "Resolved",
  REJECTED: "Rejected",
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

  receivedById: c.receivedById,
  receivedByName: c.receivedByName,
  receivedAt: formatDate(c.receivedAt),

  submittedAt: formatDate(c.createdAt),
  date: formatDate(c.createdAt),
  lastUpdated: formatDate(c.updatedAt),

  evidence: (c.evidenceFiles || []).map((name) => ({
    name,
    type: "Uploaded file",
  })),
});

export const createComplaint = async (payload) => {
  const response = await apiClient.post("/api/complaints", payload);
  return response.data.data;
};

export const getMyComplaints = async () => {
  const response = await apiClient.get("/api/complaints/my");
  return response.data.data.map(toComplaintUiModel);
};

export const getComplaintByCode = async (complaintCode) => {
  const response = await apiClient.get(`/api/complaints/${complaintCode}`);
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

export const receiveComplaint = async (complaintCode) => {
  const response = await apiClient.put(`/api/complaints/${complaintCode}/receive`);
  return toComplaintUiModel(response.data.data);
};