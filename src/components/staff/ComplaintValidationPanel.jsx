import { useState } from "react";

const defaultComplaint = {
  id: "#10234",
  customer: "Jane Doe",
  title: "Login Issue - Password reset not working",
  category: "IT Support",
  submittedAt: "Oct 24, 2023",
  description:
    "Customer cannot complete password reset because the email link expires immediately after opening.",
  evidence: ["reset-error.png", "support-chat.txt"],
};

export default function ComplaintValidationPanel({ complaint = defaultComplaint, onValidate, onReject }) {
  const [decision, setDecision] = useState("");
  const [notes, setNotes] = useState("");

  const handleDecision = (nextDecision) => {
    setDecision(nextDecision);

    if (nextDecision === "valid") {
      onValidate?.({ complaint, notes });
      return;
    }

    onReject?.({ complaint, notes });
  };

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-h3 text-primary">{complaint.id}</p>
          <h2 className="mt-xxs text-h2 text-on-surface">{complaint.title}</h2>
          <p className="mt-xs text-body-sm text-secondary">
            {complaint.customer} - {complaint.category} - {complaint.submittedAt}
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-sm py-xxs text-body-sm font-semibold text-amber-700">
          Awaiting validation
        </span>
      </div>

      <p className="mt-md rounded-[0.5rem] bg-slate-50 p-md text-body-md text-on-surface-variant">
        {complaint.description}
      </p>

      <div className="mt-md">
        <h3 className="text-h3 text-on-surface">Evidence</h3>
        <div className="mt-sm flex flex-wrap gap-sm">
          {complaint.evidence.map((file) => (
            <span key={file} className="inline-flex items-center gap-xs rounded-[0.5rem] border border-outline-variant px-sm py-xs text-body-sm text-secondary">
              <span className="material-symbols-outlined text-[18px] text-primary">attach_file</span>
              {file}
            </span>
          ))}
        </div>
      </div>

      <label className="mt-md block space-y-xs">
        <span className="text-label-md uppercase text-secondary">Validation notes</span>
        <textarea
          className="min-h-24 w-full resize-y rounded-[0.5rem] border border-outline-variant px-md py-sm text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Record what was checked before sending this complaint forward."
        />
      </label>

      {decision ? (
        <div className={`mt-md rounded-[0.5rem] px-md py-sm text-body-sm ${decision === "valid" ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"}`}>
          Complaint marked as {decision === "valid" ? "valid" : "rejected"}.
        </div>
      ) : null}

      <div className="mt-lg flex flex-wrap justify-end gap-sm">
        <button className="rounded-[0.5rem] border border-rose-200 px-md py-sm text-button text-rose-700 hover:bg-rose-50" type="button" onClick={() => handleDecision("rejected")}>
          Reject
        </button>
        <button className="rounded-[0.5rem] bg-primary px-md py-sm text-button text-on-primary hover:bg-primary-container" type="button" onClick={() => handleDecision("valid")}>
          Validate complaint
        </button>
      </div>
    </section>
  );
}
