const defaultPipelineData = [
  { label: "Pending", count: 0, barClassName: "bg-amber-500" },
  { label: "Validating", count: 0, barClassName: "bg-blue-500" },
  { label: "Resolving", count: 0, barClassName: "bg-cyan-600" },
  { label: "Resolved", count: 0, barClassName: "bg-emerald-600" },
];

export default function PipelineStatusChart({ data = defaultPipelineData, loading = false }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
        <div>
          <h2 className="text-h2 text-on-surface">Workflow Pipeline</h2>
          <p className="mt-1 text-body-sm text-secondary">Live status distribution from current complaints</p>
        </div>

        <span className="rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
          {loading ? "Loading" : "Database"}
        </span>
      </div>

      <div className="space-y-sm font-mono text-[15px] leading-6 text-on-surface">
        {data.map((item) => {
          const width = Math.max(32, Math.round((item.count / maxCount) * 260));

          return (
            <div
              key={item.label}
              className="grid grid-cols-[140px_minmax(0,1fr)_48px] items-center gap-sm"
            >
              <span>{item.label}</span>
              <div className="h-6 overflow-hidden rounded-[0.25rem] bg-slate-100">
                <div
                  className={`h-full ${item.barClassName}`}
                  style={{ width: `${width}px`, maxWidth: "100%" }}
                  aria-label={`${item.label}: ${item.count}`}
                  role="img"
                />
              </div>
              <span className="font-semibold">{item.count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
