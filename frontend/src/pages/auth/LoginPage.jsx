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
        <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 px-8 py-8 lg:flex">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-indigo-600/8 blur-2xl" />
          </div>

          <div className="relative z-10">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
                <span className="material-symbols-outlined text-[18px] text-white">local_shipping</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">VISHIPEL</p>
                <p className="text-[10px] text-slate-500">Complaint Portal</p>
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="relative z-10 my-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5">
              <span className="h-1 w-1 rounded-full bg-blue-400" />
              <span className="text-[10px] font-medium text-blue-300">Complaint Management</span>
            </div>

            <h1 className="text-2xl font-bold leading-snug text-white">
              Resolve delivery issues{" "}
              <span className="text-blue-400">fast</span> &amp;{" "}
              <span className="text-blue-400">transparent</span>
            </h1>

            <p className="text-xs leading-relaxed text-slate-400">
              Submit and track delivery complaints — lost packages, damaged goods, late arrivals, and more.
            </p>

            {/* Feature cards - 2 columns, first 2 items only */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {features.slice(0, 2).map((f) => (
                <div
                  key={f.title}
                  className="rounded-lg border border-slate-700/40 bg-slate-800/50 p-2.5 backdrop-blur-sm"
                >
                  <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/15">
                    <span className="material-symbols-outlined text-[14px] text-blue-400">{f.icon}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-200">{f.title}</p>
                  <p className="mt-0.5 text-[9px] leading-tight text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-slate-600">lock</span>
            <p className="text-[9px] text-slate-600">Secured · VISHIPEL © 2025</p>
          </div>
        </section>

        {/* ── Right panel ── */}
        <section className="flex h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-6 sm:px-10">
          {/* Mobile brand (visible only on small screens) */}
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="material-symbols-outlined text-[18px] text-white">local_shipping</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">VISHIPEL</p>
              <p className="text-xs text-slate-400">Complaint Portal</p>
            </div>
          </div>

          <div className="w-full max-w-md">
            {/* Form header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Sign in to manage your complaints.
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
