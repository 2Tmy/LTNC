const defaultCards = [
  {
    label: "Assigned cases",
    value: "18",
    helperText: "6 due today",
    icon: "assignment_ind",
    iconClassName: "bg-blue-50 text-blue-700",
  },
  {
    label: "Pending validation",
    value: "7",
    helperText: "Needs first review",
    icon: "fact_check",
    iconClassName: "bg-amber-50 text-amber-700",
  },
  {
    label: "Investigations",
    value: "11",
    helperText: "3 high priority",
    icon: "manage_search",
    iconClassName: "bg-indigo-50 text-indigo-700",
  },
  {
    label: "Completed",
    value: "42",
    helperText: "This month",
    icon: "task_alt",
    iconClassName: "bg-green-50 text-green-700",
  },
];

export default function StaffSummaryCards({ cards = defaultCards }) {
  return (
    <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
          <div className="mb-md flex items-start justify-between gap-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-[0.5rem] ${card.iconClassName}`}>
              <span className="material-symbols-outlined">{card.icon}</span>
            </div>
            {card.badge ? (
              <span className="rounded bg-slate-50 px-2.5 py-1 text-body-sm font-medium text-secondary">{card.badge}</span>
            ) : null}
          </div>
          <p className="text-body-md font-medium text-secondary">{card.label}</p>
          <p className="mt-xs text-[34px] font-bold leading-10 tracking-normal text-on-surface">{card.value}</p>
          <p className="mt-xs text-body-sm text-secondary">{card.helperText}</p>
        </article>
      ))}
    </section>
  );
}
