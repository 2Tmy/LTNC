import { useEffect, useState } from "react";
import WorkflowComplaintsList from "../../../components/admin/WorkflowComplaintsList.jsx";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAllComplaints } from "../../../services/complaintService.js";

export default function ProcessComplaintsPage() {
  const user = useCurrentUser();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllComplaints();
        setComplaints(data.filter((c) => c.rawStatus === "RESOLVING"));
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
            accent="indigo"
            complaints={complaints}
            countLabel={`${complaints.length} resolving`}
            description="Open each complaint to record the root cause and customer response."
            emptyIcon="build_circle"
            emptyText="No complaints currently being resolved."
            error={error}
            loading={loading}
            stepLabel="Step 3"
            title="Process complaints"
            variant="process"
          />
        </div>
      </main>
    </div>
  );
}
