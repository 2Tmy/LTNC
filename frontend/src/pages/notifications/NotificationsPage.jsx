import { useEffect, useMemo, useState } from "react";
import NotificationList from "../../components/notifications/NotificationList.jsx";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import AdminSidebar from "../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../layouts/AdminTopBar.jsx";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { BACKEND_ROLES } from "../../routes/routePaths.js";
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from "../../services/notificationService.js";

export default function NotificationsPage() {
  const user = useCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const isAdmin = user.role === BACKEND_ROLES.admin;

  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => notification.unread);
    }

    return notifications;
  }, [filter, notifications]);

  const load = async () => {
    setLoadError("");
    try {
      setNotifications(await getMyNotifications());
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (notificationId) => {
    setLoadError("");
    try {
      await markNotificationRead(notificationId);
      await load();
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Unable to update this notification."
      );
    }
  };

  const handleMarkAllRead = async () => {
    setLoadError("");
    try {
      await markAllNotificationsRead();
      await load();
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Unable to update notifications."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      {isAdmin ? <AdminSidebar /> : <Sidebar user={user} />}

      <main className="min-w-0 flex-1 bg-surface">
        {isAdmin ? <AdminTopBar user={user} /> : <TopBar user={user} />}

        <div className="mx-auto w-full max-w-5xl space-y-lg p-lg">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <h1 className="text-h1 text-on-surface">Notifications</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                {isAdmin
                  ? "Review customer feedback and important complaint activity."
                  : "Track complaint updates, evidence activity, and account alerts."}
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-button text-on-surface transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={handleMarkAllRead}
              disabled={!unreadCount}
            >
              <span className="material-symbols-outlined text-[20px]">done_all</span>
              Mark all read
            </button>
          </div>

          <section className="grid grid-cols-1 gap-md sm:grid-cols-3">
            <article className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-body-sm text-on-surface-variant">Total</p>
              <p className="mt-xs text-h1 text-on-surface">{notifications.length}</p>
            </article>
            <article className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-body-sm text-on-surface-variant">Unread</p>
              <p className="mt-xs text-h1 text-primary-container">{unreadCount}</p>
            </article>
            <article className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-body-sm text-on-surface-variant">
                {isAdmin ? "Customer feedback" : "Resolved alerts"}
              </p>
              <p className="mt-xs text-h1 text-green-700">
                {
                  notifications.filter((notification) =>
                    isAdmin
                      ? notification.notificationType === "CUSTOMER_FEEDBACK"
                      : notification.type === "resolution"
                  ).length
                }
              </p>
            </article>
          </section>

          <div className="inline-flex rounded-[0.5rem] border border-outline-variant bg-white p-1 shadow-sm">
            {[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
            ].map((item) => (
              <button
                key={item.value}
                className={`rounded px-md py-xs text-button transition ${
                  filter === item.value ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-slate-50"
                }`}
                type="button"
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loadError && (
            <div className="rounded-[0.5rem] border border-red-200 bg-red-50 p-md text-body-sm text-red-700">
              {loadError}
            </div>
          )}

          {loading ? (
            <section className="rounded-[0.75rem] border border-outline-variant bg-white p-xl text-center shadow-sm">
              <span className="material-symbols-outlined animate-spin text-[32px] text-primary">
                progress_activity
              </span>
              <p className="mt-sm text-body-md text-on-surface-variant">Loading notifications...</p>
            </section>
          ) : (
            <NotificationList notifications={filteredNotifications} onMarkRead={handleMarkRead} />
          )}
        </div>
      </main>
    </div>
  );
}
