import { useState } from "react";

const defaultFindings = [
  "Password reset token expired before the customer could complete the flow.",
  "Customer made three reset attempts within a ten minute window.",
  "No suspicious account activity was detected.",
];

export default function InvestigationResultPanel({
  complaintId = "#10234",
  investigator = "Nora Patel",
  findings = defaultFindings,
  recommendation = "Send a new reset link and extend token validity for this account.",
  onSubmit,
}) {
  const [result, setResult] = useState(recommendation);
  const [impact, setImpact] = useState("Medium");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit?.({ complaintId, investigator, findings, recommendation: result, impact });
  };

  return (
    <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-h3 text-primary">{complaintId}</p>
          <h2 className="mt-xxs text-h2 text-on-surface">Investigation result</h2>
          <p className="mt-xs text-body-sm text-secondary">Prepared by {investigator}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-sm py-xxs text-body-sm font-semibold text-indigo-700">
          In review
        </span>
      </div>

      <div className="mt-lg">
        <h3 className="text-h3 text-on-surface">Findings</h3>
        <ul className="mt-sm space-y-sm">
          {findings.map((finding) => (
            <li key={finding} className="flex gap-xs text-body-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
              {finding}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-md grid grid-cols-1 gap-md sm:grid-cols-[1fr_180px]">
        <label className="space-y-xs">
          <span className="text-label-md uppercase text-secondary">Recommended resolution</span>
          <textarea
            className="min-h-28 w-full resize-y rounded-[0.5rem] border border-outline-variant px-md py-sm text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={result}
            onChange={(event) => setResult(event.target.value)}
          />
        </label>

        <label className="space-y-xs">
          <span className="text-label-md uppercase text-secondary">Impact</span>
          <select
            className="w-full rounded-[0.5rem] border border-outline-variant px-md py-sm text-body-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={impact}
            onChange={(event) => setImpact(event.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </label>
      </div>

      {submitted ? (
        <div className="mt-md rounded-[0.5rem] bg-green-50 px-md py-sm text-body-sm text-green-700">
          Investigation result submitted for manager approval.
        </div>
      ) : null}

      <div className="mt-lg flex justify-end">
        <button className="rounded-[0.5rem] bg-primary px-md py-sm text-button text-on-primary hover:bg-primary-container" type="button" onClick={handleSubmit}>
          Submit result
        </button>
      </div>
    </section>
  );
}
