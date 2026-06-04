import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { ROUTE_PATHS } from "../../routes/routePaths.js";
import { getComplaintByCode, submitFeedback, getFeedback } from "../../services/complaintService.js";
import EvidenceFileList from "../../components/complaint/EvidenceFileList.jsx";

const statusStyles = {
  Pending: "bg-orange-50 text-orange-700",
  Validating: "bg-blue-50 text-blue-700",
  Resolving: "bg-cyan-50 text-cyan-700",
  Resolved: "bg-green-50 text-green-700",
};

const stepOrder = ["Pending", "Validating", "Resolving", "Resolved"];

const getStatusIndex = (status) => {
  const index = stepOrder.indexOf(status);
  return index === -1 ? 0 : index;
};

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-[28px] transition ${star <= value ? "text-yellow-400" : "text-slate-300 hover:text-yellow-300"}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </button>
      ))}
    </div>
  );
}

export default function CustomerComplaintDetailPage() {
  const user = useCurrentUser();
  const { complaintId } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [feedback, setFeedback] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getComplaintByCode(complaintId);
        setComplaint(data);
        if (data.status === "Resolved") {
          const fb = await getFeedback(complaintId).catch(() => null);
          if (fb && fb.rating) {
            setFeedback(fb);
            setFeedbackRating(fb.rating);
            setFeedbackComment(fb.comment || "");
            setFeedbackSubmitted(true);
          }
        }
      } catch (error) {
        setComplaint(null);
        setLoadError(
          error.response?.data?.message ||
            "The complaint may have been removed or the link is incorrect."
        );
      } finally {
        setLoading(false);
      }
    };

    if (complaintId) fetchComplaint();
  }, [complaintId]);

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback(complaintId, { rating: feedbackRating, comment: feedbackComment });
      setFeedbackSubmitted(true);
      setFeedback({ rating: feedbackRating, comment: feedbackComment });
    } catch (e) {
      alert(e.response?.data?.message || "Unable to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background text-on-background">
        <Sidebar user={user} />
        <main className="min-w-0 flex-1 bg-surface">
          <TopBar user={user} />

          <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center p-lg">
            <div className="rounded-[0.75rem] border border-outline-variant bg-white px-lg py-xl text-center shadow-sm">
              <span className="material-symbols-outlined animate-spin text-[40px] text-primary">
                progress_activity
              </span>
              <h1 className="mt-md text-h2 text-on-surface">Loading complaint...</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                Please wait while we retrieve the complaint details.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-screen bg-background text-on-background">
        <Sidebar user={user} />
        <main className="min-w-0 flex-1 bg-surface">
          <TopBar user={user} />

          <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center p-lg">
            <div className="w-full rounded-[0.75rem] border border-outline-variant bg-white p-xl text-center shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
                person_search
              </span>
              <h1 className="mt-md text-h1 text-on-surface">Complaint not found</h1>
              <p className="mt-sm text-body-lg text-on-surface-variant">{loadError}</p>

              <Link
                className="mt-lg inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container"
                to={ROUTE_PATHS.customerDashboard}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeIndex = getStatusIndex(complaint.status);

  const timelineSteps = [
    {
      label: "Pending",
      description: "Complaint submitted to the company",
      icon: "check",
    },
    {
      label: "Validating",
      description: "Admin is validating the complaint",
      icon: "fact_check",
    },
    {
      label: "Resolving",
      description: "Admin is handling the complaint and preparing a response",
      icon: "rate_review",
    },
    {
      label: "Resolved",
      description: "Admin response sent to customer",
      icon: "task_alt",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-lg p-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <Link
                className="mb-xs inline-flex items-center gap-xs text-button text-primary hover:underline"
                to={ROUTE_PATHS.customerDashboard}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to dashboard
              </Link>

              <h1 className="text-h1 text-on-surface">
                Complaint {complaint.id || complaint.slug}
              </h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                Track the progress and review all details for this request.
              </p>
            </div>

            <span
              className={`rounded-full px-sm py-xxs text-label-md ${
                statusStyles[complaint.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {complaint.status}
            </span>
          </div>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="text-h2 text-on-surface">Complaint Status</h2>

            <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-4">
              {timelineSteps.map((step, index) => {
                const isDone = index < activeIndex;
                const isActive = index === activeIndex;
                const isUpcoming = index > activeIndex;

                return (
                  <div
                    key={step.label}
                    className={`rounded-[0.75rem] border p-md ${
                      isActive
                        ? "border-primary bg-blue-50"
                        : isDone
                          ? "border-green-200 bg-green-50"
                          : "border-outline-variant bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mb-sm flex h-10 w-10 items-center justify-center rounded-full ${
                        isActive
                          ? "bg-primary text-on-primary"
                          : isDone
                            ? "bg-green-600 text-white"
                            : "bg-slate-200 text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {isDone ? "check" : isUpcoming ? step.icon : step.icon}
                      </span>
                    </div>

                    <h3 className="text-button text-on-surface">{step.label}</h3>
                    <p className="mt-xxs text-body-sm text-on-surface-variant">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-lg lg:grid-cols-[1.3fr_0.7fr]">
            <section className="space-y-md rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
              {complaint.rejectionReason && (
                <div className="rounded-[0.5rem] border border-red-200 bg-red-50 p-md">
                  <p className="text-label-md uppercase text-red-700">Rejection reason</p>
                  <p className="mt-xs whitespace-pre-line text-body-md leading-7 text-red-800">
                    {complaint.rejectionReason}
                  </p>
                </div>
              )}
              <div>
                <p className="text-label-md uppercase text-on-surface-variant">Title</p>
                <h2 className="mt-xxs text-h2 text-on-surface">{complaint.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Complaint Code</p>
                  <p className="mt-xxs text-body-md text-on-surface">
                    {complaint.id || complaint.complaintCode || complaint.slug}
                  </p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Backend ID</p>
                  <p className="mt-xxs text-body-md text-on-surface">
                    {complaint.rawId || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Category</p>
                  <p className="mt-xxs text-body-md text-on-surface">{complaint.category}</p>
                </div>

                {complaint.priority && (
                  <div>
                    <p className="text-label-md uppercase text-on-surface-variant">Priority</p>
                    <p className="mt-xxs text-body-md text-on-surface">{complaint.priority}</p>
                  </div>
                )}

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Order ID</p>
                  <p className="mt-xxs text-body-md text-on-surface">
                    {complaint.orderId || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Phone</p>
                  <p className="mt-xxs text-body-md text-on-surface">
                    {complaint.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Submitted at</p>
                  <p className="mt-xxs text-body-md text-on-surface">
                    {complaint.submittedAt || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Last updated</p>
                  <p className="mt-xxs text-body-md text-on-surface">
                    {complaint.lastUpdated || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Edit count</p>
                  <p className="mt-xxs text-body-md text-on-surface">{complaint.editCount}</p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Edit deadline</p>
                  <p className="mt-xxs text-body-md text-on-surface">{complaint.editDeadline}</p>
                </div>
              </div>

              <div>
                <p className="text-label-md uppercase text-on-surface-variant">Description</p>
                <p className="mt-xs whitespace-pre-line text-body-md leading-7 text-on-surface">
                  {complaint.description}
                </p>
              </div>

              {complaint.status === "Resolved" && complaint.resolution ? (
                <div className="rounded-[0.75rem] border border-green-200 bg-green-50 p-md">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[20px] text-green-600">task_alt</span>
                    <p className="text-label-md font-semibold uppercase text-green-700">Resolution from admin</p>
                  </div>
                  <p className="mt-xs whitespace-pre-line text-body-md leading-7 text-green-900">
                    {complaint.resolution}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Resolution</p>
                  <p className="mt-xs whitespace-pre-line rounded-[0.5rem] bg-slate-50 p-md text-body-md leading-7 text-on-surface-variant">
                    {complaint.resolution || "No resolution has been proposed yet."}
                  </p>
                </div>
              )}
            </section>

            <aside className="space-y-md">
              <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h3 text-on-surface">Customer information</h2>

                <div className="mt-md space-y-sm">
                  <div>
                    <p className="text-label-md uppercase text-on-surface-variant">Name</p>
                    <p className="mt-xxs text-body-md text-on-surface">
                      {complaint.customer || user?.name || "Customer"}
                    </p>
                  </div>

                  <div>
                    <p className="text-label-md uppercase text-on-surface-variant">Email</p>
                    <p className="mt-xxs text-body-md text-on-surface">
                      {complaint.email || user?.email || "Not available"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h3 text-on-surface">Evidence files</h2>
                <div className="mt-md"><EvidenceFileList files={complaint.evidence} /></div>
              </section>

              {complaint.status === "Resolved" && (
                <section className="rounded-[0.75rem] border border-green-200 bg-white p-lg shadow-sm">
                  <h2 className="text-h3 text-on-surface">Your feedback</h2>
                  <p className="mt-xxs text-body-sm text-on-surface-variant">
                    How satisfied are you with the resolution?
                  </p>

                  {feedbackSubmitted ? (
                    <div className="mt-md space-y-sm">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            className={`material-symbols-outlined text-[24px] ${s <= feedbackRating ? "text-yellow-400" : "text-slate-200"}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      {feedback?.comment && (
                        <p className="rounded-[0.5rem] bg-slate-50 p-sm text-body-sm text-on-surface-variant">
                          {feedback.comment}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setFeedbackSubmitted(false)}
                        className="text-body-sm text-primary hover:underline"
                      >
                        Edit feedback
                      </button>
                    </div>
                  ) : (
                    <div className="mt-md space-y-sm">
                      <StarRating value={feedbackRating} onChange={setFeedbackRating} />
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Additional comments (optional)"
                        rows={3}
                        className="w-full rounded-[0.5rem] border border-outline-variant p-sm text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        disabled={feedbackRating === 0 || submittingFeedback}
                        onClick={handleSubmitFeedback}
                        className="w-full rounded-[0.5rem] bg-primary py-sm text-button text-on-primary transition hover:bg-primary-container disabled:opacity-40"
                      >
                        {submittingFeedback ? "Submitting..." : "Submit feedback"}
                      </button>
                    </div>
                  )}
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
