export default function ComplaintsBarChart({ bars }) {
  const maxHeight = Math.max(...bars.map((bar) => bar.height), 100);

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
        <div>
          <h2 className="text-h2 text-on-surface">Complaint Volume</h2>
          <p className="mt-1 text-body-sm text-secondary">Monthly complaint intake trend</p>
        </div>

        <button
          className="inline-flex items-center gap-xs rounded-[0.5rem] border border-slate-200 px-sm py-xs text-body-sm font-medium text-secondary hover:bg-slate-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          Last 6 months
        </button>
      </div>

      <div className="flex min-h-[260px] items-end gap-sm border-b border-slate-100 pb-md sm:gap-md">
        {bars.map((bar) => {
          const normalizedHeight = Math.max(18, Math.round((bar.height / maxHeight) * 220));

          return (
            <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-sm">
              <div className="flex h-[220px] w-full items-end justify-center">
                <div
                  className={`w-full max-w-12 rounded-t-[0.5rem] transition-all ${
                    bar.active ? "bg-primary-container" : "bg-primary-container/70"
                  }`}
                  style={{
                    height: `${normalizedHeight}px`,
                    opacity: bar.active ? 1 : bar.opacity ?? 0.6,
                  }}
                  aria-label={`${bar.label}: ${bar.height} complaints`}
                  role="img"
                />
              </div>
              <span className={`text-body-sm ${bar.active ? "font-semibold text-primary-container" : "text-secondary"}`}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-md grid grid-cols-3 gap-md text-center">
        <div>
          <p className="text-body-sm text-secondary">Peak</p>
          <p className="text-h3 text-on-surface">{Math.max(...bars.map((bar) => bar.height))}</p>
        </div>
        <div>
          <p className="text-body-sm text-secondary">Average</p>
          <p className="text-h3 text-on-surface">
            {Math.round(bars.reduce((total, bar) => total + bar.height, 0) / bars.length)}
          </p>
        </div>
        <div>
          <p className="text-body-sm text-secondary">Current</p>
          <p className="text-h3 text-on-surface">{bars[bars.length - 1]?.height ?? 0}</p>
        </div>
      </div>
    </section>
  );
}
