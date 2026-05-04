import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { ROUTE_PATHS } from "../../routes/routePaths.js";
import { getMyComplaints } from "../../services/complaintService.js";

const statusStyles = {
  Pending: "bg-orange-50 text-orange-700",
  Validating: "bg-blue-50 text-blue-700",
  "Needs Info": "bg-yellow-50 text-yellow-700",
  Investigating: "bg-indigo-50 text-indigo-700",
  Resolved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
  SUBMITTED: "bg-orange-50 text-orange-700",
  PENDING_VALIDATION: "bg-blue-50 text-blue-700",
  VALIDATED: "bg-blue-50 text-blue-700",
  NEED_MORE_INFO: "bg-yellow-50 text-yellow-700",
  IN_REVIEW: "bg-indigo-50 text-indigo-700",
  INVESTIGATING: "bg-indigo-50 text-indigo-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

export default function CustomerDashboardPage() {
  const user = useCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await getMyComplaints();
        setComplaints(data);
      } catch (error) {
        console.error("Fetch my complaints error:", error);
        setLoadError(
          error.response?.data?.message ||
            "Unable to load your complaints. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;

    const pending = complaints.filter((item) =>
      ["Pending", "SUBMITTED"].includes(item.status)
    ).length;

    const inProgress = complaints.filter((item) =>
      [
        "Validating",
        "Needs Info",
        "Investigating",
        "PENDING_VALIDATION",
        "VALIDATED",
        "NEED_MORE_INFO",
        "IN_REVIEW",
        "INVESTIGATING",
      ].includes(item.status)
    ).length;

    const resolved = complaints.filter((item) =>
      ["Resolved", "RESOLVED", "CLOSED"].includes(item.status)
    ).length;

    return { total, pending, inProgress, resolved };
  }, [complaints]);

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-lg p-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <h1 className="text-h1 text-on-surface">Customer Dashboard</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                Track submitted complaints and monitor their handling progress.
              </p>
            </div>

            <Link
              className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container"
              to={ROUTE_PATHS.submitComplaint}
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Submit complaint
            </Link>
          </div>

          <section className="grid grid-cols-1 gap-md md:grid-cols-4">
            <div className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-label-md uppercase text-on-surface-variant">Total</p>
              <p className="mt-xs text-h1 text-on-surface">{stats.total}</p>
            </div>

            <div className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-label-md uppercase text-on-surface-variant">Pending</p>
              <p className="mt-xs text-h1 text-on-surface">{stats.pending}</p>
            </div>

            <div className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-label-md uppercase text-on-surface-variant">In Progress</p>
              <p className="mt-xs text-h1 text-on-surface">{stats.inProgress}</p>
            </div>

            <div className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
              <p className="text-label-md uppercase text-on-surface-variant">Resolved</p>
              <p className="mt-xs text-h1 text-on-surface">{stats.resolved}</p>
            </div>
          </section>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div>
                <h2 className="text-h2 text-on-surface">My complaints</h2>
                <p className="mt-xxs text-body-md text-on-surface-variant">
                  Complaints submitted from your account.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="mt-lg flex items-center justify-center rounded-[0.5rem] bg-slate-50 p-xl text-center">
                <div>
                  <span className="material-symbols-outlined animate-spin text-[36px] text-primary">
                    progress_activity
                  </span>
                  <p className="mt-sm text-body-md text-on-surface-variant">
                    Loading complaints...
                  </p>
                </div>
              </div>
            ) : loadError ? (
              <div className="mt-lg rounded-[0.5rem] border border-error/30 bg-red-50 p-md text-body-md text-error">
                {loadError}
              </div>
            ) : complaints.length === 0 ? (
              <div className="mt-lg rounded-[0.5rem] border border-dashed border-outline-variant bg-slate-50 p-xl text-center">
                <span className="material-symbols-outlined text-[44px] text-on-surface-variant">
                  inbox
                </span>
                <h3 className="mt-sm text-h3 text-on-surface">No complaints yet</h3>
                <p className="mt-xs text-body-md text-on-surface-variant">
                  Submit your first complaint to start tracking it here.
                </p>

                <Link
                  className="mt-md inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container"
                  to={ROUTE_PATHS.submitComplaint}
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Submit complaint
                </Link>
              </div>
            ) : (
              <div className="mt-lg overflow-hidden rounded-[0.5rem] border border-outline-variant">
                <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr] gap-md bg-slate-50 px-md py-sm text-label-md uppercase text-on-surface-variant md:grid">
                  <span>Code / Title</span>
                  <span>Category</span>
                  <span>Status</span>
                  <span>Submitted</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="divide-y divide-outline-variant">
                  {complaints.map((complaint) => {
                    const code = complaint.slug || complaint.complaintCode || complaint.id;

                    return (
                      <div
                        key={code}
                        className="grid grid-cols-1 gap-sm px-md py-md md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.7fr] md:items-center md:gap-md"
                      >
                        <div>
                          <p className="text-body-sm text-on-surface-variant">
                            {complaint.id || `#${code}`}
                          </p>
                          <p className="mt-xxs font-medium text-on-surface">
                            {complaint.title}
                          </p>
                        </div>

                        <p className="text-body-md text-on-surface-variant">
                          {complaint.category || "Not specified"}
                        </p>

                        <div>
                          <span
                            className={`inline-flex rounded-full px-sm py-xxs text-label-md ${
                              statusStyles[complaint.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {complaint.status}
                          </span>
                        </div>

                        <p className="text-body-md text-on-surface-variant">
                          {complaint.submittedAt || complaint.createdAt || "Not available"}
                        </p>

                        <div className="text-left md:text-right">
                          <Link
                            className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-outline-variant px-sm py-xs text-button text-primary transition hover:bg-blue-50"
                            to={`/customer/complaints/${code}`}
                          >
                            View
                            <span className="material-symbols-outlined text-[18px]">
                              arrow_forward
                            </span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
