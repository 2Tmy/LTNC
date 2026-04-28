import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { adminComplaints, adminUser, statusFlow } from "../../../mocks/adminMock.js";

const statusClasses = {
  Pending: "bg-amber-50 text-amber-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  "Under Review": "bg-slate-100 text-secondary",
  Escalated: "bg-rose-50 text-rose-700",
};

export default function TrackingDashboardPage() {
  const total = statusFlow.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={adminUser} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">Complaint Status</h1>
            <p className="mt-xs text-body-md text-secondary">Monitor complaint progress across the resolution workflow.</p>
          </div>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="text-h2 text-on-surface">Workflow pipeline</h2>
              <span className="text-body-sm text-secondary">{total} active records</span>
            </div>
            <div className="space-y-md">
              {statusFlow.map((step) => (
                <div key={step.label}>
                  <div className="mb-xs flex items-center justify-between text-body-md">
                    <span className="font-medium text-on-surface">{step.label}</span>
                    <span className="text-secondary">{step.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${step.color}`} style={{ width: `${Math.max(8, (step.count / total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="text-h2 text-on-surface">Cases needing attention</h2>
            <div className="mt-md grid grid-cols-1 gap-md lg:grid-cols-2">
              {adminComplaints
                .filter((complaint) => complaint.status !== "Resolved")
                .map((complaint) => (
                  <article key={complaint.id} className="rounded-[0.5rem] border border-outline-variant p-md">
                    <div className="flex items-start justify-between gap-md">
                      <div>
                        <p className="text-h3 text-primary">{complaint.id}</p>
                        <h3 className="mt-xxs text-body-lg font-semibold text-on-surface">{complaint.title}</h3>
                        <p className="mt-xs text-body-sm text-secondary">{complaint.customer} - {complaint.department}</p>
                      </div>
                      <span className={`rounded-full px-sm py-xxs text-body-sm font-semibold ${statusClasses[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
