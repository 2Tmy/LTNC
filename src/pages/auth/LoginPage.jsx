import LoginForm from "../../components/auth/LoginForm.jsx";

const highlights = [
  { label: "Track every complaint", icon: "track_changes" },
  { label: "Secure customer access", icon: "verified_user" },
  { label: "Fast staff handoff", icon: "support_agent" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface text-on-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between bg-primary p-xl text-on-primary lg:min-h-screen">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined rounded-[0.5rem] bg-white/15 p-xs text-[28px]">
              forum
            </span>
            <div>
              <p className="text-h3">Resolution Center</p>
              <p className="text-body-sm text-white/75">Customer complaint portal</p>
            </div>
          </div>

          <div className="my-xl max-w-md space-y-md">
            <p className="text-display">Resolve requests with clear status and accountability.</p>
            <p className="text-body-lg text-white/75">
              Sign in to submit complaints, review progress, and keep every customer interaction organized.
            </p>
          </div>

          <div className="grid gap-sm sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center gap-sm rounded-[0.5rem] bg-white/10 p-sm">
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-body-sm text-white/85">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-lg sm:p-xl">
          <div className="w-full max-w-md rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm sm:p-xl">
            <div className="mb-lg space-y-xs">
              <p className="text-label-md uppercase text-primary">Welcome back</p>
              <h1 className="text-h1 text-on-surface">Sign in to your account</h1>
              <p className="text-body-md text-on-surface-variant">
                Use a customer or staff demo profile to continue.
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
