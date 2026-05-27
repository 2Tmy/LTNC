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
    value: "GOODS",
    backendCategory: "PRODUCT",
    label: "Goods Complaint",
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
    label: "Delivery Complaint",
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
];

const priorities = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const accentMap = {
  blue: {
    card: "border-blue-400 bg-blue-50/60",
    iconBox: "bg-blue-100 text-blue-700",
    badge: "bg-blue-600 text-white",
    summary: "border-blue-200 bg-blue-50 text-blue-800",
  },
  orange: {
    card: "border-orange-400 bg-orange-50/60",
    iconBox: "bg-orange-100 text-orange-700",
    badge: "bg-orange-600 text-white",
    summary: "border-orange-200 bg-orange-50 text-orange-800",
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
    priority: "MEDIUM",
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
    setForm((f) => ({ ...f, evidenceFiles: Array.from(e.target.files || []) }));
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
    if (!form.description.trim()) e.description = "Description is required.";
    else if (form.description.trim().length < 20) e.description = "Please provide at least 20 characters.";
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
        priority: form.priority,
        orderId: form.orderId.trim(),
        description: `[${subLabel}]\n\n${form.description.trim()}`,
        phone: form.phone.trim(),
        evidenceFiles: form.evidenceFiles.map((f) => f.name),
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                    {/* Priority + Order */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="priority">
                          Priority
                        </label>
                        <select className={inputClass} id="priority" name="priority" value={form.priority} onChange={updateField}>
                          {priorities.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="orderId">
                          Order / Tracking ID
                        </label>
                        <input
                          className={inputClass}
                          id="orderId"
                          name="orderId"
                          value={form.orderId}
                          onChange={updateField}
                          placeholder="e.g. ORD-20240001"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="phone">
                        Contact phone
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
                        Supporting evidence
                      </label>
                      <label
                        htmlFor="evidence"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
                      >
                        <span className="material-symbols-outlined text-[32px] text-slate-400">upload_file</span>
                        <span className="mt-2 text-sm font-medium text-slate-600">Click to upload files</span>
                        <span className="mt-1 text-xs text-slate-400">Images, PDF, or documents</span>
                      </label>
                      <input
                        className="sr-only"
                        id="evidence"
                        name="evidence"
                        type="file"
                        multiple
                        onChange={updateFiles}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      {form.evidenceFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {form.evidenceFiles.map((file) => (
                            <div
                              key={`${file.name}-${file.size}`}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                            >
                              <span className="material-symbols-outlined text-[18px] text-blue-500">attach_file</span>
                              <span className="min-w-0 flex-1 truncate text-xs text-slate-700">{file.name}</span>
                              <span className="shrink-0 text-xs text-slate-400">{fmtSize(file.size)}</span>
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
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Summary</h3>

                  {selectedTypeData && (
                    <div className={`mb-4 rounded-lg border p-3 text-sm ${accentMap[selectedTypeData.accent].summary}`}>
                      <p className="font-semibold">{selectedTypeData.label}</p>
                      {form.subcategory && (
                        <p className="mt-0.5 text-xs opacity-80">
                          {selectedTypeData.subcategories.find((s) => s.value === form.subcategory)?.label}
                        </p>
                      )}
                    </div>
                  )}

                  <ul className="space-y-2 text-xs text-slate-500">
                    {[
                      "Include your order ID or tracking number.",
                      "Explain the impact and your expected resolution.",
                      "Attach photos or documents if available.",
                    ].map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <span className="material-symbols-outlined mt-0.5 text-[14px] text-green-500">check_circle</span>
                        {tip}
                      </li>
                    ))}
                  </ul>

                  {submitError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
