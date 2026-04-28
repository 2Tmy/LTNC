import { Link } from "react-router-dom";
import { createComplaintSlug } from "../../mocks/complaintsMock.js";

const statusClasses = {
  Investigating: "bg-indigo-50 text-indigo-700",
  Pending: "bg-orange-50 text-orange-700",
  Resolved: "bg-green-50 text-green-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
};

export default function ComplaintTable({ complaints }) {
  return (
    <section className="overflow-hidden rounded-[0.75rem] border border-slate-100 bg-white shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-lg py-md">
        <h2 className="text-h2 text-on-surface">My Complaints</h2>
        <div className="flex gap-2">
          <button className="rounded-[0.5rem] p-2 text-slate-500 hover:bg-slate-50" type="button" aria-label="Filter complaints">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="rounded-[0.5rem] p-2 text-slate-500 hover:bg-slate-50" type="button" aria-label="Download complaints">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-label-md uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-lg py-md">Complaint ID</th>
              <th className="px-lg py-md">Title</th>
              <th className="px-lg py-md">Status</th>
              <th className="px-lg py-md">Last Updated</th>
              <th className="px-lg py-md text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="transition-colors hover:bg-slate-50">
                <td className="whitespace-nowrap px-lg py-md font-medium text-primary-container">{complaint.id}</td>
                <td className="min-w-[320px] px-lg py-md text-on-surface">{complaint.title}</td>
                <td className="whitespace-nowrap px-lg py-md">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      statusClasses[complaint.status]
                    }`}
                  >
                    {complaint.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-lg py-md text-body-sm text-slate-500">{complaint.lastUpdated}</td>
                <td className="whitespace-nowrap px-lg py-md text-right">
                  <Link
                    className="text-button text-primary-container hover:underline"
                    to={`/customer/complaints/${createComplaintSlug(complaint.id)}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-lg py-md">
        <p className="text-body-sm text-slate-500">Showing {complaints.length} of {complaints.length} complaints</p>
        <div className="flex gap-2">
          <button className="cursor-not-allowed rounded border border-slate-200 px-3 py-1 text-slate-400" type="button">
            Previous
          </button>
          <button className="rounded border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50" type="button">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
