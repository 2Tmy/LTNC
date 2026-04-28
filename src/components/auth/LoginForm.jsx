import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authenticateMockUser } from "../../mocks/authMock.js";
import { ROUTE_PATHS, USER_ROLES } from "../../routes/routePaths.js";

const fieldBase =
  "w-full rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: USER_ROLES.customer,
    remember: true,
  });
  const [errors, setErrors] = useState({});

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const authenticatedUser = authenticateMockUser(form);

    if (!authenticatedUser) {
      setErrors({
        form: "Email, password, or account type is incorrect.",
      });
      return;
    }

    window.localStorage.setItem("demoRole", authenticatedUser.role);
    window.localStorage.setItem("demoEmail", authenticatedUser.email);
    window.localStorage.setItem("demoName", authenticatedUser.name);

    navigate(
      authenticatedUser.role === USER_ROLES.admin ? ROUTE_PATHS.adminDashboard : ROUTE_PATHS.customerDashboard
    );
  };

  return (
    <form className="space-y-lg" onSubmit={handleSubmit} noValidate>
      <div className="space-y-xs">
        <label className="text-label-md uppercase text-on-surface-variant" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-[20px] text-outline">
            mail
          </span>
          <input
            className={`${fieldBase} pl-xl`}
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        {errors.email ? <p className="text-body-sm text-error">{errors.email}</p> : null}
      </div>

      <div className="space-y-xs">
        <label className="text-label-md uppercase text-on-surface-variant" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-[20px] text-outline">
            lock
          </span>
          <input
            className={`${fieldBase} pl-xl`}
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>
        {errors.password ? <p className="text-body-sm text-error">{errors.password}</p> : null}
      </div>

      <fieldset className="space-y-xs">
        <legend className="text-label-md uppercase text-on-surface-variant">Continue as</legend>
        <div className="grid grid-cols-2 gap-sm">
          {[
            { value: USER_ROLES.customer, label: "Customer", icon: "person" },
            { value: USER_ROLES.admin, label: "Staff", icon: "admin_panel_settings" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center justify-center gap-xs rounded-[0.5rem] border px-sm py-sm text-button transition ${
                form.role === option.value
                  ? "border-primary bg-primary-fixed text-on-primary-fixed-variant"
                  : "border-outline-variant bg-white text-on-surface-variant hover:border-outline"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="role"
                value={option.value}
                checked={form.role === option.value}
                onChange={updateField}
              />
              <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-sm text-body-sm">
        <label className="flex items-center gap-xs text-on-surface-variant">
          <input
            className="h-4 w-4 rounded border-outline-variant text-primary"
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={updateField}
          />
          Remember me
        </label>
        <a className="font-medium text-primary hover:underline" href="#forgot-password">
          Forgot password?
        </a>
      </div>

      {errors.form ? (
        <div className="rounded-[0.5rem] border border-error-container bg-error-container px-md py-sm text-body-sm text-on-error-container">
          {errors.form}
        </div>
      ) : null}

      <button
        className="flex w-full items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary/25"
        type="submit"
      >
        <span className="material-symbols-outlined text-[20px]">login</span>
        Sign in
      </button>

      <p className="text-center text-body-sm text-on-surface-variant">
        Need an account?{" "}
        <Link className="font-semibold text-primary hover:underline" to={ROUTE_PATHS.register}>
          Create one
        </Link>
      </p>
    </form>
  );
}
