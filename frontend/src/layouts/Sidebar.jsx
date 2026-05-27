import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths.js";
import { clearDemoAuth } from "../utils/demoAuth.js";

const navItems = [
  { label: "Dashboard", icon: "dashboard", to: ROUTE_PATHS.customerDashboard },
  { label: "New Complaint", icon: "add_circle", to: ROUTE_PATHS.submitComplaint },
  { label: "My Complaints", icon: "list_alt", to: ROUTE_PATHS.myComplaints },
  { label: "Notifications", icon: "notifications", to: ROUTE_PATHS.notifications },
  { label: "Profile", icon: "person", to: ROUTE_PATHS.profile },
];

export default function Sidebar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearDemoAuth();
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[240px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      {/* Brand */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <span className="material-symbols-outlined text-[20px] text-white">local_shipping</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">VISHIPEL</p>
            <p className="text-xs text-slate-400">Customer Portal</p>
          </div>
        </div>

        {user && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.name || "Customer"}</p>
              <p className="text-xs text-slate-400">Customer</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.to)
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
