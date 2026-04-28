import RegisterForm from "../../components/auth/RegisterForm.jsx";

const steps = [
  "Create your customer profile",
  "Submit complaints with evidence",
  "Receive progress updates",
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-surface text-on-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="flex items-center justify-center p-lg sm:p-xl">
          <div className="w-full max-w-2xl rounded-[0.75rem] border border-outline-variant bg-white p-lg shadow-sm sm:p-xl">
            <div className="mb-lg space-y-xs">
              <p className="text-label-md uppercase text-primary">New customer</p>
              <h1 className="text-h1 text-on-surface">Create your account</h1>
              <p className="text-body-md text-on-surface-variant">
                Register to submit complaints and monitor each case from intake to resolution.
              </p>
            </div>

            <RegisterForm />
          </div>
        </section>

        <section className="flex flex-col justify-between bg-inverse-surface p-xl text-inverse-on-surface lg:min-h-screen">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined rounded-[0.5rem] bg-white/10 p-xs text-[28px]">
              fact_check
            </span>
            <div>
              <p className="text-h3">Resolution Center</p>
              <p className="text-body-sm text-white/65">Structured complaint handling</p>
            </div>
          </div>

          <div className="my-xl max-w-md space-y-md">
            <p className="text-display">Everything needed to start a case in one place.</p>
            <p className="text-body-lg text-white/70">
              Your account keeps complaint history, evidence, and resolution updates available whenever you need them.
            </p>
          </div>

          <ol className="space-y-sm">
            {steps.map((step, index) => (
              <li key={step} className="flex items-center gap-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-button">
                  {index + 1}
                </span>
                <span className="text-body-md text-white/80">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
