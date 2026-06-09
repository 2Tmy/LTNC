import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService.js";
import { mapBackendRoleToRouteRole, ROUTE_PATHS, USER_ROLES } from "../../routes/routePaths.js";

const inputBase =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15";

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await login(form.email, form.password);
      const { token, role, name, email, createdAt } = res.data.data;
      const routeRole = mapBackendRoleToRouteRole(role);

      localStorage.setItem("token", token);
      localStorage.setItem("demoRole", routeRole);
      localStorage.setItem("demoBackendRole", role);
      localStorage.setItem("demoEmail", email);
      localStorage.setItem("demoName", name);
      if (createdAt) localStorage.setItem("demoCreatedAt", createdAt);

      navigate(routeRole === USER_ROLES.admin ? ROUTE_PATHS.adminDashboard : ROUTE_PATHS.customerDashboard);
    } catch (err) {
      const message = err.response
        ? err.response.data?.message || "Sign in failed. Please try again."
        : "Cannot connect to the server. Start the backend and try again.";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="email">
          Email address
        </label>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            mail
          </span>
          <input
            className={inputBase}
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            lock
          </span>
          <input
            className={inputBase}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={updateField}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      {/* Form error */}
      {errors.form && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-red-500">error</span>
          <p className="text-xs text-red-700">{errors.form}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            Signing in...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign in
          </>
        )}
      </button>

      {/* Register link */}
      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to={ROUTE_PATHS.register} className="font-semibold text-blue-600 hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
