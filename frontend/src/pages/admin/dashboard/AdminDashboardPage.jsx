import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminComplaintsTable from "../../../components/admin/AdminComplaintsTable.jsx";
import AdminMetricCard from "../../../components/admin/AdminMetricCard.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";
import { getAllComplaints } from "../../../services/complaintService.js";

const ALERT_PAGE_SIZE = 6;

export default function AdminDashboardPage() {
  const user = useCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dueSoonPage, setDueSoonPage] = useState(1);
  const [overduePage, setOverduePage] = useState(1);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await getAllComplaints();
        setComplaints(data);
      } catch (error) {
        console.error("Load admin dashboard complaints error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(
      (item) => item.rawStatus !== "RESOLVED"
    ).length;
    const resolved = complaints.filter((item) => item.rawStatus === "RESOLVED" && !item.isRejected).length;
    const rejected = complaints.filter((item) => item.isRejected).length;

    return [
      {
        label: "Total Complaints",
        value: loading ? "..." : String(total),
        icon: "assignment",
        iconClassName: "bg-blue-50 text-blue-700",
        badge: "Live",
        badgeClassName: "bg-emerald-50 text-emerald-600",
        to: ROUTE_PATHS.adminComplaintsAll,
      },
      {
        label: "Pending",
        value: loading ? "..." : String(pending),
        icon: "pending_actions",
        iconClassName: "bg-amber-50 text-amber-600",
        badge: "Open",
        badgeClassName: "bg-amber-50 text-amber-700",
        to: ROUTE_PATHS.adminComplaintsPending,
      },
      {
        label: "Resolved",
        value: loading ? "..." : String(resolved),
        icon: "check_circle",
        iconClassName: "bg-emerald-50 text-emerald-600",
        badge: total === 0 ? "0%" : `${Math.round((resolved / total) * 100)}%`,
        badgeClassName: "bg-slate-50 text-secondary",
        to: ROUTE_PATHS.adminResponse,
      },
      {
        label: "Rejected",
        value: loading ? "..." : String(rejected),
        icon: "cancel",
        iconClassName: "bg-rose-50 text-rose-600",
        badge: "Closed",
        badgeClassName: "bg-rose-50 text-rose-600",
        to: ROUTE_PATHS.adminComplaintsRejected,
      },
    ];
  }, [complaints, loading]);

  const workflowMetrics = useMemo(() => {
    const receive = complaints.filter((item) => item.rawStatus === "PENDING").length;
    const validate = complaints.filter((item) => item.rawStatus === "VALIDATING").length;
    const process = complaints.filter((item) => item.rawStatus === "RESOLVING").length;
    const response = complaints.filter((item) => item.rawStatus === "RESOLVED" && !item.isRejected).length;

    return [
      {
        label: "Receive",
        value: loading ? "..." : String(receive),
        icon: "move_to_inbox",
        iconClassName: "bg-amber-50 text-amber-700",
        badge: "Step 1",
        badgeClassName: "bg-amber-50 text-amber-700",
        to: ROUTE_PATHS.adminReceive,
      },
      {
        label: "Validate",
        value: loading ? "..." : String(validate),
        icon: "fact_check",
        iconClassName: "bg-blue-50 text-blue-700",
        badge: "Step 2",
        badgeClassName: "bg-blue-50 text-blue-700",
        to: ROUTE_PATHS.adminReview,
      },
      {
        label: "Process",
        value: loading ? "..." : String(process),
        icon: "build_circle",
        iconClassName: "bg-cyan-50 text-cyan-700",
        badge: "Step 3",
        badgeClassName: "bg-cyan-50 text-cyan-700",
        to: ROUTE_PATHS.adminProcess,
      },
      {
        label: "Response",
        value: loading ? "..." : String(response),
        icon: "mark_email_read",
        iconClassName: "bg-emerald-50 text-emerald-700",
        badge: "Step 4",
        badgeClassName: "bg-emerald-50 text-emerald-700",
        to: ROUTE_PATHS.adminResponse,
      },
    ];
  }, [complaints, loading]);

  const overdueComplaints = useMemo(
    () =>
      complaints
        .filter((item) => item.isOverdue)
        .sort((a, b) => b.daysOpen - a.daysOpen),
    [complaints]
  );
  const dueSoonComplaints = useMemo(
    () =>
      complaints
        .filter((item) => item.isDueSoon)
        .sort((a, b) => a.hoursToSla - b.hoursToSla),
    [complaints]
  );
  const recentComplaints = useMemo(
    () =>
      [...complaints]
        .sort(
          (a, b) =>
            new Date(b.submittedAtRaw || b.createdAtRaw || 0).getTime() -
            new Date(a.submittedAtRaw || a.createdAtRaw || 0).getTime()
        )
        .slice(0, 15),
    [complaints]
  );
  const dueSoonTotalPages = Math.max(1, Math.ceil(dueSoonComplaints.length / ALERT_PAGE_SIZE));
  const dueSoonCurrentPage = Math.min(dueSoonPage, dueSoonTotalPages);
  const dueSoonStartIndex = (dueSoonCurrentPage - 1) * ALERT_PAGE_SIZE;
  const visibleDueSoonComplaints = dueSoonComplaints.slice(
    dueSoonStartIndex,
    dueSoonStartIndex + ALERT_PAGE_SIZE
  );
  const overdueTotalPages = Math.max(1, Math.ceil(overdueComplaints.length / ALERT_PAGE_SIZE));
  const overdueCurrentPage = Math.min(overduePage, overdueTotalPages);
  const overdueStartIndex = (overdueCurrentPage - 1) * ALERT_PAGE_SIZE;
  const visibleOverdueComplaints = overdueComplaints.slice(
    overdueStartIndex,
    overdueStartIndex + ALERT_PAGE_SIZE
  );

  useEffect(() => {
    setDueSoonPage(1);
  }, [dueSoonComplaints.length]);

  useEffect(() => {
    setOverduePage(1);
  }, [overdueComplaints.length]);

  const searchResults = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return [];

    return complaints
      .filter((complaint) =>
        [
          complaint.id,
          complaint.complaintCode,
          complaint.title,
          complaint.customer,
          complaint.email,
          complaint.phone,
          complaint.status,
          complaint.category,
          complaint.orderId,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))
      )
      .slice(0, 8);
  }, [complaints, searchTerm]);

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <header>
            <h1 className="text-display-sm font-bold text-on-surface">Complaints</h1>
            <p className="mt-1 text-body-md text-secondary">
              Monitor complaint volume, workflow status, SLA risk, and recent activity.
            </p>
          </header>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                search
              </span>
              <input
                className="h-12 w-full rounded-[0.5rem] border border-slate-200 bg-white pl-11 pr-4 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customer name, email, phone, complaint ID, title, status, category..."
              />
            </label>

            {searchTerm.trim() ? (
              <div className="mt-md overflow-hidden rounded-[0.5rem] border border-slate-100">
                {searchResults.length ? (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((complaint) => (
                      <Link
                        key={complaint.apiId}
                        to={ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", complaint.slug)}
                        className="grid grid-cols-1 gap-xs px-md py-sm transition hover:bg-slate-50 md:grid-cols-[1fr_0.8fr_0.45fr]"
                      >
                        <div>
                          <p className="text-body-sm text-primary">{complaint.id}</p>
                          <p className="text-body-md font-semibold text-on-surface">{complaint.title}</p>
                        </div>
                        <div>
                          <p className="text-body-md text-on-surface">{complaint.customer}</p>
                          <p className="text-body-sm text-secondary">{complaint.email}</p>
                        </div>
                        <span className="w-fit rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
                          {complaint.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="px-md py-sm text-body-md text-secondary">No matching customers or complaints found.</p>
                )}
              </div>
            ) : null}
          </section>

          <section className="space-y-sm">
            <h2 className="text-h2 text-on-surface">Overview</h2>
            <div className="grid grid-cols-1 items-stretch gap-gutter sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          <section className="space-y-sm">
            <h2 className="text-h2 text-on-surface">Complaint Status</h2>
            <div className="grid grid-cols-1 items-stretch gap-gutter sm:grid-cols-2 lg:grid-cols-4">
              {workflowMetrics.map((metric) => (
                <AdminMetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[0.75rem] border border-amber-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-md border-b border-amber-100 bg-amber-50 px-lg py-md">
              <div>
                <h2 className="text-h2 text-amber-800">SLA Expiry Notifications</h2>
                <p className="mt-1 text-body-sm text-amber-700">
                  Complaints below have 72 hours or less before the 15-day resolution deadline.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-sm py-xxs text-body-sm font-semibold text-amber-800">
                {loading ? "..." : `${complaints.filter((item) => item.isDueSoon).length} due soon`}
              </span>
            </div>

            {loading ? (
              <p className="px-lg py-md text-body-md text-secondary">Checking SLA notifications...</p>
            ) : dueSoonComplaints.length === 0 ? (
              <p className="px-lg py-md text-body-md text-secondary">
                No complaints are within the next 72-hour expiry window.
              </p>
            ) : (
              <>
                <div className="divide-y divide-amber-100">
                  {visibleDueSoonComplaints.map((complaint) => (
                    <div
                      key={complaint.apiId}
                      className="grid grid-cols-1 gap-sm px-lg py-md md:grid-cols-[1fr_0.7fr_0.55fr_0.55fr_auto] md:items-center"
                    >
                      <div>
                        <p className="text-body-sm text-amber-700">{complaint.id}</p>
                        <p className="text-body-lg font-semibold text-on-surface">{complaint.title}</p>
                      </div>
                      <div>
                        <p className="text-body-md text-on-surface">{complaint.customer}</p>
                        <p className="text-body-sm text-secondary">{complaint.email}</p>
                      </div>
                      <span className="w-fit rounded-full bg-amber-100 px-sm py-xxs text-body-sm font-semibold text-amber-800">
                        {complaint.hoursToSla}h left
                      </span>
                      <span className="w-fit rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
                        {complaint.status}
                      </span>
                      <Link
                        to={ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", complaint.slug)}
                        className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-amber-200 px-sm py-xs text-button text-amber-800 transition hover:bg-amber-50"
                      >
                        Review
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  ))}
                </div>
                {dueSoonComplaints.length > ALERT_PAGE_SIZE ? (
                  <div className="flex flex-wrap items-center justify-between gap-sm border-t border-amber-100 px-lg py-md">
                    <p className="text-body-sm text-amber-700">
                      Showing {dueSoonStartIndex + 1}-
                      {Math.min(dueSoonStartIndex + ALERT_PAGE_SIZE, dueSoonComplaints.length)} of{" "}
                      {dueSoonComplaints.length}
                    </p>
                    <div className="flex gap-xs">
                      <button
                        type="button"
                        onClick={() => setDueSoonPage((value) => Math.max(1, value - 1))}
                        disabled={dueSoonCurrentPage === 1}
                        className="rounded-[0.5rem] border border-amber-200 px-sm py-xs text-body-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-amber-300"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setDueSoonPage((value) => Math.min(dueSoonTotalPages, value + 1))}
                        disabled={dueSoonCurrentPage === dueSoonTotalPages}
                        className="rounded-[0.5rem] border border-amber-200 px-sm py-xs text-body-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:text-amber-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section className="overflow-hidden rounded-[0.75rem] border border-red-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-md border-b border-red-100 bg-red-50 px-lg py-md">
              <div>
                <h2 className="text-h2 text-red-800">Overdue Complaints</h2>
                <p className="mt-1 text-body-sm text-red-700">
                  Complaints must be resolved within 15 days from customer submission.
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-sm py-xxs text-body-sm font-semibold text-red-700">
                {loading ? "..." : `${complaints.filter((item) => item.isOverdue).length} urgent`}
              </span>
            </div>

            {loading ? (
              <p className="px-lg py-md text-body-md text-secondary">Checking overdue complaints...</p>
            ) : overdueComplaints.length === 0 ? (
              <p className="px-lg py-md text-body-md text-secondary">
                No overdue complaints at the moment.
              </p>
            ) : (
              <>
                <div className="divide-y divide-red-100">
                  {visibleOverdueComplaints.map((complaint) => (
                    <div
                      key={complaint.apiId}
                      className="grid grid-cols-1 gap-sm px-lg py-md md:grid-cols-[1fr_0.7fr_0.55fr_0.55fr_auto] md:items-center"
                    >
                      <div>
                        <p className="text-body-sm text-red-700">{complaint.id}</p>
                        <p className="text-body-lg font-semibold text-on-surface">{complaint.title}</p>
                      </div>
                      <div>
                        <p className="text-body-md text-on-surface">{complaint.customer}</p>
                        <p className="text-body-sm text-secondary">{complaint.email}</p>
                      </div>
                      <span className="w-fit rounded-full bg-red-100 px-sm py-xxs text-body-sm font-semibold text-red-700">
                        {complaint.daysOpen} days open
                      </span>
                      <span className="w-fit rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
                        {complaint.status}
                      </span>
                      <Link
                        to={ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", complaint.slug)}
                        className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-red-200 px-sm py-xs text-button text-red-700 transition hover:bg-red-50"
                      >
                        Resolve now
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  ))}
                </div>
                {overdueComplaints.length > ALERT_PAGE_SIZE ? (
                  <div className="flex flex-wrap items-center justify-between gap-sm border-t border-red-100 px-lg py-md">
                    <p className="text-body-sm text-red-700">
                      Showing {overdueStartIndex + 1}-
                      {Math.min(overdueStartIndex + ALERT_PAGE_SIZE, overdueComplaints.length)} of{" "}
                      {overdueComplaints.length}
                    </p>
                    <div className="flex gap-xs">
                      <button
                        type="button"
                        onClick={() => setOverduePage((value) => Math.max(1, value - 1))}
                        disabled={overdueCurrentPage === 1}
                        className="rounded-[0.5rem] border border-red-200 px-sm py-xs text-body-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverduePage((value) => Math.min(overdueTotalPages, value + 1))}
                        disabled={overdueCurrentPage === overdueTotalPages}
                        className="rounded-[0.5rem] border border-red-200 px-sm py-xs text-body-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <AdminComplaintsTable complaints={recentComplaints} />
        </div>
      </main>
    </div>
  );
}
