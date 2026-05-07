import { useEffect, useMemo, useState } from "react";
import AdminComplaintsTable from "../../../components/staff/AdminComplaintsTable.jsx";
import AdminMetricCard from "../../../components/staff/AdminMetricCard.jsx";
import ComplaintsBarChart from "../../../components/staff/ComplaintsBarChart.jsx";
import PipelineStatusChart from "../../../components/staff/PipelineStatusChart.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";
import { ACTIVE_STATUSES, getAllComplaints, RESOLVED_STATUSES } from "../../../services/complaintService.js";

const bars = [
  { label: "May", height: 38, opacity: 0.22 },
  { label: "Jun", height: 52, opacity: 0.35 },
  { label: "Jul", height: 43, opacity: 0.55 },
  { label: "Aug", height: 66, opacity: 0.85 },
  { label: "Sep", height: 85, active: true },
  { label: "Oct", height: 57, opacity: 0.95 },
];

export default function StaffDashboardPage() {
  const user = useCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const data = await getAllComplaints();
        setComplaints(data);
      } catch (error) {
        console.error("Load staff dashboard complaints error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((item) => ACTIVE_STATUSES.has(item.status)).length;
    const resolved = complaints.filter((item) => RESOLVED_STATUSES.has(item.status)).length;
    const rejected = complaints.filter((item) => item.status === "Rejected").length;

    return [
      {
        label: "Total Complaints",
        value: loading ? "..." : String(total),
        icon: "assignment",
        iconClassName: "bg-blue-50 text-blue-700",
        badge: "Live",
        badgeClassName: "bg-emerald-50 text-emerald-600",
        to: `${ROUTE_PATHS.adminComplaints}?status=all`,
      },
      {
        label: "Pending",
        value: loading ? "..." : String(pending),
        icon: "pending_actions",
        iconClassName: "bg-amber-50 text-amber-600",
        badge: "Waiting",
        badgeClassName: "bg-amber-50 text-amber-700",
        to: `${ROUTE_PATHS.adminComplaints}?status=pending`,
      },
      {
        label: "Resolved",
        value: loading ? "..." : String(resolved),
        icon: "check_circle",
        iconClassName: "bg-emerald-50 text-emerald-600",
        badge: total === 0 ? "0%" : `${Math.round((resolved / total) * 100)}%`,
        badgeClassName: "bg-slate-50 text-secondary",
        to: `${ROUTE_PATHS.adminComplaintStatus}?status=resolved`,
      },
      {
        label: "Rejected",
        value: loading ? "..." : String(rejected),
        icon: "cancel",
        iconClassName: "bg-rose-50 text-rose-600",
        badge: "Closed",
        badgeClassName: "bg-rose-50 text-rose-600",
        to: `${ROUTE_PATHS.adminComplaintStatus}?status=rejected`,
      },
    ];
  }, [complaints, loading]);

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <AdminMetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section>
            <PipelineStatusChart />
          </section>

          <section>
            <ComplaintsBarChart bars={bars} />
          </section>

          <AdminComplaintsTable complaints={recentComplaints} />
        </div>
      </main>
    </div>
  );
}
