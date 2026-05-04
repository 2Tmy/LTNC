import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAdminUsers } from "../../../services/authService.js";

const formatDate = (value) => {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ManagerDashboardPage() {
  const user = useCurrentUser();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getAdminUsers();
        setAccounts(response.data.data);
      } catch (error) {
        console.error("Load users error:", error);
        setLoadError(error.response?.data?.message || "Unable to load registered users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">User Management</h1>
            <p className="mt-xs text-body-md text-secondary">Manage customer and staff accounts in the resolution system.</p>
          </div>

          <section className="overflow-hidden rounded-[0.75rem] border border-outline-variant bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-md border-b border-outline-variant p-lg">
              <div>
                <h2 className="text-h2 text-on-surface">Accounts</h2>
                <p className="mt-xxs text-body-sm text-secondary">
                  Registered users from the backend database.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-body-sm font-semibold text-secondary">
                  <tr>
                    <th className="px-lg py-md">Name</th>
                    <th className="px-lg py-md">Email</th>
                    <th className="px-lg py-md">Role</th>
                    <th className="px-lg py-md">Created</th>
                    <th className="px-lg py-md">Status</th>
                    <th className="px-lg py-md text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td className="px-lg py-lg text-body-md text-secondary" colSpan={6}>
                        Loading registered users...
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td className="px-lg py-lg text-body-md text-error" colSpan={6}>
                        {loadError}
                      </td>
                    </tr>
                  ) : accounts.length ? (
                    accounts.map((account) => (
                      <tr key={account.email} className="hover:bg-slate-50">
                        <td className="px-lg py-md text-body-lg font-medium text-on-surface">{account.name}</td>
                        <td className="px-lg py-md text-body-md text-secondary">{account.email}</td>
                        <td className="px-lg py-md text-body-md text-secondary">{account.role}</td>
                        <td className="px-lg py-md text-body-md text-secondary">{formatDate(account.createdAt)}</td>
                        <td className="px-lg py-md">
                          <span className={`rounded-full px-sm py-xxs text-body-sm font-semibold ${
                            account.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-secondary"
                          }`}>
                            {account.enabled ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-lg py-md text-right">
                          <span className="text-body-sm text-secondary">Read-only</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-lg py-lg text-body-md text-secondary" colSpan={6}>
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
