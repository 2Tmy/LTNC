import AccountInfoCard from "../../components/profile/AccountInfoCard.jsx";
import ProfileForm from "../../components/profile/ProfileForm.jsx";
import Sidebar from "../../layouts/Sidebar.jsx";
import TopBar from "../../layouts/TopBar.jsx";
import { getAllComplaints } from "../../mocks/complaintsMock.js";

const avatarUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCILdE8Jy3Lovzgf3qbggg6eMbkGXFMM0_IlYPeo47SssEUV8gxncDTDjX9AtQFqHLTwCmIZQ0hK6va9wvaiQM9lXBXTf63pZbGLzVDLMrt-4rO-cy-N-Nd9E80RfKk0uB0rkRsKHr52jdXzUnjEFj0CCykfJxZqtiin5iSCKPj6DfclgYRJGcvXQUwH4EmHkQ-e1ltK7_wJwrJ4LF4vMAOW4vxt6x7ZhunDPDJ1pdciokKBkOX2emCM48Z0eOTTzKFf9ra6mRlRBc7";

const getProfile = () => {
  let parsedProfile = {};

  try {
    const savedProfile = window.localStorage.getItem("demoProfile");
    parsedProfile = savedProfile ? JSON.parse(savedProfile) : {};
  } catch {
    parsedProfile = {};
  }

  const name = parsedProfile.name || window.localStorage.getItem("demoName") || "Demo Customer";
  const email = parsedProfile.email || window.localStorage.getItem("demoEmail") || "my@gmail.com";
  const complaints = getAllComplaints();

  return {
    name,
    firstName: name.split(" ")[0],
    email,
    phone: parsedProfile.phone || "(555) 012-4567",
    address: parsedProfile.address || "123 Service Avenue, Customer City",
    preferredContact: parsedProfile.preferredContact || "Email",
    memberSince: "Oct 2023",
    openComplaints: complaints.filter((complaint) => complaint.status !== "Resolved").length,
    avatarUrl,
  };
};

export default function ProfilePage() {
  const user = getProfile();

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
