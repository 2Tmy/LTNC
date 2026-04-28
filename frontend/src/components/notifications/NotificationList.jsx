import NotificationItem from "./NotificationItem.jsx";

export default function NotificationList({ notifications, onMarkRead }) {
  if (!notifications.length) {
    return (
      <section className="rounded-[0.75rem] border border-outline-variant bg-white p-xl text-center shadow-sm">
        <span className="material-symbols-outlined text-[44px] text-outline">notifications_off</span>
        <h2 className="mt-sm text-h2 text-on-surface">No notifications</h2>
        <p className="mt-xs text-body-md text-on-surface-variant">You are all caught up.</p>
      </section>
    );
  }

  return (
    <section className="space-y-sm">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onMarkRead={onMarkRead} />
      ))}
    </section>
  );
}
