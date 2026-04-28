export default function StatCard({ label, value, helperText, helperClassName, icon, iconClassName }) {
  return (
    <article className="flex min-h-[168px] flex-col justify-between rounded-[0.75rem] border border-slate-100 bg-white p-lg shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] transition-colors hover:border-primary-container">
      <div className="flex items-center justify-between">
        <span className="text-label-md uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`rounded-[0.5rem] p-2 ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-display text-on-surface">{value}</span>
        <span className={`mt-1 block text-body-sm ${helperClassName}`}>{helperText}</span>
      </div>
    </article>
  );
}
