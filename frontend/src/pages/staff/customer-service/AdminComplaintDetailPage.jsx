import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getComplaintByCode } from "../../../services/complaintService.js";
import { ROUTE_PATHS } from "../../../routes/routePaths.js";

const statusStyles = {
  Pending: "bg-orange-50 text-orange-700",
  Validating: "bg-blue-50 text-blue-700",
  "Needs Info": "bg-yellow-50 text-yellow-700",
  Investigating: "bg-indigo-50 text-indigo-700",
  Resolving: "bg-cyan-50 text-cyan-700",
  Resolved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const stepOrder = ["Pending", "Validating", "Investigating", "Resolving", "Resolved"];

const getStatusIndex = (status) => {
  const index = stepOrder.indexOf(status);
  return index === -1 ? 0 : index;
};

export default function AdminComplaintDetailPage() {
  const user = useCurrentUser();
  const { complaintId } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await getComplaintByCode(complaintId);
        setComplaint(data);
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

    if (complaintId) {
      fetchComplaint();
    }
  }, [complaintId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background text-on-background">
        <AdminSidebar user={user} />
        <main className="min-w-0 flex-1 bg-surface">
          <AdminTopBar user={user} />

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
        <AdminSidebar user={user} />
        <main className="min-w-0 flex-1 bg-surface">
          <AdminTopBar user={user} />

          <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center p-lg">
            <div className="w-full rounded-[0.75rem] border border-outline-variant bg-white p-xl text-center shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
                person_search
              </span>
              <h1 className="mt-md text-h1 text-on-surface">Complaint not found</h1>
              <p className="mt-sm text-body-lg text-on-surface-variant">{loadError}</p>

              <Link
                className="mt-lg inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container"
                to={ROUTE_PATHS.adminDashboard}
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
      description: "Customer submitted the complaint",
      icon: "check",
    },
    {
      label: "Validating",
      description: "Staff viewed and validated the complaint",
      icon: "fact_check",
    },
    {
      label: "Investigating",
      description: "Specialist received and is handling it",
      icon: "search",
    },
    {
      label: "Resolving",
      description: "Specialist reply is waiting for manager review",
      icon: "rate_review",
    },
    {
      label: "Resolved",
      description: "Manager decision returned to customer",
      icon: "task_alt",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <AdminSidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <AdminTopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-lg p-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <Link
                className="mb-xs inline-flex items-center gap-xs text-button text-primary hover:underline"
                to={ROUTE_PATHS.adminDashboard}
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

            <div className="mt-lg grid grid-cols-1 gap-md md:grid-cols-5">
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
                  <p className="text-label-md uppercase text-on-surface-variant">Raw status</p>
                  <p className="mt-xxs text-body-md text-on-surface">{complaint.rawStatus}</p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Category</p>
                  <p className="mt-xxs text-body-md text-on-surface">{complaint.category}</p>
                </div>

                <div>
                  <p className="text-label-md uppercase text-on-surface-variant">Priority</p>
                  <p className="mt-xxs text-body-md text-on-surface">{complaint.priority}</p>
                </div>

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

              <div>
                <p className="text-label-md uppercase text-on-surface-variant">Resolution</p>
                <p className="mt-xs whitespace-pre-line rounded-[0.5rem] bg-slate-50 p-md text-body-md leading-7 text-on-surface-variant">
                  {complaint.resolution || "No resolution has been proposed yet."}
                </p>
              </div>
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

                <div className="mt-md space-y-xs">
                  {complaint.evidence?.length ? (
                    complaint.evidence.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-sm rounded-[0.5rem] border border-outline-variant bg-slate-50 px-sm py-xs"
                      >
                        <span className="material-symbols-outlined text-[20px] text-primary">
                          attach_file
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-sm text-on-surface">{file.name}</p>
                          <p className="text-body-sm text-on-surface-variant">
                            {file.type || "Uploaded file"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-body-sm text-on-surface-variant">
                      No evidence files were uploaded.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h3 text-on-surface">Workflow owners</h2>

                <div className="mt-md space-y-sm">
                  <div>
                    <p className="text-label-md uppercase text-on-surface-variant">Validated by</p>
                    <p className="mt-xxs text-body-md text-on-surface">{complaint.validatedByName}</p>
                  </div>

                  <div>
                    <p className="text-label-md uppercase text-on-surface-variant">Assigned to</p>
                    <p className="mt-xxs text-body-md text-on-surface">{complaint.assignedToName}</p>
                  </div>

                  <div>
                    <p className="text-label-md uppercase text-on-surface-variant">Approved by</p>
                    <p className="mt-xxs text-body-md text-on-surface">{complaint.approvedByName}</p>
                  </div>
                </div>
              </section>

            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
