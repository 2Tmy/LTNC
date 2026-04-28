import { useState } from "react";

const defaultResolution = {
  complaintId: "#10234",
  title: "Login Issue - Password reset not working",
  proposedBy: "Nora Patel",
  action: "Issue a secured reset link and monitor the next login attempt.",
  customerMessage:
    "We identified an issue with your password reset link and have issued a new secured link.",
  risk: "Medium",
};

export default function ApprovalDecisionPanel({ resolution = defaultResolution, onApprove, onReturn }) {
  const [decision, setDecision] = useState("");
  const [managerNotes, setManagerNotes] = useState("");

  const handleDecision = (nextDecision) => {
    setDecision(nextDecision);

    if (nextDecision === "approved") {
      onApprove?.({ resolution, managerNotes });
      return;
    }

    onReturn?.({ resolution, managerNotes });
  };

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-h3 text-primary">{resolution.complaintId}</p>
          <h2 className="mt-xxs text-h2 text-on-surface">Approval decision</h2>
          <p className="mt-xs text-body-sm text-secondary">Proposed by {resolution.proposedBy}</p>
        </div>
        <span className="rounded-full bg-amber-50 px-sm py-xxs text-body-sm font-semibold text-amber-700">
          Pending approval
        </span>
      </div>

      <div className="mt-lg grid grid-cols-1 gap-md lg:grid-cols-2">
        <article className="rounded-[0.5rem] border border-outline-variant p-md">
          <h3 className="text-h3 text-on-surface">Proposed action</h3>
          <p className="mt-sm text-body-md text-on-surface-variant">{resolution.action}</p>
        </article>

        <article className="rounded-[0.5rem] border border-outline-variant p-md">
          <h3 className="text-h3 text-on-surface">Customer message</h3>
          <p className="mt-sm text-body-md text-on-surface-variant">{resolution.customerMessage}</p>
        </article>
      </div>

      <div className="mt-md flex items-center gap-sm rounded-[0.5rem] bg-slate-50 p-md">
        <span className="material-symbols-outlined text-primary">warning</span>
        <div>
          <p className="text-body-sm text-secondary">Risk level</p>
          <p className="text-body-md font-semibold text-on-surface">{resolution.risk}</p>
        </div>
      </div>

      <label className="mt-md block space-y-xs">
        <span className="text-label-md uppercase text-secondary">Manager notes</span>
        <textarea
          className="min-h-24 w-full resize-y rounded-[0.5rem] border border-outline-variant px-md py-sm text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          value={managerNotes}
          onChange={(event) => setManagerNotes(event.target.value)}
          placeholder="Add approval notes or return reason."
        />
      </label>

      {decision ? (
        <div className={`mt-md rounded-[0.5rem] px-md py-sm text-body-sm ${decision === "approved" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          Resolution {decision === "approved" ? "approved" : "returned for revision"}.
        </div>
      ) : null}

      <div className="mt-lg flex flex-wrap justify-end gap-sm">
        <button className="rounded-[0.5rem] border border-amber-200 px-md py-sm text-button text-amber-700 hover:bg-amber-50" type="button" onClick={() => handleDecision("returned")}>
          Return for revision
        </button>
        <button className="rounded-[0.5rem] bg-primary px-md py-sm text-button text-on-primary hover:bg-primary-container" type="button" onClick={() => handleDecision("approved")}>
          Approve resolution
        </button>
      </div>
    </section>
  );
}
