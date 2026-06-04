import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { ROUTE_PATHS } from "../../routes/routePaths.js";
import { createComplaint } from "../../services/complaintService.js";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

const COMPLAINT_TYPES = [
  {
    value: "PRODUCT",
    backendCategory: "PRODUCT",
    label: "Product",
    description: "Issues with item condition, quantity, or quality upon receipt",
    icon: "inventory_2",
    accent: "blue",
    subcategories: [
      { value: "LOST", label: "Lost Package" },
      { value: "DAMAGED", label: "Damaged / Broken Goods" },
      { value: "SHORTAGE", label: "Partial Delivery" },
      { value: "WRONG_ITEM", label: "Wrong Item Delivered" },
    ],
  },
  {
    value: "DELIVERY",
    backendCategory: "DELIVERY",
    label: "Delivery",
    description: "Issues with shipping service, courier behavior, timing, or address",
    icon: "local_shipping",
    accent: "orange",
    subcategories: [
      { value: "LATE", label: "Late Delivery" },
      { value: "WRONG_ADDRESS", label: "Delivered to Wrong Address" },
      { value: "COURIER_BEHAVIOR", label: "Courier Behavior" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    value: "SERVICE",
    backendCategory: "SERVICE",
    label: "Service",
    description: "Issues with support quality, service process, or staff handling",
    icon: "support_agent",
    accent: "emerald",
    subcategories: [
      { value: "POOR_SUPPORT", label: "Poor Support" },
      { value: "SLOW_RESPONSE", label: "Slow Response" },
      { value: "PROCESS_ISSUE", label: "Process Issue" },
      { value: "STAFF_ATTITUDE", label: "Staff Attitude" },
    ],
  },
  {
    value: "BILLING",
    backendCategory: "BILLING",
    label: "Billing",
    description: "Issues with payment, invoice, refund, or unexpected charges",
    icon: "receipt_long",
    accent: "violet",
    subcategories: [
      { value: "WRONG_CHARGE", label: "Wrong Charge" },
      { value: "REFUND_DELAY", label: "Refund Delay" },
      { value: "INVOICE_ERROR", label: "Invoice Error" },
      { value: "PAYMENT_FAILED", label: "Payment Failed" },
    ],
  },
  {
    value: "OTHER",
    backendCategory: "OTHER",
    label: "Other",
    description: "Issues that do not fit product, service, delivery, or billing",
    icon: "more_horiz",
    accent: "slate",
    subcategories: [
      { value: "GENERAL", label: "General Complaint" },
      { value: "ACCOUNT", label: "Account Issue" },
      { value: "POLICY", label: "Policy Concern" },
      { value: "OTHER", label: "Other" },
    ],
  },
];

const accentMap = {
  blue: {
    card: "border-blue-400 bg-blue-50/60",
    iconBox: "bg-blue-100 text-blue-700",
    badge: "bg-blue-600 text-white",
  },
  orange: {
    card: "border-orange-400 bg-orange-50/60",
    iconBox: "bg-orange-100 text-orange-700",
    badge: "bg-orange-600 text-white",
  },
  emerald: {
    card: "border-emerald-400 bg-emerald-50/60",
    iconBox: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-600 text-white",
  },
  violet: {
    card: "border-violet-400 bg-violet-50/60",
    iconBox: "bg-violet-100 text-violet-700",
    badge: "bg-violet-600 text-white",
  },
  slate: {
    card: "border-slate-400 bg-slate-50",
    iconBox: "bg-slate-200 text-slate-700",
    badge: "bg-slate-700 text-white",
  },
};

function StepBadge({ number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
      {number}
    </span>
  );
}

export default function SubmitComplaintPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(null);
  const [form, setForm] = useState({
    subcategory: "",
    title: "",
    orderId: "",
    description: "",
    evidenceFiles: [],
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedTypeData = COMPLAINT_TYPES.find((t) => t.value === selectedType);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
    setSubmitError("");
  };

  const updateFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setForm((f) => {
      const merged = [...f.evidenceFiles];
      for (const file of picked) {
        if (!merged.some((ef) => ef.name === file.name && ef.size === file.size)) {
          merged.push(file);
        }
      }
      return { ...f, evidenceFiles: merged };
    });
    e.target.value = "";
    setErrors((current) => ({ ...current, evidenceFiles: "" }));
  };

  const removeFile = (index) => {
    setForm((f) => ({
      ...f,
      evidenceFiles: f.evidenceFiles.filter((_, i) => i !== index),
    }));
  };

  const fmtSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validate = () => {
    const e = {};
    if (!selectedType) e.type = "Please select a complaint type.";
    if (!form.subcategory) e.subcategory = "Please select a specific issue.";
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.orderId.trim()) e.orderId = "Order or tracking ID is required.";
    if (!form.phone.trim()) e.phone = "Contact phone is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    else if (form.description.trim().length < 20) e.description = "Please provide at least 20 characters.";
    if (!form.evidenceFiles.length) e.evidenceFiles = "Attach at least one image or PDF as evidence.";
    if (form.evidenceFiles.some((file) => file.size > 10 * 1024 * 1024)) {
      e.evidenceFiles = "Each evidence file must not exceed 10 MB.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    const subLabel =
      selectedTypeData?.subcategories.find((s) => s.value === form.subcategory)?.label || form.subcategory;

    try {
      const payload = {
        title: form.title.trim(),
        category: selectedTypeData.backendCategory,
        orderId: form.orderId.trim(),
        description: `[${subLabel}]\n\n${form.description.trim()}`,
        phone: form.phone.trim(),
        evidenceFiles: form.evidenceFiles,
      };

      const created = await createComplaint(payload);
      navigate(`/customer/complaints/${created.slug}`);
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Unable to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
          {/* Page header */}
          <div>
            <Link
              to={ROUTE_PATHS.customerDashboard}
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Submit a Complaint</h1>
            <p className="mt-1 text-sm text-slate-500">
              Select the complaint category and fill in the details so our team can assist you promptly.
            </p>
          </div>

          {/* Step 1 — Type selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <StepBadge number={1} />
              <h2 className="text-base font-semibold text-slate-800">Select complaint type</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COMPLAINT_TYPES.map((type) => {
                const a = accentMap[type.accent];
                const active = selectedType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(type.value);
                      setForm((f) => ({ ...f, subcategory: "" }));
                      setErrors((err) => ({ ...err, type: "", subcategory: "" }));
                    }}
                    className={`relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      active ? `${a.card} shadow` : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${active ? a.iconBox : "bg-slate-100 text-slate-500"}`}>
                      <span className="material-symbols-outlined text-[26px]">{type.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{type.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{type.description}</p>
                    </div>
                    {active && (
                      <span className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full ${a.badge}`}>
                        <span className="material-symbols-outlined text-[13px]">check</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.type && <p className="mt-2 text-xs text-red-600">{errors.type}</p>}
          </div>

          {/* Steps 2 + 3 — shown after type is selected */}
          {selectedType && (
            <form
              className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="space-y-6">
                {/* Step 2 — Subcategory */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <StepBadge number={2} />
                    <h2 className="text-base font-semibold text-slate-800">Specific issue</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedTypeData.subcategories.map((sub) => (
                      <label
                        key={sub.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                          form.subcategory === sub.value
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="subcategory"
                          value={sub.value}
                          checked={form.subcategory === sub.value}
                          onChange={updateField}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-sm font-medium">{sub.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.subcategory && <p className="mt-2 text-xs text-red-600">{errors.subcategory}</p>}
                </div>

                {/* Step 3 — Details */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge number={3} />
                    <h2 className="text-base font-semibold text-slate-800">Complaint details</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={inputClass}
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={updateField}
                        placeholder="Brief summary of the issue"
                      />
                      {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    {/* Order */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="orderId">
                        Order / Tracking ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={inputClass}
                        id="orderId"
                        name="orderId"
                        value={form.orderId}
                        onChange={updateField}
                        placeholder="e.g. ORD-20240001"
                      />
                      {errors.orderId && <p className="mt-1 text-xs text-red-600">{errors.orderId}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="phone">
                        Contact phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        className={inputClass}
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={updateField}
                        placeholder="Your phone number"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="description">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className={`${inputClass} min-h-36 resize-y`}
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        placeholder="Describe what happened, when it occurred, and what resolution you expect."
                      />
                      {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                    </div>

                    {/* Evidence */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="evidence">
                        Supporting evidence <span className="text-red-500">*</span>
                      </label>
                      <label
                        htmlFor="evidence"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
                      >
                        <span className="material-symbols-outlined text-[32px] text-slate-400">upload_file</span>
                        <span className="mt-2 text-sm font-medium text-slate-600">Click to upload files</span>
                        <span className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP or PDF · max 10 MB per file</span>
                      </label>
                      <input
                        className="sr-only"
                        id="evidence"
                        name="evidence"
                        type="file"
                        multiple
                        onChange={updateFiles}
                        accept="image/jpeg,image/png,image/webp,.pdf"
                      />
                      {errors.evidenceFiles && <p className="mt-1 text-xs text-red-600">{errors.evidenceFiles}</p>}
                      {form.evidenceFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {form.evidenceFiles.map((file, index) => (
                            <div
                              key={`${file.name}-${file.size}`}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                              <span className="material-symbols-outlined text-[18px] text-blue-500">attach_file</span>
                              <span className="min-w-0 flex-1 truncate text-xs text-slate-700">{file.name}</span>
                              <span className="shrink-0 text-xs text-slate-400">{fmtSize(file.size)}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="ml-1 rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                aria-label={`Remove ${file.name}`}
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <aside className="h-fit space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  {submitError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSubmitting ? "hourglass_top" : "send"}
                    </span>
                    {isSubmitting ? "Submitting..." : "Submit complaint"}
                  </button>
                </div>
              </aside>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
