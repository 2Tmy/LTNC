import { useEffect, useMemo, useState } from "react";
import ComplaintsBarChart from "../../../components/admin/ComplaintsBarChart.jsx";
import PipelineStatusChart from "../../../components/admin/PipelineStatusChart.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints, getMonthlyComplaintVolume } from "../../../services/complaintService.js";

const statusConfig = [
  { rawStatus: "PENDING", label: "Pending", barClassName: "bg-amber-500" },
  { rawStatus: "VALIDATING", label: "Validating", barClassName: "bg-blue-500" },
  { rawStatus: "RESOLVING", label: "Resolving", barClassName: "bg-cyan-600" },
  { rawStatus: "RESOLVED", label: "Resolved", barClassName: "bg-emerald-600" },
];

const categoryConfig = [
  { rawCategory: "PRODUCT", label: "Product", barClassName: "bg-blue-500" },
  { rawCategory: "SERVICE", label: "Service", barClassName: "bg-emerald-500" },
  { rawCategory: "DELIVERY", label: "Delivery", barClassName: "bg-orange-500" },
  { rawCategory: "BILLING", label: "Billing", barClassName: "bg-violet-500" },
  { rawCategory: "OTHER", label: "Other", barClassName: "bg-slate-500" },
];

function SummaryCard({ label, value, icon, tone }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    red: "bg-red-50 text-red-700",
  }[tone] || "bg-slate-100 text-slate-700";

  return (
    <article className="rounded-[0.75rem] border border-outline-variant bg-white p-md shadow-sm">
      <div className="flex items-center justify-between gap-md">
        <div>
          <p className="text-body-sm text-secondary">{label}</p>
          <p className="mt-xs text-h1 text-on-surface">{value}</p>
        </div>
        <span className={`material-symbols-outlined rounded-[0.5rem] p-sm text-[28px] ${toneClass}`}>
          {icon}
        </span>
      </div>
    </article>
  );
}

function HorizontalBreakdown({ title, description, data, loading }) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
        <div>
          <h2 className="text-h2 text-on-surface">{title}</h2>
          <p className="mt-1 text-body-sm text-secondary">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
          {loading ? "Loading" : "Database"}
        </span>
      </div>

      <div className="space-y-sm">
        {data.map((item) => {
          const width = Math.max(4, Math.round((item.count / maxCount) * 100));

          return (
            <div key={item.label} className="grid grid-cols-[120px_minmax(0,1fr)_48px] items-center gap-sm">
              <span className="text-body-md text-on-surface">{item.label}</span>
              <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.barClassName}`}
                  style={{ width: `${width}%` }}
                  aria-label={`${item.label}: ${item.count}`}
                  role="img"
                />
              </div>
              <span className="text-right text-body-md font-semibold text-on-surface">{item.count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ComplaintAnalysisPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [monthlyVolume, setMonthlyVolume] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [complaintData, monthlyData] = await Promise.all([
          getAllComplaints(),
          getMonthlyComplaintVolume(),
        ]);
        setComplaints(complaintData);
        setMonthlyVolume(monthlyData);
      } catch (error) {
        setLoadError(error.response?.data?.message || "Unable to load complaint analysis.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, []);

  const analysis = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((complaint) => complaint.rawStatus !== "RESOLVED").length;
    const resolved = complaints.filter((complaint) => complaint.rawStatus === "RESOLVED" && !complaint.isRejected).length;
    const rejected = complaints.filter((complaint) => complaint.isRejected).length;
    const overdue = complaints.filter((complaint) => complaint.isOverdue).length;

    const pipeline = statusConfig.map((item) => ({
      ...item,
      count: complaints.filter((complaint) => complaint.rawStatus === item.rawStatus).length,
    }));

    const categories = categoryConfig.map((item) => ({
      ...item,
      count: complaints.filter((complaint) => complaint.rawCategory === item.rawCategory).length,
    }));

    const bars = monthlyVolume.map((item, index) => ({
      label: item.month,
      height: Number(item.count || 0),
      active: index === monthlyVolume.length - 1,
      opacity: 0.45 + index * 0.08,
    }));

    return { total, open, resolved, rejected, overdue, pipeline, categories, bars };
  }, [complaints, monthlyVolume]);

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <header>
            <h1 className="text-h1 text-on-surface">Complaint Analysis</h1>
            <p className="mt-xs text-body-md text-secondary">
              Live complaint metrics calculated from the current database.
            </p>
          </header>

          {loadError ? (
            <p className="rounded-[0.75rem] border border-red-200 bg-red-50 p-md text-body-md text-red-700">
              {loadError}
            </p>
          ) : null}

          <section className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Total complaints" value={loading ? "..." : analysis.total} icon="assignment" tone="blue" />
            <SummaryCard label="Open complaints" value={loading ? "..." : analysis.open} icon="pending_actions" tone="amber" />
            <SummaryCard label="Resolved" value={loading ? "..." : analysis.resolved} icon="task_alt" tone="emerald" />
            <SummaryCard label="Rejected" value={loading ? "..." : analysis.rejected} icon="cancel" tone="rose" />
            <SummaryCard label="Overdue" value={loading ? "..." : analysis.overdue} icon="priority_high" tone="red" />
          </section>

          <section className="rounded-[0.75rem] border border-red-200 bg-red-50 p-md">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-[24px] text-red-700">warning</span>
              <div>
                <h2 className="text-h3 text-red-800">Resolution SLA</h2>
                <p className="mt-xxs text-body-md text-red-700">
                  Every complaint must be completed within 15 days from the customer submission date.
                  Overdue open complaints should be handled immediately.
                </p>
              </div>
            </div>
          </section>

          <PipelineStatusChart data={analysis.pipeline} loading={loading} />
          <ComplaintsBarChart bars={analysis.bars.length ? analysis.bars : [{ label: "No data", height: 0 }]} />
          <HorizontalBreakdown
            title="Complaint Categories"
            description="Distribution across the five backend categories"
            data={analysis.categories}
            loading={loading}
          />
        </div>
      </main>
    </div>
  );
}
