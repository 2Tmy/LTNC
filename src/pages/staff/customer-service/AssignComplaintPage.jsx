import { useState } from "react";
import AdminSidebar from "../../../layouts/AdminSidebar.jsx";
import AdminTopBar from "../../../layouts/AdminTopBar.jsx";
import { adminComplaints, adminUser, staffMembers } from "../../../mocks/adminMock.js";

export default function AssignComplaintPage() {
  const [unassignedComplaints, setUnassignedComplaints] = useState(() =>
    adminComplaints.filter((complaint) => complaint.status !== "Resolved")
  );
  const [assignedMessage, setAssignedMessage] = useState("");

  const handleAssign = (complaint) => {
    setUnassignedComplaints((current) => current.filter((item) => item.id !== complaint.id));
    setAssignedMessage(`${complaint.id} was assigned and removed from the queue.`);
  };

  return (
    <div className="flex min-h-screen bg-surface text-on-background">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <AdminTopBar user={adminUser} />

        <div className="mx-auto max-w-[1180px] space-y-lg p-xl">
          <div>
            <h1 className="text-h1 text-on-surface">Staff Management</h1>
            <p className="mt-xs text-body-md text-secondary">Assign complaint workload and monitor staff availability.</p>
          </div>

          <section className="grid grid-cols-1 gap-gutter lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
              <h2 className="text-h2 text-on-surface">Team capacity</h2>
              <div className="mt-md space-y-md">
                {staffMembers.map((member) => (
                  <article key={member.email} className="rounded-[0.5rem] border border-outline-variant p-md">
                    <div className="flex items-start justify-between gap-md">
                      <div>
                        <h3 className="text-h3 text-on-surface">{member.name}</h3>
                        <p className="text-body-sm text-secondary">{member.role}</p>
                        <p className="mt-xs text-body-sm text-secondary">{member.email}</p>
                      </div>
                      <span className={`rounded-full px-sm py-xxs text-body-sm font-semibold ${member.status === "Available" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {member.status}
                      </span>
                    </div>
                    <div className="mt-md">
                      <div className="mb-xs flex justify-between text-body-sm text-secondary">
                        <span>Workload</span>
                        <span>{member.workload} cases</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-primary-container" style={{ width: `${Math.min(100, member.workload * 4)}%` }} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <h2 className="text-h2 text-on-surface">Assign complaints</h2>
                <span className="rounded-full bg-blue-50 px-sm py-xxs text-body-sm font-semibold text-blue-700">
                  {unassignedComplaints.length} unassigned
                </span>
              </div>

              {assignedMessage ? (
                <div className="mt-md rounded-[0.5rem] border border-green-100 bg-green-50 px-md py-sm text-body-sm text-green-700">
                  {assignedMessage}
                </div>
              ) : null}

              <div className="mt-md space-y-md">
                {unassignedComplaints.length ? (
                  unassignedComplaints.map((complaint) => (
                    <article key={complaint.id} className="rounded-[0.5rem] border border-outline-variant p-md">
                      <p className="text-h3 text-primary">{complaint.id}</p>
                      <h3 className="mt-xxs text-body-lg font-semibold text-on-surface">{complaint.title}</h3>
                      <div className="mt-md grid grid-cols-1 gap-sm sm:grid-cols-[1fr_auto]">
                        <select className="rounded-[0.5rem] border border-outline-variant px-md py-sm text-body-md text-on-surface">
                          {staffMembers.map((member) => (
                            <option key={member.email}>{member.name}</option>
                          ))}
                        </select>
                        <button
                          className="rounded-[0.5rem] bg-primary px-md py-sm text-button text-on-primary"
                          type="button"
                          onClick={() => handleAssign(complaint)}
                        >
                          Assign
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[0.5rem] border border-dashed border-outline-variant p-lg text-center">
                    <span className="material-symbols-outlined text-[36px] text-outline">task_alt</span>
                    <p className="mt-xs text-h3 text-on-surface">No complaints waiting for assignment</p>
                    <p className="mt-xxs text-body-sm text-secondary">Assigned complaints are removed from this queue.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
