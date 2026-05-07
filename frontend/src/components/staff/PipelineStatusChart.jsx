const pipelineData = [
  { label: "Pending", count: 14, barClassName: "bg-amber-500" },
  { label: "Validating", count: 6, barClassName: "bg-blue-500" },
  { label: "Investigating", count: 21, barClassName: "bg-indigo-500" },
  { label: "Resolving", count: 8, barClassName: "bg-cyan-600" },
  { label: "Resolved", count: 52, barClassName: "bg-emerald-600" },
];

export default function PipelineStatusChart() {
  const maxCount = Math.max(...pipelineData.map((item) => item.count));

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
        <div>
          <h2 className="text-h2 text-on-surface">Workflow Pipeline</h2>
          <p className="mt-1 text-body-sm text-secondary">Static status visualization for admin review</p>
        </div>

        <span className="rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
          Demo data
        </span>
      </div>

      <div className="space-y-sm font-mono text-[15px] leading-6 text-on-surface">
        {pipelineData.map((item) => {
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
