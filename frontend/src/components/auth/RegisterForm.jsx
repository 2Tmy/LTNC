import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService.js";
import { BACKEND_ROLES, ROUTE_PATHS, USER_ROLES } from "../../routes/routePaths.js";

const fieldBase =
  "w-full rounded-[0.5rem] border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!form.terms) {
      nextErrors.terms = "Please accept the terms to continue.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await register(form.fullName, form.email, form.password);
      const { token, name, email, role, createdAt } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("demoRole", USER_ROLES.customer);
      localStorage.setItem("demoBackendRole", role || BACKEND_ROLES.customer);
      localStorage.setItem("demoEmail", email);
      localStorage.setItem("demoName", name);
      if (createdAt) {
        localStorage.setItem("demoCreatedAt", createdAt);
      }

      navigate(ROUTE_PATHS.customerDashboard);
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  const renderTextField = ({ id, label, type = "text", autoComplete, placeholder, icon }) => (
    <div className="space-y-xs">
      <label className="text-label-md uppercase text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined pointer-events-none absolute left-sm top-1/2 -translate-y-1/2 text-[20px] text-outline">
          {icon}
        </span>
        <input
          className={`${fieldBase} pl-xl`}
          id={id}
          name={id}
          type={type}
          value={form[id]}
          onChange={updateField}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      </div>
      {errors[id] ? <p className="text-body-sm text-error">{errors[id]}</p> : null}
    </div>
  );

  return (
    <form className="space-y-md" onSubmit={handleSubmit} noValidate>
      {renderTextField({
        id: "fullName",
        label: "Full name",
        placeholder: "Alex Johnson",
        autoComplete: "name",
        icon: "badge",
      })}

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        {renderTextField({
          id: "email",
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
          autoComplete: "email",
          icon: "mail",
        })}
        {renderTextField({
          id: "phone",
          label: "Phone",
          type: "tel",
          placeholder: "(555) 012-4567",
          autoComplete: "tel",
          icon: "call",
        })}
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        {renderTextField({
          id: "password",
          label: "Password",
          type: "password",
          placeholder: "At least 8 characters",
          autoComplete: "new-password",
          icon: "lock",
        })}
        {renderTextField({
          id: "confirmPassword",
          label: "Confirm",
          type: "password",
          placeholder: "Repeat password",
          autoComplete: "new-password",
          icon: "lock_reset",
        })}
      </div>

      <div className="space-y-xs">
        <label className="flex items-start gap-xs text-body-sm text-on-surface-variant">
          <input
            className="mt-[2px] h-4 w-4 rounded border-outline-variant text-primary"
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={updateField}
          />
          I agree to receive case updates and accept the service terms.
        </label>
        {errors.terms ? <p className="text-body-sm text-error">{errors.terms}</p> : null}
      </div>

      {errors.form ? (
        <div className="rounded-[0.5rem] border border-error-container bg-error-container px-md py-sm text-body-sm text-on-error-container">
          {errors.form}
        </div>
      ) : null}

      <button
        className="flex w-full items-center justify-center gap-xs rounded-[0.5rem] bg-primary px-lg py-sm text-button text-on-primary shadow-sm transition hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-body-sm text-on-surface-variant">
        Already registered?{" "}
        <Link className="font-semibold text-primary hover:underline" to={ROUTE_PATHS.login}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
