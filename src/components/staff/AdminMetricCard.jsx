import { Link } from "react-router-dom";

export default function AdminMetricCard({ label, value, icon, iconClassName, badge, badgeClassName, to }) {
  const content = (
    <>
      <div className="mb-lg flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-[0.5rem] ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge ? (
          <span className={`rounded px-2.5 py-1 text-body-sm font-medium ${badgeClassName}`}>{badge}</span>
        ) : null}
      </div>
      <p className="mb-2 text-body-md font-medium text-secondary">{label}</p>
      <p className="text-[34px] font-bold leading-10 tracking-normal text-on-surface">{value}</p>
    </>
  );

  if (to) {
    return (
      <Link
        className="block rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
        to={to}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      {content}
    </article>
  );
}
