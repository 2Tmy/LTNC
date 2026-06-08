import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import EvidenceFileList from "../../../components/complaint/EvidenceFileList.jsx";
import {
  getComplaintByCode,
  validateComplaint,
  rejectComplaint,
  proposeResolution,
  sendComplaintResponse,
} from "../../../services/complaintService.js";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

const statusStyles = {
  Pending: "bg-orange-50 text-orange-700",
  Validating: "bg-blue-50 text-blue-700",
  Resolving: "bg-cyan-50 text-cyan-700",
  Resolved: "bg-green-50 text-green-700",
};

const stepOrder = ["Pending", "Validating", "Resolving", "Resolved"];

const checklistItems = [
  ["withinScope", "Handling scope", "The complaint concerns a product or delivery handled by this team."],
  ["orderReferenceValid", "Order reference", "Order or tracking ID matches the reported transaction."],
  ["descriptionValid", "Complaint description", "The issue, impact, and relevant circumstances are clear."],
  ["evidenceValid", "Supporting evidence", "Attached image or PDF supports the reported issue."],
];

const emptyChecklist = Object.fromEntries(checklistItems.map(([key]) => [key, null]));
const emptyInvestigationForm = { rootCause: "", resolution: "" };

export default function AdminComplaintDetailPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { complaintId } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Action state
  const [checklist, setChecklist] = useState(emptyChecklist);
  const [validationPriority, setValidationPriority] = useState("MEDIUM");
  const [rejectionReason, setRejectionReason] = useState("");
  const [invForm, setInvForm] = useState(emptyInvestigationForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchComplaint = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getComplaintByCode(complaintId);
      setComplaint(data);
      if (data.rawStatus === "RESOLVING") {
        setInvForm({
          rootCause: data.rootCause || "",
          resolution: data.resolution || "",
        });
      }
    } catch (error) {
      setComplaint(null);
      setLoadError(
        error.response?.data?.message || "The complaint may have been removed or the link is incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) fetchComplaint();
  }, [complaintId]);

  const setChoice = (key, value) =>
    setChecklist((prev) => ({ ...prev, [key]: value }));

  const allValid = checklistItems.every(([key]) => checklist[key] === true);
  const hasInvalid = checklistItems.some(([key]) => checklist[key] === false);
  const allEvaluated = checklistItems.every(([key]) => checklist[key] !== null);

  const handleValidate = async () => {
    setSaving(true);
    setActionError("");
    try {
      await validateComplaint(complaint.apiId, { ...checklist, priority: validationPriority });
      navigate(-1);
    } catch (e) {
      setActionError(e.response?.data?.message || "Unable to validate complaint.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    setActionError("");
    try {
      await rejectComplaint(complaint.apiId, { ...checklist, rejectionReason });
      navigate(-1);
    } catch (e) {
      setActionError(e.response?.data?.message || "Unable to reject complaint.");
    } finally {
      setSaving(false);
    }
  };

  const handleProposeResolution = async () => {
    setSaving(true);
    setActionError("");
    try {
      const updated = await proposeResolution(complaint.apiId, invForm);
      setComplaint(updated);
      setInvForm({
        rootCause: updated.rootCause || "",
        resolution: updated.resolution || "",
      });
    } catch (e) {
      setActionError(e.response?.data?.message || "Unable to save resolution.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendResponse = async () => {
    setSaving(true);
    setActionError("");
    try {
      await sendComplaintResponse(complaint.apiId);
      navigate(-1);
    } catch (e) {
      setActionError(e.response?.data?.message || "Unable to send response.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <AdminSidebar user={user} />
        <main className="min-w-0 flex-1">
          <AdminTopBar user={user} />
          <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="rounded-xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
              <span className="material-symbols-outlined animate-spin text-[40px] text-blue-500">progress_activity</span>
              <p className="mt-3 text-sm text-slate-500">Loading complaint...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <AdminSidebar user={user} />
        <main className="min-w-0 flex-1">
          <AdminTopBar user={user} />
          <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-slate-300">search_off</span>
              <h1 className="mt-3 text-lg font-bold text-slate-800">Complaint not found</h1>
              <p className="mt-1 text-sm text-slate-500">{loadError}</p>
              <Link
                to={ROUTE_PATHS.adminDashboard}
                className="mt-5 inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeIndex = stepOrder.indexOf(complaint.status);
  const timelineSteps = [
    { label: "Pending",    description: "Customer submitted the complaint",        icon: "inbox"      },
    { label: "Validating", description: "Admin is checking whether the complaint is valid", icon: "fact_check" },
    { label: "Resolving",  description: "Admin is investigating, handling root cause, and preparing a solution", icon: "rate_review" },
    { label: "Resolved",   description: "Response sent to customer",               icon: "task_alt"   },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <h1 className="text-2xl font-bold text-slate-900">{complaint.id}</h1>
              <p className="mt-0.5 text-sm text-slate-500">{complaint.title}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[complaint.status] || "bg-slate-100 text-slate-700"}`}
            >
              {complaint.status}
            </span>
          </div>

          {/* Timeline */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Complaint Status</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {timelineSteps.map((step, index) => {
                const isDone = index < activeIndex;
                const isActive = index === activeIndex;
                return (
                  <div
                    key={step.label}
                    className={`rounded-lg border p-3 ${isActive ? "border-blue-300 bg-blue-50" : isDone ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}
                  >
                    <div
                      className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-white ${isActive ? "bg-blue-600" : isDone ? "bg-green-600" : "bg-slate-300"}`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {isDone ? "check" : step.icon}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{step.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Left — complaint detail */}
            <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              {complaint.rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-semibold uppercase text-red-700">Rejection reason</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-red-800">{complaint.rejectionReason}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Title</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{complaint.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  ["Category", complaint.category],
                  ["Priority", complaint.priority || "Not set"],
                  ["Order ID", complaint.orderId || "Not provided"],
                  ["Phone", complaint.phone || "Not provided"],
                  ["Submitted", complaint.submittedAt],
                  ["Last updated", complaint.lastUpdated],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 text-sm text-slate-700">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
                <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                  {complaint.description}
                </p>
              </div>

              {complaint.rootCause && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Root cause</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{complaint.rootCause}</p>
                </div>
              )}

              {complaint.resolution && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resolution</p>
                  <p className="mt-2 whitespace-pre-line rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    {complaint.resolution}
                  </p>
                </div>
              )}
            </section>

            {/* Right — sidebar */}
            <aside className="space-y-4">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">Customer</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="text-sm text-slate-700">{complaint.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm text-slate-700">{complaint.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm text-slate-700">{complaint.phone || "Not provided"}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">Evidence files</h2>
                <EvidenceFileList files={complaint.evidence} />
              </section>

              {complaint.feedback && (
                <section className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-700">Customer feedback</h2>
                    <span className="text-xs text-slate-400">{complaint.feedback.submittedAt}</span>
                  </div>
                  <div className="mt-3 flex gap-0.5" aria-label={`${complaint.feedback.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`material-symbols-outlined text-[24px] ${
                          star <= complaint.feedback.rating ? "text-amber-400" : "text-slate-200"
                        }`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    {complaint.feedback.rating}/5 from {complaint.feedback.customerName}
                  </p>
                  {complaint.feedback.comment && (
                    <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {complaint.feedback.comment}
                    </p>
                  )}
                </section>
              )}

            </aside>
          </div>

          {/* ── Action panels ────────────────────────────────────────────── */}
          {actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>
          )}

          {/* VALIDATING - validate checklist */}
          {complaint.rawStatus === "VALIDATING" && (
            <section className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-base font-semibold text-slate-800">Validation checklist</h2>
              <p className="mb-4 text-sm text-slate-500">
                Evaluate each item, then validate or reject the complaint.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {checklistItems.map(([key, label, detail]) => (
                  <article key={key} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setChoice(key, true)}
                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${checklist[key] === true ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">check</span> Valid
                      </button>
                      <button
                        type="button"
                        onClick={() => setChoice(key, false)}
                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${checklist[key] === false ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span> Invalid
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Priority</span>
                  <p className="mt-0.5 text-xs text-slate-500">Assign priority based on severity and impact.</p>
                  <select
                    value={validationPriority}
                    onChange={(e) => setValidationPriority(e.target.value)}
                    className="mt-2 w-48 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </label>
              </div>

              {hasInvalid && (
                <label className="mt-4 block">
                  <span className="text-sm font-semibold text-red-700">Rejection reason</span>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this complaint cannot be accepted."
                    className="mt-1 min-h-20 w-full rounded-lg border border-red-200 p-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-300"
                  />
                </label>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!allValid || saving}
                  onClick={handleValidate}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Validate and move to resolving"}
                </button>
                <button
                  type="button"
                  disabled={!allEvaluated || !hasInvalid || !rejectionReason.trim() || saving}
                  onClick={handleReject}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Reject complaint"}
                </button>
              </div>
            </section>
          )}

          {/* RESOLVING - investigation, solution, and response */}
          {complaint.rawStatus === "RESOLVING" && (
            <section className="rounded-xl border border-indigo-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-base font-semibold text-slate-800">Root Cause & Resolution</h2>
              <p className="mb-4 text-sm text-slate-500">
                Record the root cause and draft the customer-facing response.
              </p>

              <div className="space-y-4">
                {[
                  ["rootCause", "Root cause", "What caused the issue?"],
                  ["resolution", "Resolution sent to customer", "What is being done to resolve the complaint?"],
                ].map(([field, label, placeholder]) => (
                  <label key={field} className="block">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <textarea
                      value={invForm[field]}
                      onChange={(e) => setInvForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="mt-1 min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={
                    !invForm.rootCause.trim() ||
                    !invForm.resolution.trim() ||
                    saving
                  }
                  onClick={handleProposeResolution}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save solution"}
                </button>
                <button
                  type="button"
                  disabled={!complaint.resolution || saving}
                  onClick={handleSendResponse}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-40"
                >
                  {saving ? "Sending..." : "Send response and resolve"}
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
