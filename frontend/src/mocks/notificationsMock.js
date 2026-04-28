export const mockNotifications = [
  {
    id: "notif-001",
    type: "status",
    title: "Complaint moved to investigation",
    message: "#RC-8821 is now being reviewed by an investigator.",
    time: "2 hours ago",
    unread: true,
    icon: "manage_search",
  },
  {
    id: "notif-002",
    type: "message",
    title: "Evidence received",
    message: "Your uploaded delivery confirmation was attached to the case.",
    time: "Yesterday",
    unread: true,
    icon: "attach_file",
  },
  {
    id: "notif-003",
    type: "resolution",
    title: "Complaint resolved",
    message: "#RC-8794 has been resolved. Review the resolution summary for details.",
    time: "3 days ago",
    unread: false,
    icon: "task_alt",
  },
  {
    id: "notif-004",
    type: "account",
    title: "Profile updated",
    message: "Your contact information was updated successfully.",
    time: "Last week",
    unread: false,
    icon: "person",
  },
];

export const getStoredNotifications = () => {
  try {
    const stored = window.localStorage.getItem("demoNotifications");
    return stored ? JSON.parse(stored) : mockNotifications;
  } catch {
    return mockNotifications;
  }
};

export const saveStoredNotifications = (notifications) => {
  window.localStorage.setItem("demoNotifications", JSON.stringify(notifications));
};
