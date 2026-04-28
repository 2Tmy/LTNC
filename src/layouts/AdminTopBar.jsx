import { useEffect, useState } from "react";
import {
  getStaffNotifications,
  markStaffNotificationsRead,
  STAFF_NOTIFICATIONS_UPDATED,
} from "../services/notificationService.js";

export default function AdminTopBar({ user }) {
  const [notifications, setNotifications] = useState(() => getStaffNotifications());
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const handleNotificationsUpdated = (event) => {
      setNotifications(event.detail || getStaffNotifications());
    };

    const handleStorage = (event) => {
      if (event.key === "staffNotifications") {
        setNotifications(getStaffNotifications());
      }
    };

    window.addEventListener(STAFF_NOTIFICATIONS_UPDATED, handleNotificationsUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(STAFF_NOTIFICATIONS_UPDATED, handleNotificationsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleToggleNotifications = () => {
    setIsOpen((current) => !current);

    if (unreadCount) {
      setNotifications(markStaffNotificationsRead());
    }
  };

  return (
    <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-slate-200 bg-white px-xl">
      <div className="flex items-center gap-md">
        <button className="text-on-surface md:hidden" type="button" aria-label="Open admin navigation">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-[28px] font-semibold leading-9 tracking-normal text-on-surface">Good morning, Admin</h1>
      </div>

      <div className="flex items-center gap-lg">
        <div className="relative">
          <button
            className="relative text-secondary hover:text-on-surface"
            type="button"
            aria-label="Notifications"
            onClick={handleToggleNotifications}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount ? (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {isOpen ? (
            <section className="absolute right-0 top-10 z-50 w-[360px] overflow-hidden rounded-[0.75rem] border border-outline-variant bg-white shadow-lg">
              <div className="border-b border-outline-variant px-md py-sm">
                <h2 className="text-h3 text-on-surface">Staff notifications</h2>
                <p className="text-body-sm text-secondary">New complaint submissions appear here.</p>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <article key={notification.id} className="border-b border-slate-100 px-md py-sm last:border-b-0">
                      <div className="flex gap-sm">
                        <span className="material-symbols-outlined mt-1 text-[20px] text-primary">assignment_late</span>
                        <div className="min-w-0">
                          <p className="text-body-md font-semibold text-on-surface">{notification.title}</p>
                          <p className="mt-xxs text-body-sm text-secondary">{notification.message}</p>
                          <p className="mt-xxs text-body-sm text-slate-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="px-md py-lg text-center">
                    <span className="material-symbols-outlined text-[36px] text-outline">notifications</span>
                    <p className="mt-xs text-body-md text-secondary">No staff notifications yet.</p>
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <button className="text-secondary hover:text-on-surface" type="button" aria-label="View controls">
          <span className="material-symbols-outlined">tune</span>
        </button>

        <img className="h-8 w-8 rounded-full object-cover" src={user.avatarUrl} alt={`${user.name} avatar`} />
      </div>
    </header>
  );
}
