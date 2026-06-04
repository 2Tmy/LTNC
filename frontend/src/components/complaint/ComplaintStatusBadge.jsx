const statusClasses = {
  Pending: "bg-orange-50 text-orange-700",
  Validating: "bg-blue-50 text-blue-700",
  Resolving: "bg-cyan-50 text-cyan-700",
  Resolved: "bg-green-50 text-green-700",
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
