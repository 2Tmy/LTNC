import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { ROUTE_PATHS } from "../../routes/routePaths.js";
import { createComplaint } from "../../services/complaintService.js";

const inputClass =
  "w-full rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const categories = [
  { value: "DELIVERY", label: "Delivery" },
  { value: "BILLING", label: "Billing" },
  { value: "PRODUCT", label: "Product" },
  { value: "SERVICE", label: "Service" },
  { value: "OTHER", label: "Other" },
];
const priorities = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export default function SubmitComplaintPage() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "DELIVERY",
    priority: "MEDIUM",
    orderId: "",
    description: "",
    evidenceFiles: [],
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  const updateEvidenceFiles = (event) => {
    setForm((current) => ({
      ...current,
      evidenceFiles: Array.from(event.target.files || []),
    }));
    setSubmitError("");
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (form.description.trim().length < 20) {
      nextErrors.description = "Please provide at least 20 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        orderId: form.orderId.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        evidenceFiles: form.evidenceFiles.map((file) => file.name),
      };

      const createdComplaint = await createComplaint(payload);

      navigate(`/customer/complaints/${createdComplaint.slug}`);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Unable to submit complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-5xl space-y-lg p-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <Link
                className="mb-xs inline-flex items-center gap-xs text-button text-primary hover:underline"
                to={ROUTE_PATHS.customerDashboard}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to dashboard
              </Link>
              <h1 className="text-h1 text-on-surface">Submit complaint</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                Provide the details support needs to validate and resolve your case.
              </p>
            </div>
          </div>

          <form
            className="grid grid-cols-1 gap-lg lg:grid-cols-[1.4fr_0.8fr]"
            onSubmit={handleSubmit}
            noValidate
          >
            <section className="space-y-md rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
              <div className="space-y-xs">
                <label className="text-label-md uppercase text-on-surface-variant" htmlFor="title">
                  Complaint title
                </label>
                <input
                  className={inputClass}
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="Short summary of the issue"
                />
                {errors.title ? <p className="text-body-sm text-error">{errors.title}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                <div className="space-y-xs">
                  <label className="text-label-md uppercase text-on-surface-variant" htmlFor="category">
                    Category
                  </label>
                  <select
                    className={inputClass}
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={updateField}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md uppercase text-on-surface-variant" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    className={inputClass}
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={updateField}
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                <div className="space-y-xs">
                  <label className="text-label-md uppercase text-on-surface-variant" htmlFor="orderId">
                    Order or invoice ID
                  </label>
                  <input
                    className={inputClass}
                    id="orderId"
                    name="orderId"
                    value={form.orderId}
                    onChange={updateField}
                    placeholder="ORD-12345"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md uppercase text-on-surface-variant" htmlFor="phone">
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
                  <p className="text-body-sm text-on-surface-variant">
                    Stored locally for the demo; the backend does not expose a phone field yet.
                  </p>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="text-label-md uppercase text-on-surface-variant" htmlFor="description">
                  Description
                </label>
                <textarea
                  className={`${inputClass} min-h-40 resize-y`}
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Describe what happened, when it happened, and what outcome you expect."
                />
                {errors.description ? (
                  <p className="text-body-sm text-error">{errors.description}</p>
                ) : null}
              </div>

              <div className="space-y-xs">
                <label className="text-label-md uppercase text-on-surface-variant" htmlFor="evidence">
                  Evidence files
                </label>
                <label
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[0.5rem] border border-dashed border-outline-variant bg-slate-50 px-md py-lg text-center transition hover:border-primary hover:bg-blue-50"
                  htmlFor="evidence"
                >
                  <span className="material-symbols-outlined text-[32px] text-primary-container">
                    upload_file
                  </span>
                  <span className="mt-xs text-button text-on-surface">Choose files from your device</span>
                  <span className="mt-xxs text-body-sm text-on-surface-variant">
                    PDF, images, or documents are accepted
                  </span>
                </label>
                <input
                  className="sr-only"
                  id="evidence"
                  name="evidence"
                  type="file"
                  multiple
                  onChange={updateEvidenceFiles}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />

                {form.evidenceFiles.length ? (
                  <div className="space-y-xs">
                    {form.evidenceFiles.map((file) => (
                      <div
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        className="flex items-center gap-sm rounded-[0.5rem] border border-outline-variant bg-white px-sm py-xs"
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary">attach_file</span>
                        <span className="min-w-0 flex-1 truncate text-body-sm text-on-surface">{file.name}</span>
                        <span className="shrink-0 text-body-sm text-on-surface-variant">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-sm text-on-surface-variant">No files selected yet.</p>
                )}
              </div>
            </section>

            <aside className="h-fit space-y-md rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined rounded-[0.5rem] bg-blue-50 p-xs text-primary-container">
                  info
                </span>
                <div>
                  <h2 className="text-h3 text-on-surface">Before submitting</h2>
                  <p className="text-body-sm text-on-surface-variant">
                    Clear details help staff validate faster.
                  </p>
                </div>
              </div>

              <ul className="space-y-sm text-body-sm text-on-surface-variant">
                <li className="flex gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                  Include order, invoice, or account references.
                </li>
                <li className="flex gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                  Explain the impact and expected resolution.
                </li>
                <li className="flex gap-xs">
                  <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                  Add supporting evidence when available.
                </li>
              </ul>

              {submitError ? (
                <div className="rounded-[0.5rem] border border-error/30 bg-red-50 px-md py-sm text-body-md text-error">
                  {submitError}
                </div>
              ) : null}

              <button
                className="flex w-full items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isSubmitting ? "hourglass_top" : "send"}
                </span>
                {isSubmitting ? "Submitting..." : "Submit complaint"}
              </button>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}
