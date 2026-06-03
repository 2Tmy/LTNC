import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

export default function XuLyPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllComplaints();
        setComplaints(data.filter((c) => c.rawStatus === "INVESTIGATING"));
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Step 3</p>
            <h1 className="text-2xl font-bold">Process complaints</h1>
            <p className="mt-1 text-sm text-slate-500">
              Open each complaint to record the investigation and prepare the customer response.
            </p>
          </header>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-slate-300">search</span>
              <p className="mt-2 text-sm text-slate-500">No complaints currently being investigated.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[1fr_1fr_0.6fr_0.6fr_0.9fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
                <span>Code / Title</span>
                <span>Customer</span>
                <span>Category</span>
                <span>Priority</span>
                <span>Assigned to</span>
                <span />
              </div>
              <div className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <div
                    key={c.apiId}
                    className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_0.6fr_0.6fr_0.9fr_auto] md:gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-400">{c.id}</p>
                      <p className="mt-0.5 font-medium text-slate-800">{c.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{c.customer}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                    <p className="text-sm text-slate-600">{c.category}</p>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${priorityStyles[c.priority] || "bg-slate-100 text-slate-600"}`}
                    >
                      {c.priority}
                    </span>
                    <p className="text-sm text-slate-600">{c.assignedToName}</p>
                    <Link
                      to={`${ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", c.slug)}?from=process`}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                    >
                      <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
