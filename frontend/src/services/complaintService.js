import apiClient from "./apiClient";

const statusMap = {
  PENDING: "Pending",
  VALIDATING: "Validating",
  RESOLVING: "Resolving",
  RESOLVED: "Resolved",
};

export const DISPLAY_STATUS = statusMap;

export const ACTIVE_STATUSES = new Set([
  "Pending",
  "Validating",
  "Resolving",
]);

export const RESOLVED_STATUSES = new Set(["Resolved"]);

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

export const COMPLAINT_SLA_DAYS = 15;

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

const addDays = (value, days) => {
  if (!value) return null;
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};

const getDaysOpen = (submittedAt, resolvedAt) => {
  if (!submittedAt) return 0;
  const start = new Date(submittedAt);
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

const getHoursToSla = (slaDueAt) => {
  if (!slaDueAt) return null;
  return Math.ceil((slaDueAt.getTime() - Date.now()) / (1000 * 60 * 60));
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
  const displayCode = c.complaintCode || `CMP-${String(c.id || "").padStart(4, "0")}`;
  const status = statusMap[c.status] || c.status || "Pending";
  const submittedAtRaw = c.submittedAt || c.createdAt;
  const slaDueAtRaw = addDays(submittedAtRaw, COMPLAINT_SLA_DAYS);
  const daysOpen = getDaysOpen(submittedAtRaw, c.resolvedAt);
  const hoursToSla = getHoursToSla(slaDueAtRaw);
  const isOpen = c.status !== "RESOLVED";
  const isOverdue = isOpen && daysOpen > COMPLAINT_SLA_DAYS;
  const isDueSoon = isOpen && hoursToSla !== null && hoursToSla > 0 && hoursToSla <= 72;

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
    priority: c.priority ? priorityMap[c.priority] || c.priority : null,
    rawPriority: c.priority,
    status,
    rawStatus: c.status,
    validationStatus: c.validationStatus,
    isRejected: c.validationStatus === "INVALID" || Boolean(c.rejectionReason),
    isActive: ACTIVE_STATUSES.has(status),
    isClosed: RESOLVED_STATUSES.has(status),
    daysOpen,
    slaDays: COMPLAINT_SLA_DAYS,
    slaDueAt: formatDate(slaDueAtRaw),
    slaDueAtRaw,
    hoursToSla,
    submittedAtRaw,
    createdAtRaw: c.createdAt,
    resolvedAtRaw: c.resolvedAt,
    isOverdue,
    isDueSoon,

    orderId: c.orderId || "",
    phone: c.phone || "",
    description: c.description || "",
    resolution: c.resolution || "",
    investigationSummary: c.investigationSummary || "",
    rootCause: c.rootCause || "",
    rejectionReason: c.rejectionReason || "",
    feedback: c.feedback
      ? {
          ...c.feedback,
          submittedAt: formatDate(c.feedback.updatedAt || c.feedback.createdAt),
        }
      : null,

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
      : (c.evidenceFiles || []).map((name) => ({
          name,
          type: "Uploaded file",
        })),
  };
};

export const createComplaint = async (payload) => {
  const formData = new FormData();
  ["title", "category", "orderId", "phone", "description"].forEach((field) => {
    formData.append(field, payload[field]);
  });
  payload.evidenceFiles.forEach((file) => formData.append("evidenceFiles", file));

  const response = await apiClient.post("/api/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return toComplaintUiModel(response.data.data);
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

export const submitFeedback = async (complaintCode, payload) => {
  const response = await apiClient.put(`/api/complaints/${complaintCode}/feedback`, payload);
  return response.data.data;
};

export const getComplaints = getAllComplaints;
