import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import AdminSidebar from "../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../layouts/AdminTopBar.jsx";
import apiClient from "../../services/apiClient.js";

const STATUS_LABELS = {
  PENDING: "Pending",
  VALIDATING: "Validating",
  RESOLVING: "Resolving",
  RESOLVED: "Resolved",
};

const CATEGORY_LABELS = {
  PRODUCT: "Product",
  SERVICE: "Service",
  DELIVERY: "Delivery",
  BILLING: "Billing",
  OTHER: "Other",
};

const CATEGORY_COLORS = {
  PRODUCT: "#2563eb",
  SERVICE: "#059669",
  DELIVERY: "#ea580c",
  BILLING: "#7c3aed",
  OTHER: "#64748b",
};

const HEALTH_STYLES = {
  HEALTHY: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  WARNING: "bg-amber-50 text-amber-700 ring-amber-200",
  CRITICAL: "bg-red-50 text-red-700 ring-red-200",
};

const emptyStats = {
  totalComplaints: 0,
  countByStatus: {},
  countByCategory: {},
  avgResolutionDays: 0,
  rejectionRate: 0,
  slaBreachCount: 0,
  slaWarningCount: 0,
  totalCustomers: 0,
  activeCustomers: 0,
  customersWithComplaints: 0,
  avgComplaintsPerCustomer: 0,
  totalFeedback: 0,
  averageRating: 0,
  feedbackRate: 0,
  lowRatingCount: 0,
  ratingDistribution: {},
  monthlyTrend: [],
};


function numberValue(value) {
  return Number(value || 0);
}

function formatNumber(value, digits = 0) {
  return numberValue(value).toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function MetricCard({ label, value, tone = "blue", suffix = "" }) {
  const toneClass = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    red: "border-red-100 bg-red-50 text-red-700",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
  }[tone];

  return (
    <article className="rounded-[0.5rem] border border-outline-variant bg-white p-md shadow-sm">
      <p className="text-body-sm text-secondary">{label}</p>
      <p className={`mt-xs rounded-[0.5rem] border px-sm py-xs text-h1 ${toneClass}`}>
        {value}
        {suffix}
      </p>
    </article>
  );
}

function ChartPanel({ title, children }) {
  return (
    <section className="rounded-[0.5rem] border border-outline-variant bg-white p-lg shadow-sm">
      <h2 className="mb-md text-h3 text-on-surface">{title}</h2>
      <div className="h-[300px] min-w-0">{children}</div>
    </section>
  );
}

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-[0.5rem] bg-slate-200 ${className}`} />;
}

function NoDataBlock({ message }) {
  return (
    <div className="flex h-full items-center justify-center rounded-[0.5rem] border border-dashed border-outline-variant bg-surface-container-lowest p-md text-center text-body-md text-secondary">
      {message}
    </div>
  );
}

function AiAnalysisCard({ icon, label, content, accentClass, iconClass }) {
  return (
    <article className={`flex flex-col gap-sm rounded-[0.5rem] border border-outline-variant bg-white p-md shadow-sm ${accentClass}`}>
      <div className="flex items-center gap-xs">
        <span className={`material-symbols-outlined text-[20px] ${iconClass}`}>{icon}</span>
        <h3 className="text-label-lg font-semibold text-on-surface">{label}</h3>
      </div>
      <p className="flex-1 text-body-md leading-relaxed text-secondary">
        {content?.trim() || "—"}
      </p>
    </article>
  );
}

function AiActionCard({ badge, badgeClass, title, items }) {
  return (
    <div className="flex flex-col gap-sm rounded-[0.5rem] border border-outline-variant bg-white p-md shadow-sm">
      <div className="flex items-center gap-xs">
        <span className={`rounded-full px-sm py-[2px] text-label-sm font-medium ${badgeClass}`}>{badge}</span>
        <h3 className="text-label-lg font-semibold text-on-surface">{title}</h3>
      </div>
      <ul className="space-y-xs">
        {(items?.length ? items : ["Chưa có khuyến nghị."]).map((item, i) => (
          <li key={i} className="flex gap-xs text-body-md text-secondary">
            <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-secondary opacity-60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisPage() {
  const user = useCurrentUser();
  const [stats, setStats] = useState(emptyStats);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [aiError, setAiError] = useState("");

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");

    try {
      const response = await apiClient.get("/api/analysis/stats");
      setStats(response.data?.data || response.data || emptyStats);
    } catch (requestError) {
      setStatsError(requestError.response?.data?.message || "Không thể tải dữ liệu phân tích.");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const generateAiAnalysis = useCallback(async () => {
    setAiLoading(true);
    setAiError("");

    try {
      const response = await apiClient.post("/api/analysis/ai");
      setAiAnalysis(response.data?.data || response.data);
    } catch (requestError) {
      setAiError(requestError.response?.data?.message || "Không thể tạo AI insights.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const derived = useMemo(() => {
    const pending = numberValue(stats.countByStatus?.PENDING);
    const validating = numberValue(stats.countByStatus?.VALIDATING);
    const resolving = numberValue(stats.countByStatus?.RESOLVING);
    const resolvedTotal = numberValue(stats.countByStatus?.RESOLVED);
    const rejected = Math.round((resolvedTotal * numberValue(stats.rejectionRate)) / 100);
    const resolved = Math.max(0, resolvedTotal - rejected);

    const statusData = Object.keys(STATUS_LABELS).map((status) => ({
      status: STATUS_LABELS[status],
      count: numberValue(stats.countByStatus?.[status]),
    }));

    const categoryData = Object.keys(CATEGORY_LABELS).map((category) => ({
      category,
      name: CATEGORY_LABELS[category],
      value: numberValue(stats.countByCategory?.[category]),
    }));

    const monthlyPerformance = (stats.monthlyTrend || []).map((item) => ({
      month: `${item.month}/${item.year}`,
      avgDays: numberValue(item.avgResolutionDays),
    }));

    const monthlyCustomers = (stats.monthlyTrend || [])
      .filter((item) => numberValue(item.newCustomers) > 0)
      .map((item) => ({
        month: `${item.month}/${item.year}`,
        customers: numberValue(item.newCustomers),
      }));

    const monthlyComplaints = (stats.monthlyTrend || []).map((item) => ({
      month: `${item.month}/${item.year}`,
      total: numberValue(item.totalComplaints),
      PRODUCT: numberValue(item.byCategory?.PRODUCT),
      SERVICE: numberValue(item.byCategory?.SERVICE),
      DELIVERY: numberValue(item.byCategory?.DELIVERY),
      BILLING: numberValue(item.byCategory?.BILLING),
      OTHER: numberValue(item.byCategory?.OTHER),
    }));

    const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating: `${rating} star`,
      count: numberValue(stats.ratingDistribution?.[rating]),
    }));

    return {
      active: pending + validating + resolving,
      rejected,
      resolved,
      statusData,
      categoryData,
      monthlyPerformance,
      monthlyCustomers,
      monthlyComplaints,
      ratingDistribution,
    };
  }, [stats]);

  const health = aiAnalysis?.systemHealth || "WARNING";
  const healthClassName = HEALTH_STYLES[health] || HEALTH_STYLES.WARNING;

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1240px] space-y-lg p-xl">
          <header className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <h1 className="text-h1 text-on-surface">Analysis</h1>
              <p className="mt-xs text-body-md text-secondary">Complaint operations, SLA performance, users, and AI insights.</p>
            </div>

            <button
              type="button"
              onClick={loadStats}
              disabled={statsLoading}
              className="inline-flex h-10 items-center gap-xs rounded-[0.5rem] bg-primary px-md text-button text-on-primary disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[20px] ${statsLoading ? "animate-spin" : ""}`}>
                refresh
              </span>
              Refresh
            </button>
          </header>

          {statsError && (
            <div className="rounded-[0.5rem] border border-red-200 bg-red-50 p-md text-body-md text-red-700">
              {statsError}
            </div>
          )}

          <section className="space-y-md">
            <h2 className="text-h2 text-on-surface">Complaint overview</h2>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total complaints" value={statsLoading ? "..." : formatNumber(stats.totalComplaints)} />
              <MetricCard label="Active" value={statsLoading ? "..." : formatNumber(derived.active)} tone="amber" />
              <MetricCard label="Resolved" value={statsLoading ? "..." : formatNumber(derived.resolved)} tone="emerald" />
              <MetricCard label="Rejected" value={statsLoading ? "..." : formatNumber(derived.rejected)} tone="red" />
            </div>
            <div className="grid grid-cols-1 gap-md xl:grid-cols-2">
              <ChartPanel title="Complaints by status">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.statusData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Complaints by category">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={derived.categoryData} dataKey="value" nameKey="name" outerRadius={105} label>
                      {derived.categoryData.map((entry) => (
                        <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>
          </section>

          <section className="space-y-md">
            <h2 className="text-h2 text-on-surface">Monthly trend (6 months)</h2>
            <div className="grid grid-cols-1 gap-md xl:grid-cols-2">
              <ChartPanel title="Complaints per month">
                {derived.monthlyComplaints.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={derived.monthlyComplaints}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="PRODUCT" stackId="a" fill={CATEGORY_COLORS.PRODUCT} />
                      <Bar dataKey="SERVICE" stackId="a" fill={CATEGORY_COLORS.SERVICE} />
                      <Bar dataKey="DELIVERY" stackId="a" fill={CATEGORY_COLORS.DELIVERY} />
                      <Bar dataKey="BILLING" stackId="a" fill={CATEGORY_COLORS.BILLING} />
                      <Bar dataKey="OTHER" stackId="a" fill={CATEGORY_COLORS.OTHER} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataBlock message="Chưa có dữ liệu xu hướng tháng." />
                )}
              </ChartPanel>

              <ChartPanel title="Monthly SLA breaches">
                {derived.monthlyComplaints.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(stats.monthlyTrend || []).map((item) => ({
                        month: `${item.month}/${item.year}`,
                        breach: numberValue(item.slaBreachCount),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="breach" fill="#dc2626" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataBlock message="Chưa có dữ liệu SLA breach theo tháng." />
                )}
              </ChartPanel>
            </div>
          </section>

          <section className="space-y-md">
            <h2 className="text-h2 text-on-surface">SLA & performance</h2>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="SLA breaches" value={statsLoading ? "..." : formatNumber(stats.slaBreachCount)} tone="red" />
              <MetricCard label="SLA warnings" value={statsLoading ? "..." : formatNumber(stats.slaWarningCount)} tone="amber" />
              <MetricCard label="Avg resolution days" value={statsLoading ? "..." : formatNumber(stats.avgResolutionDays, 1)} tone="blue" />
              <MetricCard label="Rejection rate" value={statsLoading ? "..." : formatNumber(stats.rejectionRate, 1)} suffix={statsLoading ? "" : "%"} tone="slate" />
            </div>
            <ChartPanel title="Average resolution days trend">
              {derived.monthlyPerformance.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={derived.monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals />
                    <Tooltip />
                    <ReferenceLine y={15} stroke="#dc2626" strokeDasharray="4 4" label="SLA 15d" />
                    <Line type="monotone" dataKey="avgDays" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <NoDataBlock message="Chưa có dữ liệu resolution theo tháng từ API." />
              )}
            </ChartPanel>
          </section>

          <section className="space-y-md">
            <h2 className="text-h2 text-on-surface">User statistics</h2>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total customers" value={statsLoading ? "..." : formatNumber(stats.totalCustomers)} />
              <MetricCard label="Active customers" value={statsLoading ? "..." : formatNumber(stats.activeCustomers)} tone="emerald" />
              <MetricCard label="Customers with complaints" value={statsLoading ? "..." : formatNumber(stats.customersWithComplaints)} tone="amber" />
              <MetricCard label="Avg complaints/customer" value={statsLoading ? "..." : formatNumber(stats.avgComplaintsPerCustomer, 1)} tone="slate" />
            </div>
            <ChartPanel title="New customers per month">
              {derived.monthlyCustomers.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.monthlyCustomers}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoDataBlock message="Chưa có dữ liệu khách hàng mới theo tháng." />
              )}
            </ChartPanel>
          </section>

          <section className="space-y-md">
            <div>
              <h2 className="text-h2 text-on-surface">Customer feedback</h2>
              <p className="mt-xs text-body-md text-secondary">
                Satisfaction metrics from resolved complaints that customers rated.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Average rating"
                value={statsLoading ? "..." : formatNumber(stats.averageRating, 1)}
                suffix={statsLoading ? "" : "/5"}
                tone="amber"
              />
              <MetricCard
                label="Feedback responses"
                value={statsLoading ? "..." : formatNumber(stats.totalFeedback)}
                tone="blue"
              />
              <MetricCard
                label="Feedback rate"
                value={statsLoading ? "..." : formatNumber(stats.feedbackRate, 1)}
                suffix={statsLoading ? "" : "%"}
                tone="emerald"
              />
              <MetricCard
                label="Low ratings (1-2 stars)"
                value={statsLoading ? "..." : formatNumber(stats.lowRatingCount)}
                tone="red"
              />
            </div>
            <ChartPanel title="Rating distribution">
              {numberValue(stats.totalFeedback) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={derived.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="rating" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoDataBlock message="Chưa có đánh giá nào từ khách hàng." />
              )}
            </ChartPanel>
          </section>

          <section className="space-y-md">
            {/* Section header */}
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[22px] text-primary">smart_toy</span>
                <h2 className="text-h2 text-on-surface">AI Insights</h2>
              </div>
              {!aiLoading && (
                <button
                  type="button"
                  onClick={generateAiAnalysis}
                  disabled={statsLoading}
                  className="inline-flex h-9 items-center gap-xs rounded-[0.5rem] border border-outline-variant bg-white px-md text-button text-on-surface hover:bg-surface-container-lowest disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {aiAnalysis ? "refresh" : "auto_awesome"}
                  </span>
                  {aiAnalysis ? "Refresh" : "Generate"}
                </button>
              )}
            </div>

            {aiLoading ? (
              <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
                <SkeletonBlock className="h-36" />
                <SkeletonBlock className="h-36" />
                <SkeletonBlock className="h-36" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
                <SkeletonBlock className="h-28" />
              </div>
            ) : aiError ? (
              <div className="flex flex-wrap items-center justify-between gap-md rounded-[0.5rem] border border-red-200 bg-red-50 p-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[20px] text-red-600">error</span>
                  <p className="text-body-md font-medium text-red-700">{aiError}</p>
                </div>
                <button
                  type="button"
                  onClick={generateAiAnalysis}
                  className="inline-flex h-9 items-center gap-xs rounded-[0.5rem] border border-red-300 bg-white px-md text-button text-red-700"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Thử lại
                </button>
              </div>
            ) : !aiAnalysis ? (
              null
            ) : (
              <>
                {/* Health banner */}
                <div className={`flex flex-wrap items-center gap-md rounded-[0.5rem] border p-sm px-md ${healthClassName} ring-1`}>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">
                      {health === "HEALTHY" ? "check_circle" : health === "CRITICAL" ? "dangerous" : "warning"}
                    </span>
                    <span className="text-label-lg font-semibold">System health: {health}</span>
                  </div>
                  <span className="text-body-sm opacity-75">
                    Generated {aiAnalysis.generatedAt || "N/A"}
                  </span>
                </div>

                {/* Analysis cards */}
                <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
                  <AiAnalysisCard
                    icon="trending_up"
                    label="Xu hướng 6 tháng"
                    content={aiAnalysis.trendSummary}
                    accentClass="border-t-2 border-t-blue-500"
                    iconClass="text-blue-600"
                  />
                  <AiAnalysisCard
                    icon="manage_search"
                    label="Nguyên nhân gốc rễ"
                    content={aiAnalysis.rootCause}
                    accentClass="border-t-2 border-t-amber-500"
                    iconClass="text-amber-600"
                  />
                  <AiAnalysisCard
                    icon="tips_and_updates"
                    label="Dự báo tháng tới"
                    content={aiAnalysis.prediction}
                    accentClass="border-t-2 border-t-violet-500"
                    iconClass="text-violet-600"
                  />
                </div>

                {/* Action cards */}
                <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
                  <AiActionCard
                    badge="Ngay"
                    badgeClass="bg-red-100 text-red-700"
                    title="Immediate actions"
                    items={aiAnalysis.immediateActions}
                  />
                  <AiActionCard
                    badge="24–48h"
                    badgeClass="bg-amber-100 text-amber-700"
                    title="Short-term actions"
                    items={aiAnalysis.shortTermActions}
                  />
                  <AiActionCard
                    badge="Tuần này"
                    badgeClass="bg-emerald-100 text-emerald-700"
                    title="Weekly actions"
                    items={aiAnalysis.weeklyActions}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
