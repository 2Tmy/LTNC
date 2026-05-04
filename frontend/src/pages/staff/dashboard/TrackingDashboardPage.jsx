import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";

const statusClasses = {
  Pending: "bg-amber-50 text-amber-700",
  Validating: "bg-blue-50 text-blue-700",
  Investigating: "bg-indigo-50 text-indigo-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export default function TrackingDashboardPage() {
  const user = useCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await getAllComplaints();
        setComplaints(data);
      } catch (error) {
        console.error("Load complaint status error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const statusFlow = useMemo(() => {
    const pending = complaints.filter((item) => item.status === "Pending").length;
    const validating = complaints.filter((item) => item.status === "Validating").length;
    const investigating = complaints.filter((item) => item.status === "Investigating").length;
    const resolved = complaints.filter((item) => item.status === "Resolved").length;

    return [
      { label: "Pending", count: pending, color: "bg-amber-500" },
      { label: "Validating", count: validating, color: "bg-blue-500" },
      { label: "Investigating", count: investigating, color: "bg-indigo-500" },
      { label: "Resolved", count: resolved, color: "bg-emerald-500" },
    ];
  }, [complaints]);

  const total = statusFlow.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">Complaint Status</h1>
            <p className="mt-xs text-body-md text-secondary">
              Monitor complaint progress across the resolution workflow.
            </p>
          </div>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <div className="mb-lg flex items-center justify-between">
              <h2 className="text-h2 text-on-surface">Workflow pipeline</h2>
              <span className="text-body-sm text-secondary">
                {loading ? "Loading..." : `${total} active records`}
              </span>
            </div>

            <div className="space-y-md">
              {statusFlow.map((step) => (
                <div key={step.label}>
                  <div className="mb-xs flex items-center justify-between text-body-md">
                    <span className="font-medium text-on-surface">{step.label}</span>
                    <span className="text-secondary">{step.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${step.color}`}
                      style={{
                        width: `${total === 0 ? 0 : Math.max(8, (step.count / total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="text-h2 text-on-surface">Cases needing attention</h2>

            {loading ? (
              <p className="mt-md text-body-md text-secondary">Loading complaints...</p>
            ) : complaints.filter((complaint) => complaint.status !== "Resolved").length === 0 ? (
              <p className="mt-md text-body-md text-secondary">No active complaints need attention.</p>
            ) : (
              <div className="mt-md grid grid-cols-1 gap-md lg:grid-cols-2">
                {complaints
                  .filter((complaint) => complaint.status !== "Resolved")
                  .map((complaint) => (
                    <article key={complaint.slug} className="rounded-[0.5rem] border border-outline-variant p-md">
                      <div className="flex items-start justify-between gap-md">
                        <div>
                          <p className="text-h3 text-primary">{complaint.id}</p>
                          <h3 className="mt-xxs text-body-lg font-semibold text-on-surface">
                            {complaint.title}
                          </h3>
                          <p className="mt-xs text-body-sm text-secondary">
                            {complaint.customer} - {complaint.department}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-sm py-xxs text-body-sm font-semibold ${
                            statusClasses[complaint.status] || "bg-slate-100 text-secondary"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}