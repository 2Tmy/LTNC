import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  getFeedback,
} from "../../../services/complaintService.js";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

// ── Meta ─────────────────────────────────────────────────────────────────────

const FROM_META = {
  validate: {
    step: 2, label: "Validate complaints", back: ROUTE_PATHS.adminReview,
    accent: "bg-blue-600", pill: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "fact_check",
  },
  process: {
    step: 3, label: "Process complaints", back: ROUTE_PATHS.adminProcess,
    accent: "bg-indigo-600", pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: "search",
  },
  response: {
    step: 4, label: "Send final responses", back: ROUTE_PATHS.adminResponse,
    accent: "bg-green-600", pill: "bg-green-50 text-green-700 border-green-200",
    icon: "send",
  },
};

const STATUS_BADGE = {
  Pending:    "bg-orange-50 text-orange-700 border-orange-200",
  Validating: "bg-blue-50 text-blue-700 border-blue-200",
  Resolving:  "bg-indigo-50 text-indigo-700 border-indigo-200",
  Resolved:   "bg-green-50 text-green-700 border-green-200",
  Rejected:   "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_BADGE = {
  Low:    "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High:   "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

const stepOrder = ["Pending", "Validating", "Resolving", "Resolved"];

const checklistItems = [
  ["withinScope",        "Handling scope",       "The complaint concerns a product or delivery handled by this team."],
  ["orderReferenceValid","Order reference",       "Order or tracking ID matches the reported transaction."],
  ["descriptionValid",   "Complaint description","The issue, impact, and relevant circumstances are clear."],
  ["evidenceValid",      "Supporting evidence",  "Attached image or PDF supports the reported issue."],
];

const emptyChecklist      = Object.fromEntries(checklistItems.map(([k]) => [k, null]));
const emptyInvestigation  = { investigationSummary: "", rootCause: "", resolution: "" };

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminComplaintDetailPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { complaintId } = useParams();
  const [searchParams] = useSearchParams();
  const from = FROM_META[searchParams.get("from")] || null;

  const [complaint,  setComplaint]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState("");
  const [feedback,   setFeedback]   = useState(null);

  const [checklist,          setChecklist]          = useState(emptyChecklist);
  const [validationPriority, setValidationPriority] = useState("MEDIUM");
  const [rejectionReason,    setRejectionReason]    = useState("");
  const [invForm,            setInvForm]            = useState(emptyInvestigation);
  const [saving,             setSaving]             = useState(false);
  const [actionError,        setActionError]        = useState("");

  const fetchComplaint = async () => {
    setLoading(true); setLoadError("");
    try {
      const data = await getComplaintByCode(complaintId);
      setComplaint(data);
      if (data.rawStatus === "RESOLVED") {
        const fb = await getFeedback(data.complaintCode).catch(() => null);
        setFeedback(fb);
      }
      if (data.rawStatus === "INVESTIGATING" || data.rawStatus === "RESOLVING") {
        setInvForm({
          investigationSummary: data.investigationSummary || "",
          rootCause:            data.rootCause            || "",
          resolution:           data.resolution           || "",
        });
      }
    } catch (e) {
      setComplaint(null);
      setLoadError(e.response?.data?.message || "Complaint not found or link is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (complaintId) fetchComplaint(); }, [complaintId]);

  const setChoice = (key, val) => setChecklist(p => ({ ...p, [key]: val }));
  const allValid    = checklistItems.every(([k]) => checklist[k] === true);
  const hasInvalid  = checklistItems.some(([k])  => checklist[k] === false);
  const allEvald    = checklistItems.every(([k]) => checklist[k] !== null);

  const goBack = () => from ? navigate(from.back) : navigate(-1);

  const handleValidate = async () => {
    setSaving(true); setActionError("");
    try   { await validateComplaint(complaint.apiId, { ...checklist, priority: validationPriority }); goBack(); }
    catch (e) { setActionError(e.response?.data?.message || "Unable to validate complaint."); }
    finally   { setSaving(false); }
  };

  const handleReject = async () => {
    setSaving(true); setActionError("");
    try   { await rejectComplaint(complaint.apiId, { ...checklist, rejectionReason }); goBack(); }
    catch (e) { setActionError(e.response?.data?.message || "Unable to reject complaint."); }
    finally   { setSaving(false); }
  };

  const handleProposeResolution = async () => {
    setSaving(true); setActionError("");
    try   { await proposeResolution(complaint.apiId, invForm); goBack(); }
    catch (e) { setActionError(e.response?.data?.message || "Unable to save resolution."); }
    finally   { setSaving(false); }
  };

  const handleSendResponse = async () => {
    setSaving(true); setActionError("");
    try   { await sendComplaintResponse(complaint.apiId); goBack(); }
    catch (e) { setActionError(e.response?.data?.message || "Unable to send response."); }
    finally   { setSaving(false); }
  };

  // ── Loading / Error shells ────────────────────────────────────────────────

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      <main className="flex min-w-0 flex-1 items-center justify-center">
        <AdminTopBar user={user} />
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[48px] text-blue-500">progress_activity</span>
          <p className="mt-3 text-sm text-slate-500">Loading complaint…</p>
        </div>
      </main>
    </div>
  );

  if (!complaint) return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-[56px] text-slate-200">search_off</span>
            <h1 className="mt-4 text-lg font-bold text-slate-800">Complaint not found</h1>
            <p className="mt-1 text-sm text-slate-500">{loadError}</p>
            <Link to={ROUTE_PATHS.adminDashboard}
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  const activeIndex  = complaint.status === "Rejected" ? 1 : stepOrder.indexOf(complaint.status);
  const timelineSteps = [
    { label: "Pending",    desc: "Customer submitted the complaint",             icon: "inbox"       },
    { label: "Validating", desc: "Admin reviewed and validated the complaint",   icon: "fact_check"  },
    { label: "Resolving",  desc: "Admin is investigating and preparing a response", icon: "rate_review" },
    { label: "Resolved",   desc: "Response sent to customer",                    icon: "task_alt"    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        {/* ── Step context banner ───────────────────────────────────────── */}
        {from && (
          <div className={`flex items-center gap-3 border-b border-white/20 px-6 py-2.5 text-white ${from.accent}`}>
            <span className="material-symbols-outlined text-[18px]">{from.icon}</span>
            <span className="text-sm font-semibold">Step {from.step} — {from.label}</span>
            <span className="mx-2 text-white/40">|</span>
            <span className="text-xs text-white/70">You're reviewing this complaint from the list above</span>
          </div>
        )}

        <div className="mx-auto w-full max-w-6xl space-y-5 p-6">

          {/* ── Header ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button type="button" onClick={goBack}
                className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                {from ? `Back to Step ${from.step}` : "Back"}
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{complaint.id}</h1>
              <p className="mt-0.5 text-base text-slate-500">{complaint.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {complaint.rawStatus !== "PENDING_VALIDATION" && (
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${PRIORITY_BADGE[complaint.priority] || "bg-slate-100 text-slate-600"}`}>
                  {complaint.priority}
                </span>
              )}
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_BADGE[complaint.status] || "bg-slate-100 text-slate-600"}`}>
                {complaint.status}
              </span>
            </div>
          </div>

          {/* ── Timeline ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-0">
            {timelineSteps.map((step, i) => {
              const isDone   = i < activeIndex;
              const isActive = i === activeIndex;
              return (
                <div key={step.label} className="flex flex-1 items-center">
                  <div className={`flex flex-1 flex-col items-center rounded-xl px-3 py-3 text-center transition
                    ${isActive ? "bg-blue-600 text-white shadow-md" : isDone ? "bg-green-50 text-green-800" : "bg-white text-slate-400"}`}>
                    <span className={`material-symbols-outlined text-[22px]`} style={{ fontVariationSettings: isDone ? "'FILL' 1" : "'FILL' 0" }}>
                      {isDone ? "check_circle" : step.icon}
                    </span>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide">{step.label}</p>
                    <p className={`mt-0.5 hidden text-[10px] sm:block ${isActive ? "text-blue-100" : isDone ? "text-green-600" : "text-slate-300"}`}>
                      {step.desc}
                    </p>
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`h-0.5 w-4 shrink-0 ${i < activeIndex ? "bg-green-400" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Rejection banner ─────────────────────────────────────────── */}
          {complaint.rejectionReason && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <span className="material-symbols-outlined mt-0.5 text-[20px] text-red-500">cancel</span>
              <div>
                <p className="text-xs font-bold uppercase text-red-600">Rejected</p>
                <p className="mt-0.5 text-sm text-red-800">{complaint.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* ── Main grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">

            {/* Left */}
            <div className="space-y-4">

              {/* Meta chips */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Complaint details</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  {[
                    ["Category",     complaint.category],
                    ...(complaint.rawStatus !== "PENDING_VALIDATION" ? [["Priority", complaint.priority]] : []),
                    ["Order ID",     complaint.orderId    || "—"],
                    ["Phone",        complaint.phone      || "—"],
                    ["Submitted",    complaint.submittedAt],
                    ["Last updated", complaint.lastUpdated],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Description</h2>
                <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {complaint.description}
                </p>
              </div>

              {/* Investigation results (read-only when Resolving/Resolved) */}
              {(complaint.investigationSummary || complaint.rootCause) && (
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-indigo-400">Investigation findings</h2>
                  <div className="space-y-3">
                    {complaint.investigationSummary && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Summary</p>
                        <p className="mt-1 text-sm text-slate-700">{complaint.investigationSummary}</p>
                      </div>
                    )}
                    {complaint.rootCause && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Root cause</p>
                        <p className="mt-1 text-sm text-slate-700">{complaint.rootCause}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resolution (read-only) */}
              {complaint.resolution && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-green-600">task_alt</span>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-green-700">Resolution for customer</h2>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-green-900">{complaint.resolution}</p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">

              {/* Customer */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Customer</h2>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {complaint.customer?.slice(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{complaint.customer}</p>
                    <p className="truncate text-xs text-slate-500">{complaint.email}</p>
                    {complaint.phone && <p className="text-xs text-slate-500">{complaint.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Evidence files</h2>
                <EvidenceFileList files={complaint.evidence} />
              </div>

              {/* Customer feedback — only for resolved complaints */}
              {complaint.rawStatus === "RESOLVED" && (
                <div className={`rounded-2xl border-2 p-5 shadow-sm ${feedback ? "border-yellow-300 bg-yellow-50" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${feedback ? "text-yellow-500" : "text-slate-300"}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer feedback</h2>
                    {feedback && (
                      <span className="ml-auto rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-yellow-900">NEW</span>
                    )}
                  </div>

                  {feedback ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`material-symbols-outlined text-[22px] ${s <= feedback.rating ? "text-yellow-400" : "text-slate-200"}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        ))}
                        <span className="ml-2 text-sm font-bold text-slate-700">{feedback.rating}/5</span>
                      </div>
                      {feedback.comment && (
                        <p className="rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                          "{feedback.comment}"
                        </p>
                      )}
                      {feedback.submittedAt && (
                        <p className="text-[10px] text-slate-400">
                          Submitted {new Date(feedback.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">No feedback submitted yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Action error ──────────────────────────────────────────────── */}
          {actionError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {actionError}
            </div>
          )}

          {/* ── ACTION: Validate ─────────────────────────────────────────── */}
          {complaint.rawStatus === "PENDING_VALIDATION" && (
            <div className="rounded-2xl border-2 border-blue-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50 px-6 py-4 rounded-t-2xl">
                <span className="material-symbols-outlined text-[22px] text-blue-600">fact_check</span>
                <div>
                  <h2 className="text-base font-bold text-blue-900">Validation checklist</h2>
                  <p className="text-xs text-blue-600">Evaluate each item, then validate or reject.</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {checklistItems.map(([key, label, detail]) => {
                    const state = checklist[key];
                    return (
                      <div key={key} className={`rounded-xl border-2 p-4 transition
                        ${state === true  ? "border-green-300 bg-green-50"
                        : state === false ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-slate-50"}`}>
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => setChoice(key, true)}
                            className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition
                              ${state === true ? "border-green-500 bg-green-500 text-white" : "border-slate-300 text-slate-500 hover:border-green-400 hover:bg-green-50 hover:text-green-700"}`}>
                            Valid
                          </button>
                          <button type="button" onClick={() => setChoice(key, false)}
                            className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition
                              ${state === false ? "border-red-500 bg-red-500 text-white" : "border-slate-300 text-slate-500 hover:border-red-400 hover:bg-red-50 hover:text-red-700"}`}>
                            Invalid
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Priority selector */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-700">Assign priority</p>
                  <p className="text-xs text-slate-500">Based on severity and customer impact.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[["LOW","Low","bg-slate-100 text-slate-600 border-slate-300"],
                      ["MEDIUM","Medium","bg-blue-100 text-blue-700 border-blue-300"],
                      ["HIGH","High","bg-orange-100 text-orange-700 border-orange-300"],
                      ["URGENT","Urgent","bg-red-100 text-red-700 border-red-300"]].map(([val, label, cls]) => (
                      <button key={val} type="button" onClick={() => setValidationPriority(val)}
                        className={`rounded-full border-2 px-4 py-1.5 text-xs font-bold transition
                          ${validationPriority === val ? cls + " scale-105 shadow" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rejection reason */}
                {hasInvalid && (
                  <div>
                    <label className="mb-1 block text-sm font-bold text-red-700">Rejection reason <span className="text-red-400">*</span></label>
                    <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Explain why this complaint cannot be accepted."
                      className="min-h-24 w-full rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    />
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <button type="button" disabled={!allValid || saving} onClick={handleValidate}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {saving ? "Saving…" : "Validate & move to investigation"}
                  </button>
                  <button type="button" disabled={!allEvald || !hasInvalid || !rejectionReason.trim() || saving} onClick={handleReject}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-red-300 bg-red-50 px-6 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-40">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    {saving ? "Saving…" : "Reject complaint"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ACTION: Investigate / Resolve ────────────────────────────── */}
          {(complaint.rawStatus === "INVESTIGATING" || complaint.rawStatus === "RESOLVING") && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-6 py-4 rounded-t-2xl">
                <span className="material-symbols-outlined text-[22px] text-indigo-600">rate_review</span>
                <div>
                  <h2 className="text-base font-bold text-indigo-900">Investigation & Resolution</h2>
                  <p className="text-xs text-indigo-600">Record findings and draft the customer-facing response.</p>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {[
                  ["investigationSummary", "Investigation summary",        "What was found during investigation?",           "border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200"],
                  ["rootCause",            "Root cause",                   "What caused the issue?",                         "border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200"],
                  ["resolution",           "Resolution (sent to customer)","What action is being taken to fix this issue?",  "border-green-200 focus:border-green-400 focus:ring-green-200"],
                ].map(([field, label, ph, ring]) => (
                  <label key={field} className="block">
                    <span className={`mb-1 block text-sm font-bold ${field === "resolution" ? "text-green-700" : "text-slate-700"}`}>{label}</span>
                    <textarea value={invForm[field]} onChange={e => setInvForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder={ph} rows={field === "resolution" ? 4 : 3}
                      className={`w-full rounded-xl border-2 p-3 text-sm text-slate-700 outline-none focus:ring-2 ${ring} ${field === "resolution" ? "bg-green-50" : "bg-slate-50"}`}
                    />
                  </label>
                ))}

                <div className="flex flex-wrap gap-3 pt-1">
                  {complaint.rawStatus === "INVESTIGATING" && (
                    <button type="button" onClick={handleProposeResolution} disabled={
                      !invForm.investigationSummary.trim() || !invForm.rootCause.trim() || !invForm.resolution.trim() || saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40">
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {saving ? "Saving…" : "Save & prepare response"}
                    </button>
                  )}
                  {complaint.rawStatus === "RESOLVING" && (
                    <button type="button" onClick={handleSendResponse} disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-40">
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      {saving ? "Sending…" : "Send response & resolve"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
