import { useEffect, useState } from "react";
import WorkflowComplaintsList from "../../../components/admin/WorkflowComplaintsList.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";

export default function ResponseComplaintsPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAllComplaints();
        setComplaints(data.filter((c) => c.rawStatus === "RESOLVED" && !c.isRejected));
      } catch (e) {
        setError(e.response?.data?.message || "Unable to load complaints.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar user={user} />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
          <WorkflowComplaintsList
            accent="emerald"
            actionLabel="View"
            complaints={complaints}
            countLabel={`${complaints.length} resolved`}
            description="Review complaints that have been completed with a customer-facing resolution."
            emptyIcon="mark_email_read"
            emptyText="No resolved complaints with customer responses."
            error={error}
            loading={loading}
            searchPlaceholder="Search complaint ID, title, customer, email, phone, category, or resolution..."
            stepLabel="Step 4"
            title="Response complaints"
            variant="resolved"
          />
        </div>
      </main>
    </div>
  );
}
