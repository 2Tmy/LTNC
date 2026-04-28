import { useNavigate } from "react-router-dom";
import ComplaintStepper from "../../components/complaint/ComplaintStepper.jsx";
import ComplaintTable from "../../components/complaint/ComplaintTable.jsx";
import StatCard from "../../components/customer/StatCard.jsx";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { getAllComplaints } from "../../mocks/complaintsMock.js";
import { ROUTE_PATHS } from "../../routes/routePaths.js";

const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCILdE8Jy3Lovzgf3qbggg6eMbkGXFMM0_IlYPeo47SssEUV8gxncDTDjX9AtQFqHLTwCmIZQ0hK6va9wvaiQM9lXBXTf63pZbGLzVDLMrt-4rO-cy-N-Nd9E80RfKk0uB0rkRsKHr52jdXzUnjEFj0CCykfJxZqtiin5iSCKPj6DfclgYRJGcvXQUwH4EmHkQ-e1ltK7_wJwrJ4LF4vMAOW4vxt6x7ZhunDPDJ1pdciokKBkOX2emCM48Z0eOTTzKFf9ra6mRlRBc7";

const user = {
  firstName: "Alex",
  name: "Alex Johnson",
  avatarUrl,
};

const stats = [
  {
    label: "Total Complaints",
    value: "5",
    helperText: "+1 from last month",
    helperClassName: "text-green-600",
    icon: "description",
    iconClassName: "bg-blue-50 text-primary-container",
  },
  {
    label: "Pending",
    value: "1",
    helperText: "Awaiting review",
    helperClassName: "text-slate-400",
    icon: "pending_actions",
    iconClassName: "bg-orange-50 text-orange-600",
  },
  {
    label: "In Progress",
    value: "2",
    helperText: "Being handled",
    helperClassName: "text-indigo-400",
    icon: "sync",
    iconClassName: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "Resolved",
    value: "2",
    helperText: "Case closed",
    helperClassName: "text-green-500",
    icon: "task_alt",
    iconClassName: "bg-green-50 text-green-600",
  },
];

const statusSteps = [
  { label: "Submitted", caption: "Oct 12, 09:30", icon: "check", state: "complete" },
  { label: "Validating", caption: "Oct 12, 14:15", icon: "check", state: "complete" },
  { label: "Investigating", caption: "In progress", icon: "search", state: "active" },
  { label: "Approved", caption: "Pending", icon: "assignment_turned_in", state: "pending" },
  { label: "Resolved", caption: "Final outcome", icon: "done_all", state: "pending" },
];

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const complaints = getAllComplaints();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      <Sidebar user={user} />

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-7xl space-y-lg p-lg">
          <section className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="max-w-2xl text-body-lg text-on-surface-variant">
                Track your active service requests and manage new complaints with our streamlined resolution portal.
                We're here to help you resolve any issues quickly.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-[0.5rem] bg-primary-container px-xl py-md text-button text-white shadow-md transition-all hover:opacity-90 sm:w-auto"
                type="button"
                onClick={() => navigate(ROUTE_PATHS.submitComplaint)}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  add_circle
                </span>
                Submit New Complaint
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <ComplaintStepper complaintId="#RC-8821" statusLabel="Active Request" steps={statusSteps} />

          <ComplaintTable complaints={complaints} />
        </div>
      </main>
    </div>
  );
}
