import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getSubmittedComplaints, receiveComplaint } from "../../../services/complaintService.js";

const priorityStyles = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

export default function ReceiveComplaintsPage() {
  const user = useCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [receivingCode, setReceivingCode] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await getSubmittedComplaints();
      setComplaints(data);
    } catch (error) {
      console.error("Load submitted complaints error:", error);
      setLoadError(
        error.response?.data?.message ||
          "Unable to load submitted complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleReceive = async (complaintCode) => {
    setReceivingCode(complaintCode);

    try {
      await receiveComplaint(complaintCode);
      await loadComplaints();
    } catch (error) {
      console.error("Receive complaint error:", error);
      alert(error.response?.data?.message || "Unable to receive this complaint.");
    } finally {
      setReceivingCode("");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <AdminSidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <AdminTopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-lg p-lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <h1 className="text-h1 text-on-surface">Receive complaints</h1>
              <p className="mt-xs text-body-md text-on-surface-variant">
                Review newly submitted complaints and confirm receipt for handling.
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-outline-variant bg-white px-lg py-sm text-button text-on-surface shadow-sm transition hover:bg-slate-50"
              type="button"
              onClick={loadComplaints}
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              Refresh
            </button>
          </div>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <div>
                <h2 className="text-h2 text-on-surface">Submitted complaints</h2>
                <p className="mt-xxs text-body-md text-on-surface-variant">
                  These complaints are waiting for staff receipt.
                </p>
              </div>

              <span className="rounded-full bg-orange-50 px-sm py-xxs text-label-md text-orange-700">
                {complaints.length} pending
              </span>
            </div>

            {loading ? (
              <div className="mt-lg flex items-center justify-center rounded-[0.5rem] bg-slate-50 p-xl text-center">
                <div>
                  <span className="material-symbols-outlined animate-spin text-[36px] text-primary">
                    progress_activity
                  </span>
                  <p className="mt-sm text-body-md text-on-surface-variant">
                    Loading submitted complaints...
                  </p>
                </div>
              </div>
            ) : loadError ? (
              <div className="mt-lg rounded-[0.5rem] border border-error/30 bg-red-50 p-md text-body-md text-error">
                {loadError}
              </div>
            ) : complaints.length === 0 ? (
              <div className="mt-lg rounded-[0.5rem] border border-dashed border-outline-variant bg-slate-50 p-xl text-center">
                <span className="material-symbols-outlined text-[44px] text-on-surface-variant">
                  inventory_2
                </span>
                <h3 className="mt-sm text-h3 text-on-surface">No submitted complaints</h3>
                <p className="mt-xs text-body-md text-on-surface-variant">
                  There are no pending complaints waiting for receipt.
                </p>
              </div>
            ) : (
              <div className="mt-lg overflow-hidden rounded-[0.5rem] border border-outline-variant">
                <div className="hidden grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] gap-md bg-slate-50 px-md py-sm text-label-md uppercase text-on-surface-variant md:grid">
                  <span>Code / Title</span>
                  <span>Customer</span>
                  <span>Category</span>
                  <span>Priority</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="divide-y divide-outline-variant">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.slug}
                      className="grid grid-cols-1 gap-sm px-md py-md md:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center md:gap-md"
                    >
                      <div>
                        <p className="text-body-sm text-on-surface-variant">{complaint.id}</p>
                        <p className="mt-xxs font-medium text-on-surface">{complaint.title}</p>
                        <p className="mt-xxs text-body-sm text-on-surface-variant">
                          Submitted: {complaint.submittedAt}
                        </p>
                      </div>

                      <div>
                        <p className="text-body-md text-on-surface">{complaint.customer}</p>
                        <p className="text-body-sm text-on-surface-variant">{complaint.email}</p>
                      </div>

                      <p className="text-body-md text-on-surface-variant">
                        {complaint.category}
                      </p>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-sm py-xxs text-label-md ${
                            priorityStyles[complaint.priority] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {complaint.priority}
                        </span>
                      </div>

                      <div className="flex justify-start gap-xs md:justify-end">
                        <Link
                          className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] border border-outline-variant px-sm py-xs text-button text-primary transition hover:bg-blue-50"
                          to={`/admin/complaints/${complaint.slug}`}
                        >
                          View
                        </Link>

                        <button
                          className="inline-flex items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-sm py-xs text-button text-on-primary shadow-sm transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          onClick={() => handleReceive(complaint.slug)}
                          disabled={receivingCode === complaint.slug}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {receivingCode === complaint.slug ? "hourglass_top" : "download_done"}
                          </span>
                          {receivingCode === complaint.slug ? "Receiving..." : "Receive"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}