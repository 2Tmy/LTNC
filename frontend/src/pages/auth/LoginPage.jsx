import LoginForm from "../../components/auth/LoginForm.jsx";

const features = [
  {
    icon: "inventory_2",
    title: "Goods complaints",
    desc: "Report lost, damaged, or incorrect deliveries instantly.",
  },
  {
    icon: "local_shipping",
    title: "Delivery issues",
    desc: "Late arrivals, wrong address, or courier behavior.",
  },
  {
    icon: "track_changes",
    title: "Real-time tracking",
    desc: "Follow every step — from receipt to resolution.",
  },
  {
    icon: "support_agent",
    title: "Dedicated support",
    desc: "Our team reviews and responds to every complaint.",
  },
];

const steps = [
  { label: "Receive", icon: "move_to_inbox" },
  { label: "Review", icon: "fact_check" },
  { label: "Process", icon: "build_circle" },
  { label: "Respond", icon: "mark_email_read" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* ── Left panel ── */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 px-12 py-10 lg:flex">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-indigo-600/8 blur-2xl" />
          </div>

          <div className="relative z-10">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <span className="material-symbols-outlined text-[22px] text-white">local_shipping</span>
              </div>
              <div>
                <p className="text-base font-bold text-white">VISHIPEL</p>
                <p className="text-xs text-slate-400">Delivery Complaint Portal</p>
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="relative z-10 my-auto space-y-6 py-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-blue-300">Complaint Management System</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-white">
              Resolve delivery issues,{" "}
              <span className="text-blue-400">fast</span> and{" "}
              <span className="text-blue-400">transparently.</span>
            </h1>

            <p className="text-base leading-relaxed text-slate-400">
              Submit and track complaints about lost packages, damaged goods, late
              deliveries, and more — all in one place.
            </p>

            {/* Process steps */}
            <div className="flex items-center gap-0">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 ring-1 ring-slate-600">
                      <span className="material-symbols-outlined text-[16px] text-blue-400">{step.icon}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mb-5 h-px w-8 bg-slate-700" />
                  )}
                </div>
              ))}
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                    <span className="material-symbols-outlined text-[18px] text-blue-400">{f.icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-slate-600">lock</span>
            <p className="text-xs text-slate-600">Secured connection · VISHIPEL © 2025</p>
          </div>
        </section>

        {/* ── Right panel ── */}
        <section className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
          {/* Mobile brand (visible only on small screens) */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <span className="material-symbols-outlined text-[20px] text-white">local_shipping</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">VISHIPEL</p>
              <p className="text-xs text-slate-400">Delivery Complaint Portal</p>
            </div>
          </div>

          <div className="w-full max-w-md">
            {/* Form header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to submit or manage delivery complaints.
              </p>
            </div>

            {/* Form */}
            <LoginForm />
          </div>
        </section>

      </div>
    </main>
  );
}
