import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { adminUser } from "../../../mocks/adminMock.js";

const settings = [
  { label: "Auto-assign new complaints", description: "Route new validated complaints to available staff.", enabled: true },
  { label: "Email notifications", description: "Send email alerts when complaints change status.", enabled: true },
  { label: "Manager approval required", description: "Require manager approval before closing escalated cases.", enabled: true },
  { label: "Customer feedback survey", description: "Ask customers for feedback after resolution.", enabled: false },
];

export default function PendingApprovalsPage() {
  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={adminUser} />

        <div className="mx-auto max-w-[900px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">Settings</h1>
            <p className="mt-xs text-body-md text-secondary">Configure complaint workflow behavior for the demo admin portal.</p>
          </div>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="text-h2 text-on-surface">Workflow preferences</h2>
            <div className="mt-lg divide-y divide-slate-100">
              {settings.map((setting) => (
                <label key={setting.label} className="flex cursor-pointer items-center justify-between gap-lg py-md">
                  <div>
                    <p className="text-body-lg font-semibold text-on-surface">{setting.label}</p>
                    <p className="mt-xxs text-body-sm text-secondary">{setting.description}</p>
                  </div>
                  <input className="h-5 w-5" type="checkbox" defaultChecked={setting.enabled} />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
            <h2 className="text-h2 text-on-surface">SLA targets</h2>
            <div className="mt-md grid grid-cols-1 gap-md sm:grid-cols-3">
              {["Validation", "Investigation", "Resolution"].map((label, index) => (
                <label key={label} className="space-y-xs">
                  <span className="text-label-md uppercase text-secondary">{label}</span>
                  <input
                    className="w-full rounded-[0.5rem] border border-outline-variant px-md py-sm text-body-md"
                    defaultValue={[4, 24, 72][index]}
                    type="number"
                  />
                  <span className="text-body-sm text-secondary">hours</span>
                </label>
              ))}
            </div>
            <div className="mt-lg flex justify-end">
              <button className="rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary" type="button">
                Save settings
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
