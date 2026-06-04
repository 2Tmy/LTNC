import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getSubmittedComplaints, receiveComplaint } from "../../../services/complaintService.js";

export default function ReceiveComplaintsPage() {
  const user = useCurrentUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [receivingId, setReceivingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredComplaints = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return complaints;

    return complaints.filter((complaint) =>
      [
        complaint.id,
        complaint.complaintCode,
        complaint.title,
        complaint.customer,
        complaint.email,
        complaint.phone,
        complaint.orderId,
        complaint.category,
        complaint.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [complaints, searchTerm]);

  const handleReceive = async (complaintId) => {
    setReceivingId(complaintId);

    try {
      await receiveComplaint(complaintId);
      await loadComplaints();
    } catch (error) {
      console.error("Receive complaint error:", error);
      alert(error.response?.data?.message || "Unable to receive this complaint.");
    } finally {
      setReceivingId(null);
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
                  These complaints are waiting for admin receipt.
                </p>
              </div>

              <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row sm:items-center">
                <label className="relative w-full sm:w-[360px]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[19px] text-slate-400">
                    search
                  </span>
                  <input
                    className="h-10 w-full rounded-[0.5rem] border border-outline-variant bg-white pl-10 pr-3 text-body-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search customer, phone, complaint ID..."
                  />
                </label>
                <span className="rounded-full bg-orange-50 px-sm py-xxs text-label-md text-orange-700">
                  {filteredComplaints.length} of {complaints.length} pending
                </span>
              </div>
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
            ) : filteredComplaints.length === 0 ? (
              <div className="mt-lg rounded-[0.5rem] border border-dashed border-outline-variant bg-slate-50 p-xl text-center">
                <span className="material-symbols-outlined text-[44px] text-on-surface-variant">
                  inventory_2
                </span>
                <h3 className="mt-sm text-h3 text-on-surface">No submitted complaints</h3>
                <p className="mt-xs text-body-md text-on-surface-variant">
                  {searchTerm.trim()
                    ? "No submitted complaints match your search."
                    : "There are no pending complaints waiting for receipt."}
                </p>
              </div>
            ) : (
              <div className="mt-lg overflow-hidden rounded-[0.5rem] border border-outline-variant">
                <div className="hidden grid-cols-[1fr_1fr_0.8fr_0.8fr] gap-md bg-slate-50 px-md py-sm text-label-md uppercase text-on-surface-variant md:grid">
                  <span>Code / Title</span>
                  <span>Customer</span>
                  <span>Category</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="divide-y divide-outline-variant">
                  {filteredComplaints.map((complaint) => (
                    <div
                      key={complaint.slug}
                      className="grid grid-cols-1 gap-sm px-md py-md md:grid-cols-[1fr_1fr_0.8fr_0.8fr] md:items-center md:gap-md"
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

                      <div className="flex justify-start gap-xs md:justify-end">
                        <button
                          className="inline-flex items-center justify-center rounded-[0.5rem] bg-primary px-sm py-xs text-button text-on-primary transition hover:bg-primary-container disabled:opacity-60"
                          type="button"
                          onClick={() => handleReceive(complaint.apiId)}
                          disabled={receivingId === complaint.apiId}
                        >
                          {receivingId === complaint.apiId ? "Receiving..." : "Receive"}
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
