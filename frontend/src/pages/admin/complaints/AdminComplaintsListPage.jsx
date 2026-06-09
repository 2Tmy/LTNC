import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";
import { getAllComplaints } from "../../../services/complaintService.js";

const PAGE_SIZE = 10;

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Validating: "bg-blue-50 text-blue-700",
  Resolving: "bg-cyan-50 text-cyan-700",
  Resolved: "bg-emerald-50 text-emerald-700",
};

const pageConfig = {
  all: {
    eyebrow: "All complaints",
    title: "All complaints",
    description: "Browse every complaint submitted to the system.",
    emptyIcon: "inventory_2",
    emptyText: "No complaints found.",
    filter: () => true,
  },
  pending: {
    eyebrow: "Pending",
    title: "Pending complaints",
    description: "Complaints that are still open and waiting for handling.",
    emptyIcon: "pending_actions",
    emptyText: "No pending complaints.",
    filter: (complaint) => complaint.rawStatus !== "RESOLVED",
  },
  resolved: {
    eyebrow: "Resolution",
    title: "Resolved with resolution",
    description: "Complaints completed by sending a customer-facing resolution. Rejected complaints are listed separately.",
    emptyIcon: "task_alt",
    emptyText: "No resolved-with-resolution complaints.",
    filter: (complaint) => complaint.rawStatus === "RESOLVED" && !complaint.isRejected,
  },
  rejected: {
    eyebrow: "Rejected",
    title: "Rejected complaints",
    description: "Complaints completed as rejected during validation, separated from successful resolutions.",
    emptyIcon: "cancel",
    emptyText: "No rejected complaints.",
    filter: (complaint) => complaint.isRejected,
  },
};

export default function AdminComplaintsListPage({ type = "all" }) {
  const user = useCurrentUser();
  const config = pageConfig[type] || pageConfig.all;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAllComplaints();
      setComplaints(data);
      setPage(1);
    } catch (error) {
      setLoadError(error.response?.data?.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [type]);

  const filteredComplaints = useMemo(
    () => {
      const keyword = searchTerm.trim().toLowerCase();
      return complaints
        .filter(config.filter)
        .filter((complaint) => {
          if (!keyword) return true;
          return [
            complaint.id,
            complaint.complaintCode,
            complaint.title,
            complaint.customer,
            complaint.email,
            complaint.phone,
            complaint.orderId,
            complaint.status,
            complaint.category,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword));
        });
    },
    [complaints, config, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleComplaints = filteredComplaints.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                {config.eyebrow}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{config.description}</p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              type="button"
              onClick={loadComplaints}
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
          </header>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800">Complaint list</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Showing {filteredComplaints.length} matching complaints
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <label className="relative w-full sm:w-[360px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                    search
                  </span>
                  <input
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search customer, phone, complaint ID, title..."
                  />
                </label>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12 text-sm text-slate-500">
                <span className="material-symbols-outlined mr-2 animate-spin text-[24px] text-blue-500">
                  progress_activity
                </span>
                Loading complaints...
              </div>
            ) : loadError ? (
              <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {loadError}
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-[44px] text-slate-300">
                  {config.emptyIcon}
                </span>
                <p className="mt-2 text-sm text-slate-500">{config.emptyText}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Code / Title</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Outcome</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Updated</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleComplaints.map((complaint) => {
                        const statusLabel = complaint.status;

                        return (
                          <tr key={complaint.apiId} className="transition hover:bg-slate-50">
                            <td className="min-w-[240px] px-5 py-4">
                              <p className="text-xs text-slate-400">{complaint.id}</p>
                              <p className="mt-0.5 font-medium text-slate-800">{complaint.title}</p>
                            </td>
                            <td className="min-w-[190px] px-5 py-4">
                              <p className="text-slate-700">{complaint.customer}</p>
                              <p className="text-xs text-slate-400">{complaint.email}</p>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  statusStyles[statusLabel] || "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  complaint.isRejected
                                    ? "bg-rose-50 text-rose-700"
                                    : complaint.rawStatus === "RESOLVED"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {complaint.isRejected
                                  ? "Rejected"
                                  : complaint.rawStatus === "RESOLVED"
                                    ? "Resolution sent"
                                    : "In workflow"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                              {complaint.category}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-400">
                              {complaint.lastUpdated}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-right">
                              <Link
                                to={ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", complaint.slug)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
                              >
                                View
                                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                  <p className="text-sm text-slate-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredComplaints.length)} of{" "}
                    {filteredComplaints.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
