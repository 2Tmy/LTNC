import { useSearchParams } from "react-router-dom";
import AdminComplaintsTable from "../../../components/staff/AdminComplaintsTable.jsx";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { adminComplaints, adminUser } from "../../../mocks/adminMock.js";

const queueStats = [
  { label: "New today", value: "24", icon: "fiber_new", color: "bg-blue-50 text-blue-700" },
  { label: "Pending validation", value: "156", icon: "pending_actions", color: "bg-amber-50 text-amber-700" },
  { label: "Escalated", value: "18", icon: "priority_high", color: "bg-rose-50 text-rose-700" },
];

export default function ReceiveComplaintsPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const filteredComplaints =
    statusFilter === "all"
      ? adminComplaints
      : adminComplaints.filter((complaint) => complaint.status.toLowerCase() === statusFilter);
  const titleByStatus = {
    all: "All complaints",
    pending: "Pending complaints",
    resolved: "Resolved complaints",
    rejected: "Rejected complaints",
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={adminUser} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">{titleByStatus[statusFilter] || "Complaints"}</h1>
            <p className="mt-xs text-body-md text-secondary">Review incoming complaints and route them to the right team.</p>
          </div>

          <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            {queueStats.map((stat) => (
              <article key={stat.label} className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <div className={`mb-md flex h-11 w-11 items-center justify-center rounded-[0.5rem] ${stat.color}`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <p className="text-body-md text-secondary">{stat.label}</p>
                <p className="mt-xs text-[32px] font-bold leading-10 text-on-surface">{stat.value}</p>
              </article>
            ))}
          </section>

          <AdminComplaintsTable complaints={filteredComplaints} />
        </div>
      </main>
    </div>
  );
}
