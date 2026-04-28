const typeClasses = {
  status: "bg-blue-50 text-primary-container",
  message: "bg-indigo-50 text-indigo-700",
  resolution: "bg-green-50 text-green-700",
  account: "bg-slate-100 text-slate-700",
};

export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <article
      className={`rounded-[0.75rem] border p-md transition ${
        notification.unread ? "border-primary/30 bg-blue-50/50" : "border-outline-variant bg-white"
      }`}
    >
      <div className="flex gap-sm">
        <span
          className={`material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.5rem] text-[22px] ${
            typeClasses[notification.type] || typeClasses.account
          }`}
        >
          {notification.icon}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-sm">
            <div>
              <h3 className="text-h3 text-on-surface">{notification.title}</h3>
              <p className="mt-xxs text-body-md text-on-surface-variant">{notification.message}</p>
            </div>
            <span className="shrink-0 text-body-sm text-on-surface-variant">{notification.time}</span>
          </div>

          {notification.unread ? (
            <button className="mt-sm text-button text-primary hover:underline" type="button" onClick={() => onMarkRead(notification.id)}>
              Mark as read
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
