import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../routes/routePaths.js";

const PAGE_SIZE = 10;

const priorityStyles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-red-50 text-red-700",
};

const accentStyles = {
  amber: {
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    button: "bg-amber-600 text-white hover:bg-amber-700",
    focus: "focus:border-amber-400 focus:ring-amber-100",
  },
  blue: {
    text: "text-blue-600",
    badge: "bg-blue-50 text-blue-700",
    button: "bg-blue-600 text-white hover:bg-blue-700",
    focus: "focus:border-blue-400 focus:ring-blue-100",
  },
  indigo: {
    text: "text-indigo-600",
    badge: "bg-indigo-50 text-indigo-700",
    button: "bg-indigo-600 text-white hover:bg-indigo-700",
    focus: "focus:border-indigo-400 focus:ring-indigo-100",
  },
  emerald: {
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
    focus: "focus:border-emerald-400 focus:ring-emerald-100",
  },
};

const matchesComplaintSearch = (complaint, keyword) => {
  const searchFields = [
    complaint.id || "",
    complaint.complaintCode || "",
    complaint.title || "",
    complaint.customer || "",
    complaint.email || "",
    complaint.phone || "",
    complaint.orderId || "",
    complaint.category || "",
    complaint.priority || "",
    complaint.status || "",
    complaint.rootCause || "",
    complaint.resolution || "",
    complaint.description || "",
    complaint.department || "",
  ].map((field) => String(field).toLowerCase());

  return searchFields.some((field) => field.includes(keyword));
};

export default function WorkflowComplaintsList({
  accent = "blue",
  actionLabel = "View",
  countLabel,
  complaints,
  description,
  emptyIcon = "inventory_2",
  emptyText,
  error,
  loading,
  onAction,
  pendingActionId,
  searchPlaceholder = "Search complaint ID, title, customer, email, phone, order, category...",
  stepLabel,
  title,
  variant = "submitted",
}) {
  const styles = accentStyles[accent] || accentStyles.blue;
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filteredComplaints = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return complaints;
    return complaints.filter((complaint) => matchesComplaintSearch(complaint, keyword));
  }, [complaints, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleComplaints = filteredComplaints.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [complaints, searchTerm]);

  const renderDetail = (complaint) => {
    if (variant === "process") {
      return (
        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
            priorityStyles[complaint.priority] || "bg-slate-100 text-slate-600"
          }`}
        >
          {complaint.priority || "Not set"}
        </span>
      );
    }

    if (variant === "resolved") {
      return (
        <div>
          <p className="text-xs text-slate-400">{complaint.resolvedAt}</p>
          {complaint.feedback ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              {complaint.feedback.rating}/5 feedback
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">Awaiting feedback</p>
          )}
        </div>
      );
    }

    return <p className="text-xs text-slate-400">{complaint.submittedAt}</p>;
  };

  const renderAction = (complaint) => {
    if (onAction) {
      const isPending = pendingActionId === complaint.apiId;
      return (
        <button
          type="button"
          onClick={() => onAction(complaint.apiId)}
          disabled={isPending}
          className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${styles.button}`}
        >
          <span className="material-symbols-outlined text-[15px]">
            {isPending ? "progress_activity" : "move_to_inbox"}
          </span>
          {isPending ? "Receiving..." : actionLabel}
        </button>
      );
    }

    const href =
      variant === "process"
        ? `${ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", complaint.slug)}?from=process`
        : ROUTE_PATHS.adminComplaintDetail.replace(":complaintId", complaint.slug);

    return (
      <Link
        to={href}
        className={`inline-flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${styles.button}`}
      >
        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
        {actionLabel}
      </Link>
    );
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest ${styles.text}`}>{stepLabel}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles.badge}`}>
          {countLabel || `${complaints.length} complaints`}
        </span>
      </div>

      <div className="border-b border-slate-100 px-5 py-4">
        <label className="relative block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[21px] text-slate-400">
            search
          </span>
          <input
            className={`h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:ring-2 ${styles.focus}`}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm text-slate-500">
          <span className="material-symbols-outlined mr-2 animate-spin text-[24px] text-blue-500">
            progress_activity
          </span>
          Loading complaints...
        </div>
      ) : error ? (
        <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center">
          <span className="material-symbols-outlined text-[44px] text-slate-300">{emptyIcon}</span>
          <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center">
          <span className="material-symbols-outlined text-[44px] text-slate-300">search_off</span>
          <p className="mt-2 text-sm text-slate-500">No matching complaints.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code / Title</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">
                    {variant === "process" ? "Priority" : variant === "resolved" ? "Resolved" : "Submitted"}
                  </th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleComplaints.map((complaint) => (
                  <tr key={complaint.apiId || complaint.slug} className="transition hover:bg-slate-50">
                    <td className="min-w-[240px] px-5 py-4">
                      <p className="text-xs text-slate-400">{complaint.id}</p>
                      <p className="mt-0.5 font-medium text-slate-800">{complaint.title}</p>
                    </td>
                    <td className="min-w-[190px] px-5 py-4">
                      <p className="text-slate-700">{complaint.customer}</p>
                      <p className="text-xs text-slate-400">{complaint.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{complaint.category}</td>
                    <td className="whitespace-nowrap px-5 py-4">{renderDetail(complaint)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">{renderAction(complaint)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComplaints.length > PAGE_SIZE ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
              <p className="text-sm text-slate-500">
                Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredComplaints.length)} of{" "}
                {filteredComplaints.length}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Previous
                </button>
                <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
