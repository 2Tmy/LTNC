import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

export default function PhanHoiPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />
        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600">Step 4</p>
            <h1 className="text-2xl font-bold">Send final responses</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review the prepared response and send it to the customer.
            </p>
          </header>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-slate-300">rate_review</span>
              <p className="mt-2 text-sm text-slate-500">No responses waiting to be sent.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[1fr_1fr_1.5fr_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
                <span>Code / Title</span>
                <span>Customer</span>
                <span>Resolution preview</span>
                <span />
              </div>
              <div className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <div
                    key={c.apiId}
                    className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_1.5fr_auto] md:gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-400">{c.id}</p>
                      <p className="mt-0.5 font-medium text-slate-800">{c.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{c.customer}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {c.resolution || "No resolution text yet."}
                    </p>
                    <Link
                      to={`${ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", c.slug)}?from=response`}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
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
