import apiClient from "./apiClient";

const iconMap = {
  COMPLAINT_RECEIVED: "move_to_inbox",
  VALIDATION_VALID: "fact_check",
  VALIDATION_REJECTED: "cancel",
  STATUS_CHANGE: "sync_alt",
};

export const getMyNotifications = async () => {
  const response = await apiClient.get("/api/notifications/my");
  return response.data.data.map((notification) => ({
    ...notification,
    unread: !notification.read,
    time: new Date(notification.createdAt).toLocaleString(),
    icon: iconMap[notification.type] || "notifications",
    type: notification.title.toLowerCase().includes("resolved") ? "resolution" : "status",
  }));
};

export const markNotificationRead = (notificationId) =>
  apiClient.put(`/api/notifications/${notificationId}/read`);

export const markAllNotificationsRead = () =>
  apiClient.put("/api/notifications/read-all");
