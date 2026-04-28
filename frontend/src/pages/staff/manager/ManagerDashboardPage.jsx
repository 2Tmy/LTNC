import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { adminUser, users } from "../../../mocks/adminMock.js";

export default function ManagerDashboardPage() {
  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={adminUser} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">User Management</h1>
            <p className="mt-xs text-body-md text-secondary">Manage customer and staff accounts in the resolution system.</p>
          </div>

          <section className="overflow-hidden rounded-[0.75rem] border border-outline-variant bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-md border-b border-outline-variant p-lg">
              <h2 className="text-h2 text-on-surface">Accounts</h2>
              <button className="inline-flex items-center gap-xs rounded-[0.5rem] bg-primary px-md py-sm text-button text-on-primary" type="button">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                Add user
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-body-sm font-semibold text-secondary">
                  <tr>
                    <th className="px-lg py-md">Name</th>
                    <th className="px-lg py-md">Email</th>
                    <th className="px-lg py-md">Role</th>
                    <th className="px-lg py-md">Complaints</th>
                    <th className="px-lg py-md">Status</th>
                    <th className="px-lg py-md text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.email} className="hover:bg-slate-50">
                      <td className="px-lg py-md text-body-lg font-medium text-on-surface">{user.name}</td>
                      <td className="px-lg py-md text-body-md text-secondary">{user.email}</td>
                      <td className="px-lg py-md text-body-md text-secondary">{user.role}</td>
                      <td className="px-lg py-md text-body-md text-secondary">{user.complaints}</td>
                      <td className="px-lg py-md">
                        <span className="rounded-full bg-green-50 px-sm py-xxs text-body-sm font-semibold text-green-700">{user.status}</span>
                      </td>
                      <td className="px-lg py-md text-right">
                        <button className="text-primary hover:underline" type="button">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
