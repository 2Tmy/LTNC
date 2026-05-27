import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";

const statusBadge = {
  Investigating: "bg-indigo-50 text-indigo-700",
  Resolving: "bg-cyan-50 text-cyan-700",
};

const priorityBadge = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

export default function XuLyPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAllComplaints();
      setComplaints(data.filter((c) => c.status === "Investigating" || c.status === "Resolving"));
    } catch (err) {
      setLoadError(err.response?.data?.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    investigating: complaints.filter((c) => c.status === "Investigating").length,
    resolving: complaints.filter((c) => c.status === "Resolving").length,
  }), [complaints]);

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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">3</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Step 3</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Process Complaints</h1>
              <p className="mt-1 text-sm text-slate-500">
                Investigate complaints and prepare resolution proposals.
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

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Active", value: complaints.length, color: "text-slate-800", bg: "bg-white" },
              { label: "Investigating", value: stats.investigating, color: "text-indigo-700", bg: "bg-indigo-50" },
              { label: "Resolving", value: stats.resolving, color: "text-cyan-700", bg: "bg-cyan-50" },
            ].map((card) => (
              <div key={card.label} className={`rounded-xl border border-slate-200 ${card.bg} p-5 shadow-sm`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className={`mt-1 text-3xl font-bold ${card.color}`}>{loading ? "—" : card.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800">In Progress</h2>
              <p className="text-xs text-slate-400">Complaints currently being investigated or resolved.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-16">
                <span className="material-symbols-outlined animate-spin text-[40px] text-indigo-500">progress_activity</span>
              </div>
            ) : loadError ? (
              <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-300">build_circle</span>
                <p className="mt-3 font-semibold text-slate-500">No complaints in processing</p>
                <p className="mt-1 text-sm text-slate-400">No active investigations at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Complaint</th>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Priority</th>
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
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[c.status] || "bg-slate-100 text-slate-600"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadge[c.priority] || "bg-slate-100 text-slate-600"}`}>
                            {c.priority}
                          </span>
                        </td>
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
