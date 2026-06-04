import { useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser.js";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { getAdminUsers } from "../../../services/authService.js";

const formatDate = (value) => {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const roleStyles = {
  ADMIN: "bg-blue-50 text-blue-700",
  CUSTOMER: "bg-slate-100 text-slate-700",
};

const PAGE_SIZE = 10;

function UserTable({ title, description, users, loading, loadError, page, onPageChange, onSelect }) {
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <section className="overflow-hidden rounded-[0.75rem] border border-outline-variant bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-md border-b border-outline-variant p-lg">
        <div>
          <h2 className="text-h2 text-on-surface">{title}</h2>
          <p className="mt-xxs text-body-sm text-secondary">{description}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-sm py-xxs text-body-sm font-semibold text-secondary">
          {users.length} accounts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-body-sm font-semibold text-secondary">
            <tr>
              <th className="px-lg py-md">Name</th>
              <th className="px-lg py-md">Email</th>
              <th className="px-lg py-md">Phone</th>
              <th className="px-lg py-md">Role</th>
              <th className="px-lg py-md">Created</th>
              <th className="px-lg py-md">Status</th>
              <th className="px-lg py-md text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td className="px-lg py-lg text-body-md text-secondary" colSpan={7}>
                  Loading registered users...
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td className="px-lg py-lg text-body-md text-error" colSpan={7}>
                  {loadError}
                </td>
              </tr>
            ) : visibleUsers.length ? (
              visibleUsers.map((account) => (
                <tr key={account.email} className="hover:bg-slate-50">
                  <td className="px-lg py-md text-body-lg font-medium text-on-surface">
                    {account.name}
                  </td>
                  <td className="px-lg py-md text-body-md text-secondary">{account.email}</td>
                  <td className="px-lg py-md text-body-md text-secondary">
                    {account.phone || "Not provided"}
                  </td>
                  <td className="px-lg py-md">
                    <span
                      className={`rounded-full px-sm py-xxs text-body-sm font-semibold ${
                        roleStyles[account.role] || "bg-slate-100 text-secondary"
                      }`}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-md text-secondary">
                    {formatDate(account.createdAt)}
                  </td>
                  <td className="px-lg py-md">
                    <span
                      className={`rounded-full px-sm py-xxs text-body-sm font-semibold ${
                        account.enabled ? "bg-green-50 text-green-700" : "bg-slate-100 text-secondary"
                      }`}
                    >
                      {account.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(account)}
                      className="inline-flex items-center gap-xs rounded-[0.5rem] border border-outline-variant px-sm py-xs text-button text-primary transition hover:bg-blue-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-lg py-lg text-body-md text-secondary" colSpan={7}>
                  No users found in this group.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {users.length > PAGE_SIZE && !loading && !loadError ? (
        <div className="flex flex-wrap items-center justify-between gap-md border-t border-outline-variant px-lg py-md">
          <p className="text-body-sm text-secondary">
            Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, users.length)} of {users.length}
          </p>
          <div className="flex gap-sm">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-[0.5rem] border border-outline-variant px-md py-xs text-button text-secondary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Previous
            </button>
            <span className="rounded-[0.5rem] bg-slate-100 px-md py-xs text-button text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-[0.5rem] border border-outline-variant px-md py-xs text-button text-secondary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function UserDetailPanel({ user, onClose }) {
  if (!user) return null;

  const detailRows = [
    ["User ID", user.id || user.userId || "Not available"],
    ["Name", user.name || "Not available"],
    ["Email", user.email || "Not available"],
    ["Phone", user.phone || "Not provided"],
    ["Role", user.role || "Not available"],
    ["Status", user.enabled ? "Active" : "Disabled"],
    ["Created at", formatDate(user.createdAt)],
    ["Updated at", formatDate(user.updatedAt)],
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-lg">
      <section className="w-full max-w-xl rounded-[0.75rem] border border-outline-variant bg-white shadow-lg">
        <div className="flex items-start justify-between gap-md border-b border-outline-variant p-lg">
          <div>
            <p className="text-label-md uppercase text-primary">User detail</p>
            <h2 className="mt-xs text-h2 text-on-surface">{user.name}</h2>
            <p className="mt-xxs text-body-md text-secondary">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[0.5rem] p-xs text-secondary transition hover:bg-slate-100 hover:text-on-surface"
            aria-label="Close user detail"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-md p-lg sm:grid-cols-2">
          {detailRows.map(([label, value]) => (
            <div key={label} className="rounded-[0.5rem] border border-slate-100 bg-slate-50 p-md">
              <p className="text-label-md uppercase text-secondary">{label}</p>
              <p className="mt-xxs break-words text-body-md font-medium text-on-surface">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AdminUsersPage() {
  const user = useCurrentUser();
  const [accounts, setAccounts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await getAdminUsers();
        setAccounts(response.data.data);
        setAdminPage(1);
        setCustomerPage(1);
      } catch (error) {
        console.error("Load users error:", error);
        setLoadError(error.response?.data?.message || "Unable to load registered users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredAccounts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return accounts;

    return accounts.filter((account) =>
      [
        account.id,
        account.userId,
        account.name,
        account.email,
        account.phone,
        account.role,
        account.enabled ? "active" : "disabled",
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [accounts, searchTerm]);

  const groupedUsers = useMemo(
    () => ({
      admins: filteredAccounts.filter((account) => account.role === "ADMIN"),
      customers: filteredAccounts.filter((account) => account.role === "CUSTOMER"),
    }),
    [filteredAccounts]
  );

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={user} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">User Management</h1>
            <p className="mt-xs text-body-md text-secondary">
              Manage customer and admin accounts in the resolution system.
            </p>
          </div>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <label className="relative block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-slate-400">
                search
              </span>
              <input
                className="h-12 w-full rounded-[0.5rem] border border-slate-200 bg-white pl-11 pr-4 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setAdminPage(1);
                  setCustomerPage(1);
                }}
                placeholder="Search user name, email, phone, role, or status..."
              />
            </label>
            <p className="mt-sm text-body-sm text-secondary">
              Showing {filteredAccounts.length} of {accounts.length} accounts
            </p>
          </section>

          <UserTable
            title="Admin Accounts"
            description="Internal users who can receive, validate, process, and respond to complaints."
            users={groupedUsers.admins}
            loading={loading}
            loadError={loadError}
            page={adminPage}
            onPageChange={setAdminPage}
            onSelect={setSelectedUser}
          />

          <UserTable
            title="Customer Accounts"
            description="External users who submit and track complaints."
            users={groupedUsers.customers}
            loading={loading}
            loadError={loadError}
            page={customerPage}
            onPageChange={setCustomerPage}
            onSelect={setSelectedUser}
          />
        </div>
      </main>

      <UserDetailPanel user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
