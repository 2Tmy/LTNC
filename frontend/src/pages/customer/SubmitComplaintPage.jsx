import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { getStoredComplaints } from "../../mocks/complaintsMock.js";
import { ROUTE_PATHS } from "../../routes/routePaths.js";
import { createStaffComplaintSubmittedNotification } from "../../services/notificationService.js";

const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCILdE8Jy3Lovzgf3qbggg6eMbkGXFMM0_IlYPeo47SssEUV8gxncDTDjX9AtQFqHLTwCmIZQ0hK6va9wvaiQM9lXBXTf63pZbGLzVDLMrt-4rO-cy-N-Nd9E80RfKk0uB0rkRsKHr52jdXzUnjEFj0CCykfJxZqtiin5iSCKPj6DfclgYRJGcvXQUwH4EmHkQ-e1ltK7_wJwrJ4LF4vMAOW4vxt6x7ZhunDPDJ1pdciokKBkOX2emCM48Z0eOTTzKFf9ra6mRlRBc7";

const user = {
  firstName: "Alex",
  name: window.localStorage.getItem("demoName") || "Alex Johnson",
  avatarUrl,
};

const inputClass =
  "w-full rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

const categories = ["Delivery", "Billing", "Technical", "Product Quality", "Account", "Other"];
const priorities = ["Low", "Medium", "High", "Urgent"];

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "Delivery",
    priority: "Medium",
    orderId: "",
    description: "",
    evidenceFiles: [],
    phone: "",
  });
  const [errors, setErrors] = useState({});

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const updateEvidenceFiles = (event) => {
    setForm((current) => ({
      ...current,
      evidenceFiles: Array.from(event.target.files || []),
    }));
  };

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${Math.round(size / 1024)} KB`;
    }

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

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const now = new Date();
    const sequence = Math.floor(9000 + Math.random() * 999);
    const slug = `RC-${sequence}`;
    const complaint = {
      id: `#${slug}`,
      slug,
      title: form.title.trim(),
      category: form.category,
      priority: form.priority,
      status: "Pending",
      submittedAt: now.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastUpdated: "Just now",
      customer: user.name,
      email: window.localStorage.getItem("demoEmail") || "my@gmail.com",
      phone: form.phone.trim(),
      orderId: form.orderId.trim() || "Not provided",
      description: form.description.trim(),
      evidence: form.evidenceFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type || "Unknown file type",
      })),
      timeline: [
        {
          title: "Complaint submitted",
          meta: "Just now",
          detail: "Your complaint was received and is waiting for validation.",
          state: "active",
        },
      ],
      resolution: "No resolution has been proposed yet.",
    };

    const storedComplaints = getStoredComplaints();
    window.localStorage.setItem("demoComplaints", JSON.stringify([complaint, ...storedComplaints]));
    createStaffComplaintSubmittedNotification(complaint);
    navigate(`/customer/complaints/${slug}`);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-5xl space-y-lg p-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <Link className="mb-xs inline-flex items-center gap-xs text-button text-primary hover:underline" to={ROUTE_PATHS.customerDashboard}>
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to dashboard
              </Link>
              <h1 className="text-h1 text-on-surface">Submit complaint</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                Provide the details support needs to validate and resolve your case.
              </p>
            </div>
          </div>

          <form className="grid grid-cols-1 gap-lg lg:grid-cols-[1.4fr_0.8fr]" onSubmit={handleSubmit} noValidate>
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
                  <select className={inputClass} id="category" name="category" value={form.category} onChange={updateField}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-xs">
                  <label className="text-label-md uppercase text-on-surface-variant" htmlFor="priority">
                    Priority
                  </label>
                  <select className={inputClass} id="priority" name="priority" value={form.priority} onChange={updateField}>
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
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
                  {errors.phone ? <p className="text-body-sm text-error">{errors.phone}</p> : null}
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
                {errors.description ? <p className="text-body-sm text-error">{errors.description}</p> : null}
              </div>

              <div className="space-y-xs">
                <label className="text-label-md uppercase text-on-surface-variant" htmlFor="evidence">
                  Evidence files
                </label>
                <label
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[0.5rem] border border-dashed border-outline-variant bg-slate-50 px-md py-lg text-center transition hover:border-primary hover:bg-blue-50"
                  htmlFor="evidence"
                >
                  <span className="material-symbols-outlined text-[32px] text-primary-container">upload_file</span>
                  <span className="mt-xs text-button text-on-surface">Choose files from your device</span>
                  <span className="mt-xxs text-body-sm text-on-surface-variant">PDF, images, or documents are accepted</span>
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
                        <span className="shrink-0 text-body-sm text-on-surface-variant">{formatFileSize(file.size)}</span>
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
                  <p className="text-body-sm text-on-surface-variant">Clear details help staff validate faster.</p>
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

              <button
                className="flex w-full items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container"
                type="submit"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Submit complaint
              </button>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}
