import apiClient from "./apiClient";

const statusMap = {
  SUBMITTED: "Pending",
  PENDING_VALIDATION: "Validating",
  VALIDATED: "Validating",
  NEED_MORE_INFO: "Validating",
  IN_REVIEW: "Resolving",
  INVESTIGATING: "Resolving",
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

const getDefaultExtras = () => ({
  orderId: "",
  phone: "",
  evidenceFiles: [],
  resolution: "",
});

const getExtras = (complaintId) => {
  const stored = readExtras()[String(complaintId)] || {};
  return {
    ...getDefaultExtras(),
    ...stored,
  };
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

export const toComplaintUiModel = (c) => {
  const extras = getExtras(c.id);
  const displayCode = c.complaintCode || `CMP-${String(c.id || "").padStart(4, "0")}`;
  const status = statusMap[c.status] || c.status || "Pending";

  return {
    id: `#${displayCode}`,
    rawId: c.id,
    apiId: c.id,
    complaintCode: c.complaintCode,
    slug: c.complaintCode,

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

    orderId: c.orderId || extras.orderId,
    phone: c.phone || extras.phone,
    description: c.description || "",
    resolution: c.resolution || extras.resolution,
    investigationSummary: c.investigationSummary || "",
    rootCause: c.rootCause || "",
    rejectionReason: c.rejectionReason || "",

    customerId: c.customerId,
    customer: c.customerName || "Customer",
    email: c.customerEmail || "Not available",
    initials: getInitials(c.customerName),
    avatarClassName: "bg-blue-100 text-blue-700",

    editCount: c.editCount ?? 0,
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

    evidence: c.evidenceAttachments?.length
      ? c.evidenceAttachments.map((attachment) => ({
          id: attachment.id,
          name: attachment.fileName,
          type: attachment.fileType,
          size: attachment.fileSize,
        }))
      : (c.evidenceFiles || extras.evidenceFiles || []).map((name) => ({
          name,
          type: c.evidenceFiles ? "Uploaded file" : "Mock/local file",
        })),
  };
};

export const createComplaint = async (payload) => {
  const formData = new FormData();
  ["title", "category", "priority", "orderId", "phone", "description"].forEach((field) => {
    formData.append(field, payload[field]);
  });
  payload.evidenceFiles.forEach((file) => formData.append("evidenceFiles", file));

  const response = await apiClient.post("/api/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const created = response.data.data;

  saveExtras(created.id, {
    orderId: payload.orderId?.trim() || "",
    phone: payload.phone?.trim() || "",
    evidenceFiles: [],
    resolution: "",
  });

  return toComplaintUiModel(created);
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

export const receiveComplaint = async (complaintId) => {
  const response = await apiClient.put(`/api/complaints/${complaintId}/receive`);
  return toComplaintUiModel(response.data.data);
};

export const validateComplaint = async (complaintId, checklist) => {
  const response = await apiClient.put(`/api/complaints/${complaintId}/validate`, checklist);
  return toComplaintUiModel(response.data.data);
};

export const rejectComplaint = async (complaintId, payload) => {
  const response = await apiClient.put(`/api/complaints/${complaintId}/reject-validation`, payload);
  return toComplaintUiModel(response.data.data);
};

export const openEvidenceFile = async (attachmentId) => {
  const viewer = window.open("", "_blank");
  try {
    const response = await apiClient.get(`/api/attachments/${attachmentId}/content`, {
      responseType: "blob",
    });
    const objectUrl = URL.createObjectURL(response.data);
    if (viewer) {
      viewer.location.href = objectUrl;
    } else {
      window.location.href = objectUrl;
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    viewer?.close();
    throw error;
  }
};

export const proposeResolution = async (complaintId, payload) => {
  const response = await apiClient.put(`/api/complaints/${complaintId}/resolution`, payload);
  return toComplaintUiModel(response.data.data);
};

export const sendComplaintResponse = async (complaintId) => {
  const response = await apiClient.put(`/api/complaints/${complaintId}/send-response`);
  return toComplaintUiModel(response.data.data);
};

export const getMonthlyComplaintVolume = async () => {
  const response = await apiClient.get("/api/complaints/statistics/monthly-volume");
  return response.data.data;
};

const FEEDBACK_KEY = "complaint_feedbacks";

export const submitFeedback = async (complaintCode, payload) => {
  const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  all[complaintCode] = { ...payload, submittedAt: new Date().toISOString() };
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
  return { success: true };
};

export const getFeedback = async (complaintCode) => {
  const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  return all[complaintCode] || null;
};

export const getAllFeedbacks = () => {
  return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
};

export const getComplaints = getAllComplaints;
