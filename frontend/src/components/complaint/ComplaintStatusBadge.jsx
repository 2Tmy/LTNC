const statusClasses = {
  Pending: "bg-orange-50 text-orange-700",
  Investigating: "bg-indigo-50 text-indigo-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Resolved: "bg-green-50 text-green-700",
  Rejected: "bg-rose-50 text-rose-700",
};

export default function ComplaintStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-sm py-xxs text-body-sm font-semibold ${
        statusClasses[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
