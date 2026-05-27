import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths.js";
import { clearDemoAuth } from "../utils/demoAuth.js";

const processSteps = [
  { label: "Receive", icon: "move_to_inbox", to: ROUTE_PATHS.adminReceive, step: 1 },
  { label: "Review", icon: "fact_check", to: ROUTE_PATHS.adminReview, step: 2 },
  { label: "Process", icon: "build_circle", to: ROUTE_PATHS.adminProcess, step: 3 },
  { label: "Response", icon: "mark_email_read", to: ROUTE_PATHS.adminResponse, step: 4 },
];

const mainNavItems = [
  { label: "Dashboard", icon: "dashboard", to: ROUTE_PATHS.adminDashboard },
  { label: "Users", icon: "groups", to: ROUTE_PATHS.adminUsers },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearDemoAuth();
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <span className="material-symbols-outlined text-[20px] text-white">local_shipping</span>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">VISHIPEL Admin</p>
          <p className="text-xs text-slate-400">Complaint Management</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {/* Main nav */}
        {mainNavItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.to)
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
            {isActive(item.to) && (
              <span className="absolute right-0 top-1 bottom-1 w-[3px] rounded-l-full bg-blue-600" />
            )}
          </Link>
        ))}

        {/* Divider */}
        <div className="my-2 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Complaint Workflow
          </p>
        </div>

        {/* Process steps */}
        {processSteps.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.step}
              </span>
              <span>{item.label}</span>
              {active && (
                <span className="absolute right-0 top-1 bottom-1 w-[3px] rounded-l-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
