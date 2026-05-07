import apiClient from "./apiClient";

const statusMap = {
  SUBMITTED: "Pending",
  PENDING_VALIDATION: "Validating",
<<<<<<< HEAD
  VALIDATED: "Validating",
  NEED_MORE_INFO: "Validating",
  IN_REVIEW: "Investigating",
  INVESTIGATING: "Investigating",
  RESOLVING: "Resolving",
  PENDING_APPROVAL: "Resolving",
  AWAITING_APPROVAL: "Resolving",
  RESOLVED: "Resolved",
  CLOSED: "Resolved",
  REJECTED: "Rejected",
};

export const DISPLAY_STATUS = statusMap;

export const ACTIVE_STATUSES = new Set([
  "Pending",
  "Validating",
  "Investigating",
  "Resolving",
]);

export const RESOLVED_STATUSES = new Set(["Resolved"]);
export const CLOSED_STATUSES = new Set(["Resolved", "Rejected"]);

const categoryMap = {
  PRODUCT: "Product",
  SERVICE: "Service",
  DELIVERY: "Delivery",
  BILLING: "Billing",
  OTHER: "Other",
};

const priorityMap = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const EXTRA_STORAGE_KEY = "complaintExtras";

const readExtras = () => {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveExtras = (complaintId, extras) => {
  if (!complaintId) return;

  const allExtras = readExtras();
  allExtras[String(complaintId)] = extras;
  localStorage.setItem(EXTRA_STORAGE_KEY, JSON.stringify(allExtras));
};

const getMockExtras = (complaintId) => ({
  orderId: `MOCK-${String(complaintId || "0000").padStart(4, "0")}`,
  phone: "(555) 010-0000",
  evidenceFiles: ["mock-evidence-summary.pdf"],
  resolution: "",
});

const getExtras = (complaintId) => {
  const stored = readExtras()[String(complaintId)] || {};
  return {
    ...getMockExtras(complaintId),
    ...stored,
  };
=======
  INVESTIGATING: "Investigating",
  RESOLVING: "Resolving",
  RESOLVED: "Resolved",
  CLOSED: "Resolved",
  REJECTED: "Rejected",
  NEED_MORE_INFO: "Needs Info",
>>>>>>> 3e0d1dc1bd53ee4d84df56c8554c8248a80f055e
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

<<<<<<< HEAD
export const toComplaintUiModel = (c) => {
  const extras = getExtras(c.id);
  const displayCode = `CMP-${String(c.id || "").padStart(4, "0")}`;
  const status = statusMap[c.status] || c.status || "Pending";

  return {
    id: `#${displayCode}`,
    rawId: c.id,
    apiId: c.id,
    complaintCode: displayCode,
    slug: String(c.id),

    title: c.title || "",
    category: categoryMap[c.category] || c.category || "Not specified",
    rawCategory: c.category,
    department: categoryMap[c.category] || c.category || "Customer Service",
    priority: priorityMap[c.priority] || c.priority || "Medium",
    rawPriority: c.priority,
    status,
    rawStatus: c.status,
    isActive: ACTIVE_STATUSES.has(status),
    isClosed: CLOSED_STATUSES.has(status),

    orderId: extras.orderId,
    phone: extras.phone,
    description: c.description || "",
    resolution: extras.resolution,

    customerId: c.customerId,
    customer: c.customerName || "Customer",
    email: c.customerEmail || "Not available",
    initials: getInitials(c.customerName),
    avatarClassName: "bg-blue-100 text-blue-700",

    editCount: c.editCount,
    lastEditedAt: formatDate(c.lastEditedAt),
    editDeadline: formatDate(c.editDeadline),

    validatedById: c.validatedById,
    validatedByName: c.validatedByName || "Not assigned",
    assignedToId: c.assignedToId,
    assignedToName: c.assignedToName || "Not assigned",
    approvedById: c.approvedById,
    approvedByName: c.approvedByName || "Not assigned",

    submittedAt: formatDate(c.submittedAt || c.createdAt),
    date: formatDate(c.createdAt),
    createdAt: formatDate(c.createdAt),
    lastUpdated: formatDate(c.updatedAt),
    validatedAt: formatDate(c.validatedAt),
    assignedAt: formatDate(c.assignedAt),
    resolvedAt: formatDate(c.resolvedAt),

    evidence: (extras.evidenceFiles || []).map((name) => ({
      name,
      type: "Mock/local file",
    })),
  };
};

=======
>>>>>>> 3e0d1dc1bd53ee4d84df56c8554c8248a80f055e
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