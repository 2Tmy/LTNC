import { useEffect, useState } from "react";
import WorkflowComplaintsList from "../../../components/admin/WorkflowComplaintsList.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";

export default function ValidateComplaintsPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllComplaints();
        setComplaints(data.filter((c) => c.rawStatus === "VALIDATING"));
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
            accent="blue"
            complaints={complaints}
            countLabel={`${complaints.length} validating`}
            description="Open each complaint to review details and complete the validation checklist."
            emptyIcon="fact_check"
            emptyText="No complaints awaiting validation."
            error={error}
            loading={loading}
            stepLabel="Step 2"
            title="Validate complaints"
          />
        </div>
      </main>
    </div>
  );
}
