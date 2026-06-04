import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { ROUTE_PATHS } from "../../routes/routePaths.js";
import { getMyComplaints } from "../../services/complaintService.js";

const statusBadge = {
  Pending: "bg-orange-50 text-orange-700",
  Validating: "bg-blue-50 text-blue-700",
  Resolving: "bg-cyan-50 text-cyan-700",
  Resolved: "bg-green-50 text-green-700",
};

export default function MyComplaintsPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getMyComplaints();
        setComplaints(data);
      } catch (err) {
        setLoadError(err.response?.data?.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "Pending", label: "Pending" },
    { value: "Validating", label: "Validating" },
    { value: "Resolving", label: "Resolving" },
    { value: "Resolved", label: "Resolved" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
              <p className="mt-1 text-sm text-slate-500">
                All complaints submitted from your account.
              </p>
            </div>
            <Link
              to={ROUTE_PATHS.submitComplaint}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New complaint
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f.label}
                {f.value === "all" && !loading && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-1 text-[10px]">
                    {complaints.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center p-16">
                <span className="material-symbols-outlined animate-spin text-[40px] text-blue-500">progress_activity</span>
              </div>
            ) : loadError ? (
              <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-300">inbox</span>
                <p className="mt-3 font-semibold text-slate-500">
                  {filter === "all" ? "No complaints yet" : `No ${filter.toLowerCase()} complaints`}
                </p>
                {filter === "all" && (
                  <Link
                    to={ROUTE_PATHS.submitComplaint}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Submit your first complaint
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Complaint</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Submitted</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((c) => (
                      <tr key={c.slug} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-400">{c.id}</p>
                          <p className="mt-0.5 font-medium text-slate-800">{c.title}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{c.category}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[c.status] || "bg-slate-100 text-slate-600"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">{c.submittedAt}</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/customer/complaints/${c.complaintCode}`}
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
