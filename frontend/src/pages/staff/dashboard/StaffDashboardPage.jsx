import AdminComplaintsTable from "../../../components/staff/AdminComplaintsTable.jsx";
import AdminMetricCard from "../../../components/staff/AdminMetricCard.jsx";
import ComplaintsBarChart from "../../../components/staff/ComplaintsBarChart.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

const metrics = [
  {
    label: "Total Complaints",
    value: "1,248",
    icon: "assignment",
    iconClassName: "bg-blue-50 text-blue-700",
    badge: "+12%",
    badgeClassName: "bg-emerald-50 text-emerald-600",
    to: `${ROUTE_PATHS.adminComplaints}?status=all`,
  },
  {
    label: "Pending",
    value: "156",
    icon: "pending_actions",
    iconClassName: "bg-amber-50 text-amber-600",
    badge: "Urgent",
    badgeClassName: "bg-amber-50 text-amber-700",
    to: `${ROUTE_PATHS.adminComplaints}?status=pending`,
  },
  {
    label: "Resolved",
    value: "982",
    icon: "check_circle",
    iconClassName: "bg-emerald-50 text-emerald-600",
    badge: "94% Rate",
    badgeClassName: "bg-slate-50 text-secondary",
    to: `${ROUTE_PATHS.adminComplaints}?status=resolved`,
  },
  {
    label: "Rejected",
    value: "110",
    icon: "cancel",
    iconClassName: "bg-rose-50 text-rose-600",
    badge: "-3%",
    badgeClassName: "bg-rose-50 text-rose-600",
    to: `${ROUTE_PATHS.adminComplaints}?status=rejected`,
  },
];

const bars = [
  { label: "May", height: 38, opacity: 0.22 },
  { label: "Jun", height: 52, opacity: 0.35 },
  { label: "Jul", height: 43, opacity: 0.55 },
  { label: "Aug", height: 66, opacity: 0.85 },
  { label: "Sep", height: 85, active: true },
  { label: "Oct", height: 57, opacity: 0.95 },
];

const recentComplaints = [
  {
    id: "#10234",
    initials: "JD",
    customer: "Jane Doe",
    title: "Login Issue - Password reset not working",
    status: "Pending",
    department: "IT Support",
    date: "Oct 24, 2023",
    avatarClassName: "bg-slate-100 text-secondary",
  },
  {
    id: "#10235",
    initials: "JS",
    customer: "John Smith",
    title: "Billing Error - Double charge",
    status: "Resolved",
    department: "Finance",
    date: "Oct 23, 2023",
    avatarClassName: "bg-blue-100 text-blue-700",
  },
  {
    id: "#10236",
    initials: "MW",
    customer: "Mike Wilson",
    title: "Feature Request - Dark mode",
    status: "Under Review",
    department: "Product",
    date: "Oct 22, 2023",
    avatarClassName: "bg-amber-100 text-amber-700",
  },
  {
    id: "#10237",
    initials: "AB",
    customer: "Alice Brown",
    title: "Service Outage - East region",
    status: "Escalated",
    department: "Infrastructure",
    date: "Oct 21, 2023",
    avatarClassName: "bg-rose-100 text-rose-700",
  },
];

export default function StaffDashboardPage() {
  const user = useCurrentUser();

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
            <ComplaintsBarChart bars={bars} />
          </section>

          <AdminComplaintsTable complaints={recentComplaints} />
        </div>
      </main>
    </div>
  );
}
