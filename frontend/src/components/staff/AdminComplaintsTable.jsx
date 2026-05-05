import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const statusClasses = {
  Pending: "bg-amber-50 text-amber-700",
  Validating: "bg-blue-50 text-blue-700",
  "Needs Info": "bg-yellow-50 text-yellow-700",
  Investigating: "bg-indigo-50 text-indigo-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  "Under Review": "bg-slate-100 text-secondary",
  Escalated: "bg-rose-50 text-rose-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export default function AdminComplaintsTable({ complaints }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComplaints = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return complaints;

    return complaints.filter((complaint) => {
      return (
        complaint.complaintCode?.toLowerCase().includes(keyword) ||
        complaint.id?.toLowerCase().includes(keyword) ||
        complaint.slug?.toLowerCase().includes(keyword) ||
        complaint.title?.toLowerCase().includes(keyword) ||
        complaint.customer?.toLowerCase().includes(keyword) ||
        complaint.email?.toLowerCase().includes(keyword)
      );
    });
  }, [complaints, searchTerm]);

  return (
    <section className="overflow-hidden rounded-[0.75rem] border border-outline-variant bg-white shadow-sm">
      <div className="flex flex-col gap-md border-b border-slate-100 px-lg py-lg md:flex-row md:items-center md:justify-between">
        <h2 className="text-h2 text-on-surface">Recent Complaints</h2>
        <label className="relative w-full md:w-[300px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
            search
          </span>
          <input
            className="h-11 w-full rounded-[0.5rem] border border-slate-200 bg-white pl-10 pr-3 text-body-md text-secondary outline-none transition focus:border-primary-container focus:ring-2 focus:ring-blue-100"
            placeholder="Search by code, ID or name"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-body-sm font-semibold text-secondary">
            <tr>
              <th className="px-lg py-md">Complaint ID</th>
              <th className="px-lg py-md">Customer</th>
              <th className="px-lg py-md">Title</th>
              <th className="px-lg py-md">Status</th>
              <th className="px-lg py-md">Department</th>
              <th className="px-lg py-md">Date</th>
              <th className="px-lg py-md text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredComplaints.length === 0 ? (
              <tr>
                <td className="px-lg py-lg text-center text-body-md text-secondary" colSpan={7}>
                  No complaints found.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((complaint) => (
                <tr key={complaint.slug || complaint.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap px-lg py-md text-h3 text-primary">
                    {complaint.id}
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-body-sm font-bold ${complaint.avatarClassName}`}
                      >
                        {complaint.initials}
                      </span>
                      <span className="min-w-[110px] text-body-lg font-medium text-on-surface">
                        {complaint.customer}
                      </span>
                    </div>
                  </td>
                  <td className="min-w-[230px] px-lg py-md text-body-lg text-secondary">
                    {complaint.title}
                  </td>
                  <td className="whitespace-nowrap px-lg py-md">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-body-sm font-semibold ${
                        statusClasses[complaint.status] || "bg-slate-100 text-secondary"
                      }`}
                    >
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                      {complaint.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-lg py-md text-body-lg text-secondary">
                    {complaint.department}
                  </td>
                  <td className="whitespace-nowrap px-lg py-md text-body-lg text-secondary">
                    {complaint.date}
                  </td>
                  <td className="whitespace-nowrap px-lg py-md text-right">
                    <div className="flex justify-end gap-md text-slate-400">
                      <Link
                        className="hover:text-primary"
                        to={`/admin/complaints/${complaint.slug}`}
                        aria-label={`View ${complaint.id}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">visibility</span>
                      </Link>
                      <button className="hover:text-primary" type="button" aria-label={`Edit ${complaint.id}`}>
                        <span className="material-symbols-outlined text-[22px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-lg py-md">
        <p className="text-body-sm text-secondary">
          Showing {filteredComplaints.length} of {complaints.length} backend complaints
        </p>
        <div className="flex gap-2">
          <button className="rounded-[0.5rem] border border-slate-200 px-4 py-2 text-body-sm text-slate-400" type="button">
            Previous
          </button>
          <button className="rounded-[0.5rem] border border-slate-200 px-4 py-2 text-body-sm text-on-surface hover:bg-slate-50" type="button">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}