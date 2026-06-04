import { useEffect, useMemo, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllComplaints();
        setComplaints(data.filter((c) => c.rawStatus === "RESOLVING"));
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredComplaints = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return complaints;

    return complaints.filter((complaint) =>
      [
        complaint.id,
        complaint.complaintCode,
        complaint.title,
        complaint.customer,
        complaint.email,
        complaint.phone,
        complaint.orderId,
        complaint.category,
        complaint.status,
        complaint.priority,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [complaints, searchTerm]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Step 3</p>
              <h1 className="text-2xl font-bold">Process complaints</h1>
              <p className="mt-1 text-sm text-slate-500">
                Open each complaint to record the root cause and customer response.
              </p>
            </div>

            <label className="relative w-full sm:w-[380px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                search
              </span>
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer, phone, complaint ID..."
              />
            </label>
          </header>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : filteredComplaints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-slate-300">search</span>
              <p className="mt-2 text-sm text-slate-500">
                {searchTerm.trim()
                  ? "No resolving complaints match your search."
                  : "No complaints currently being resolved."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[1fr_1fr_0.7fr_0.7fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
                <span>Code / Title</span>
                <span>Customer</span>
                <span>Category</span>
                <span>Priority</span>
                <span />
              </div>
              <div className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => (
                  <div
                    key={c.apiId}
                    className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_0.7fr_0.7fr_auto] md:gap-4"
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
                      {c.priority || "Not set"}
                    </span>
                    <Link
                      to={ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", c.slug)}
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
