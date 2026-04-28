export default function StatusDonutChart({ segments }) {
  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="mb-xl flex items-center justify-between">
        <h2 className="text-h2 text-on-surface">Complaints by Status</h2>
        <button className="rounded-full p-1 text-slate-400 hover:bg-slate-50" type="button" aria-label="Chart options">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>

      <div className="flex min-h-[280px] items-center justify-center">
        <div className="relative h-48 w-48 rounded-full bg-[conic-gradient(#0f4fb3_0_78%,#fbbf24_78%_90%,#f43f5e_90%_100%)]">
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-[28px] font-bold leading-8 text-on-surface">1.2k</span>
            <span className="text-label-md uppercase text-secondary">Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-md">
        {segments.map((segment) => (
          <div key={segment.label} className="text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5 text-body-sm font-medium text-secondary">
              <span className={`h-2.5 w-2.5 rounded-full ${segment.dotClassName}`} />
              {segment.label}
            </div>
            <p className="text-h2 text-on-surface">{segment.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
