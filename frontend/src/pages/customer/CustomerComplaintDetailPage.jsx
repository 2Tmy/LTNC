import { Link, useParams } from "react-router-dom";
import ComplaintStatusBadge from "../../components/complaint/ComplaintStatusBadge.jsx";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { findComplaintBySlug } from "../../mocks/complaintsMock.js";
import { ROUTE_PATHS } from "../../routes/routePaths.js";

const statusClasses = {
  complete: "bg-green-600",
  active: "bg-primary-container",
  pending: "bg-slate-300",
};

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-label-md uppercase text-on-surface-variant">{label}</dt>
      <dd className="mt-xxs text-body-md font-medium text-on-surface">{value}</dd>
    </div>
  );
}

const formatFileSize = (size) => {
  if (!size) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const getEvidenceName = (file) => (typeof file === "string" ? file : file.name);

export default function CustomerComplaintDetailPage() {
  const user = useCurrentUser();
  const { complaintId } = useParams();
  const complaint = findComplaintBySlug(complaintId || "");

  if (!complaint) {
    return (
      <div className="flex min-h-screen bg-background text-on-background">
        <Sidebar user={user} />
        <main className="min-w-0 flex-1 bg-surface">
          <TopBar user={user} />
          <div className="mx-auto max-w-3xl p-lg">
            <section className="rounded-[0.75rem] border border-outline-variant bg-white p-xl text-center shadow-sm">
              <span className="material-symbols-outlined text-[44px] text-outline">search_off</span>
              <h1 className="mt-sm text-h1 text-on-surface">Complaint not found</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                The complaint may have been removed or the link is incorrect.
              </p>
              <Link
                className="mt-lg inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary"
                to={ROUTE_PATHS.customerDashboard}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to dashboard
              </Link>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-lg p-lg">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <Link className="mb-xs inline-flex items-center gap-xs text-button text-primary hover:underline" to={ROUTE_PATHS.customerDashboard}>
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to dashboard
              </Link>
              <div className="flex flex-wrap items-center gap-sm">
                <h1 className="text-h1 text-on-surface">{complaint.title}</h1>
                <ComplaintStatusBadge status={complaint.status} />
              </div>
              <p className="mt-xs text-body-md text-on-surface-variant">
                {complaint.id} submitted {complaint.submittedAt}
              </p>
            </div>

            <Link
              className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-button text-on-surface transition hover:bg-slate-50"
              to={ROUTE_PATHS.submitComplaint}
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              New complaint
            </Link>
          </div>

          <section className="grid grid-cols-1 gap-lg lg:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-lg">
              <article className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h2 text-on-surface">Complaint details</h2>
                <p className="mt-md whitespace-pre-line text-body-md text-on-surface-variant">{complaint.description}</p>

                <dl className="mt-lg grid grid-cols-1 gap-md border-t border-outline-variant pt-lg sm:grid-cols-2">
                  <InfoItem label="Category" value={complaint.category} />
                  <InfoItem label="Priority" value={complaint.priority} />
                  <InfoItem label="Order / Invoice" value={complaint.orderId} />
                  <InfoItem label="Last updated" value={complaint.lastUpdated} />
                </dl>
              </article>

              <article className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h2 text-on-surface">Timeline</h2>
                <ol className="mt-lg space-y-md">
                  {complaint.timeline.map((event) => (
                    <li key={`${event.title}-${event.meta}`} className="flex gap-sm">
                      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${statusClasses[event.state] || statusClasses.pending}`} />
                      <div>
                        <p className="text-h3 text-on-surface">{event.title}</p>
                        <p className="text-body-sm text-on-surface-variant">{event.meta}</p>
                        <p className="mt-xxs text-body-md text-on-surface-variant">{event.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>

            <aside className="space-y-lg">
              <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h2 text-on-surface">Customer</h2>
                <dl className="mt-md space-y-md">
                  <InfoItem label="Name" value={complaint.customer} />
                  <InfoItem label="Email" value={complaint.email} />
                  <InfoItem label="Phone" value={complaint.phone} />
                </dl>
              </section>

              <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h2 text-on-surface">Evidence</h2>
                <div className="mt-md space-y-sm">
                  {complaint.evidence.length ? (
                    complaint.evidence.map((file) => (
                      <div
                        key={typeof file === "string" ? file : `${file.name}-${file.size}`}
                        className="flex items-center gap-sm rounded-[0.5rem] border border-outline-variant p-sm"
                      >
                        <span className="material-symbols-outlined text-primary">attach_file</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body-md text-on-surface">{getEvidenceName(file)}</p>
                          {typeof file === "string" ? null : (
                            <p className="text-body-sm text-on-surface-variant">
                              {file.type} {formatFileSize(file.size) ? `- ${formatFileSize(file.size)}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-body-md text-on-surface-variant">No evidence files were added.</p>
                  )}
                </div>
              </section>

              <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
                <h2 className="text-h2 text-on-surface">Resolution</h2>
                <p className="mt-md text-body-md text-on-surface-variant">{complaint.resolution}</p>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
