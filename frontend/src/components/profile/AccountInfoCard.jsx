export default function AccountInfoCard({ user }) {
  const items = [
    { label: "Account role", value: user.role || "Not available", icon: "verified_user" },
    { label: "Email", value: user.email, icon: "mail" },
    { label: "Member since", value: user.memberSince, icon: "calendar_month" },
    { label: "Open complaints", value: user.openComplaints, icon: "assignment" },
  ];

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="flex items-center gap-sm">
        <img className="h-16 w-16 rounded-full object-cover" src={user.avatarUrl} alt={`${user.name} avatar`} />
        <div className="min-w-0">
          <h2 className="truncate text-h2 text-on-surface">{user.name}</h2>
          <p className="text-body-md text-on-surface-variant">{user.email}</p>
        </div>
      </div>

      <dl className="mt-lg space-y-sm">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-sm rounded-[0.5rem] bg-slate-50 p-sm">
            <span className="material-symbols-outlined text-[22px] text-primary-container">{item.icon}</span>
            <div className="min-w-0">
              <dt className="text-body-sm text-on-surface-variant">{item.label}</dt>
              <dd className="truncate text-body-md font-medium text-on-surface">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
