import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";

const priorityBadge = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

export default function XemXetPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAllComplaints();
      setComplaints(data.filter((c) => c.status === "Validating"));
    } catch (err) {
      setLoadError(err.response?.data?.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">2</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">Step 2</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Review Complaints</h1>
              <p className="mt-1 text-sm text-slate-500">
                Validate and approve complaints before they move to processing.
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
          </div>

          {/* Table card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Under Review</h2>
                <p className="text-xs text-slate-400">Complaints awaiting validation before processing.</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {complaints.length} pending
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-16">
                <span className="material-symbols-outlined animate-spin text-[40px] text-blue-500">progress_activity</span>
              </div>
            ) : loadError ? (
              <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-300">fact_check</span>
                <p className="mt-3 font-semibold text-slate-500">No complaints under review</p>
                <p className="mt-1 text-sm text-slate-400">All clear — nothing pending validation.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Complaint</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Submitted</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map((c) => (
                      <tr key={c.slug} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-400">{c.id}</p>
                          <p className="mt-0.5 font-medium text-slate-800">{c.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-700">{c.customer}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{c.category}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge[c.priority] || "bg-slate-100 text-slate-600"}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">{c.submittedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/admin/complaints/${c.slug}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
