import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints, getAllFeedbacks } from "../../../services/complaintService.js";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s}
          className={`material-symbols-outlined text-[16px] ${s <= rating ? "text-yellow-400" : "text-slate-200"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
      ))}
    </div>
  );
}

export default function PhanHoiPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllComplaints();
        setComplaints(data);
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const feedbacks = useMemo(() => getAllFeedbacks(), [complaints]);

  const resolving = complaints.filter(c => c.rawStatus === "RESOLVING");
  const resolved  = complaints.filter(c => c.rawStatus === "RESOLVED");

  const feedbackCount = resolved.filter(c => feedbacks[c.complaintCode]).length;

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

          {/* ── Pending to send ─────────────────────────────────────────── */}
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : resolving.length === 0 ? (
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
                {resolving.map((c) => (
                  <div key={c.apiId}
                    className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_1.5fr_auto] md:gap-4">
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

          {/* ── Resolved — customer feedback ────────────────────────────── */}
          {!loading && resolved.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-700">Resolved complaints — Customer feedback</h2>
                {feedbackCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-bold text-yellow-900">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    {feedbackCount} new feedback
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden grid-cols-[1fr_1fr_auto_120px_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
                  <span>Code / Title</span>
                  <span>Customer</span>
                  <span>Resolved</span>
                  <span>Feedback</span>
                  <span />
                </div>
                <div className="divide-y divide-slate-100">
                  {resolved.map((c) => {
                    const fb = feedbacks[c.complaintCode];
                    return (
                      <div key={c.apiId}
                        className="grid grid-cols-1 items-center gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_auto_120px_auto] md:gap-4">
                        <div>
                          <p className="text-xs text-slate-400">{c.id}</p>
                          <p className="mt-0.5 font-medium text-slate-800">{c.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">{c.customer}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                        <p className="text-xs text-slate-400">{c.lastUpdated}</p>
                        <div>
                          {fb ? (
                            <div className="space-y-0.5">
                              <StarDisplay rating={fb.rating} />
                              {fb.comment && (
                                <p className="line-clamp-1 text-[10px] text-slate-500">"{fb.comment}"</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">No feedback</span>
                          )}
                        </div>
                        <Link
                          to={`${ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", c.slug)}?from=response`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                          View
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
