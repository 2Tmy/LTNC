const STAFF_NOTIFICATION_STORAGE_KEY = "staffNotifications";
export const STAFF_NOTIFICATIONS_UPDATED = "staff-notifications-updated";

const readStoredStaffNotifications = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STAFF_NOTIFICATION_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveStoredStaffNotifications = (notifications) => {
  window.localStorage.setItem(STAFF_NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(STAFF_NOTIFICATIONS_UPDATED, { detail: notifications }));
};

export const getStaffNotifications = () => readStoredStaffNotifications();

export const createStaffComplaintSubmittedNotification = (complaint) => {
  const notification = {
    id: `staff-notification-${complaint.slug}-${Date.now()}`,
    type: "complaint_submitted",
    title: "New complaint submitted",
    message: `${complaint.customer} submitted ${complaint.id}: ${complaint.title}`,
    complaintId: complaint.id,
    complaintSlug: complaint.slug,
    createdAt: new Date().toISOString(),
    read: false,
  };

  // Replace this local adapter with an API call when staff notifications are persisted in the database.
  const notifications = [notification, ...readStoredStaffNotifications()];
  saveStoredStaffNotifications(notifications);

  return notification;
};

export const markStaffNotificationsRead = () => {
  const notifications = readStoredStaffNotifications().map((notification) => ({
    ...notification,
    read: true,
  }));

  saveStoredStaffNotifications(notifications);
  return notifications;
};
