import { useEffect, useState } from "react";
import AccountInfoCard from "../../components/profile/AccountInfoCard.jsx";
import ProfileForm from "../../components/profile/ProfileForm.jsx";
import { useCurrentUser } from "../../hooks/useCurrentUser.js";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { getMyComplaints } from "../../services/complaintService.js";

export default function ProfilePage() {
  const baseUser = useCurrentUser();
  const [openComplaints, setOpenComplaints] = useState("...");

  useEffect(() => {
    getMyComplaints()
      .then((complaints) => {
        setOpenComplaints(complaints.filter((complaint) => complaint.isActive).length);
      })
      .catch(() => setOpenComplaints("N/A"));
  }, []);

  // Merge real user data with any locally saved profile extras (phone, address)
  let savedExtras = {};
  try {
    const raw = window.localStorage.getItem("demoProfile");
    savedExtras = raw ? JSON.parse(raw) : {};
  } catch {
    savedExtras = {};
  }

  const user = {
    ...baseUser,
    phone: savedExtras.phone || "",
    address: savedExtras.address || "",
    preferredContact: savedExtras.preferredContact || "Email",
    openComplaints,
  };

  const handleSave = (profile) => {
    window.localStorage.setItem("demoProfile", JSON.stringify(profile));
    window.localStorage.setItem("demoName", profile.name);
    window.localStorage.setItem("demoEmail", profile.email);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar user={user} />

      <main className="min-w-0 flex-1 bg-surface">
        <TopBar user={user} />

        <div className="mx-auto w-full max-w-6xl space-y-lg p-lg">
          <div>
            <h1 className="text-h1 text-on-surface">Profile</h1>
            <p className="mt-xs text-body-md text-on-surface-variant">
              Manage your account details and contact preferences.
            </p>
          </div>

          <section className="grid grid-cols-1 gap-lg lg:grid-cols-[0.85fr_1.45fr]">
            <AccountInfoCard user={user} />
            <ProfileForm user={user} onSave={handleSave} />
          </section>
        </div>
      </main>
    </div>
  );
}
