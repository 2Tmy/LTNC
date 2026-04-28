const stepStyles = {
  complete: {
    circle: "bg-green-500 text-white shadow-md",
    title: "font-bold text-on-surface",
    detail: "text-slate-400",
  },
  active: {
    circle: "bg-primary-container text-white shadow-md ring-4 ring-blue-100",
    title: "font-bold text-primary-container",
    detail: "text-primary-container",
  },
  pending: {
    circle: "bg-slate-100 text-slate-400",
    title: "font-medium text-slate-400",
    detail: "text-slate-400",
  },
};

export default function ComplaintStepper({ complaintId, statusLabel, steps }) {
  return (
    <section className="rounded-[0.75rem] border border-slate-100 bg-white p-lg shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)]">
      <div className="mb-xl flex items-center justify-between gap-4">
        <h2 className="text-h2 text-on-surface">Complaint Status: {complaintId}</h2>
        <span className="text-body-md font-semibold text-primary-container">{statusLabel}</span>
      </div>

      <div className="relative flex flex-col items-start justify-between space-y-8 md:flex-row md:items-center md:space-y-0">
        <div className="absolute left-0 top-5 z-0 hidden h-0.5 w-full bg-slate-100 md:block" />

        {steps.map((step) => {
          const styles = stepStyles[step.state];

          return (
            <div
              key={step.label}
              className="relative z-10 flex w-full items-center gap-4 md:w-auto md:flex-col md:items-center md:gap-3"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.circle}`}>
                <span className="material-symbols-outlined">{step.icon}</span>
              </div>
              <div className="flex flex-col md:items-center">
                <span className={`text-body-md ${styles.title}`}>{step.label}</span>
                <span className={`text-body-sm ${styles.detail}`}>{step.caption}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
