import { useEffect, useState } from "react";
import WorkflowComplaintsList from "../../../components/admin/WorkflowComplaintsList.jsx";
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
          <WorkflowComplaintsList
            accent="amber"
            actionLabel="Receive"
            complaints={complaints}
            countLabel={`${complaints.length} pending`}
            description="Review newly submitted complaints and confirm receipt for handling."
            emptyIcon="inventory_2"
            emptyText="There are no pending complaints waiting for receipt."
            error={loadError}
            loading={loading}
            onAction={handleReceive}
            pendingActionId={receivingId}
            stepLabel="Step 1"
            title="Receive complaints"
          />
        </div>
      </main>
    </div>
  );
}
