import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths.js";
import { clearDemoAuth } from "../utils/demoAuth.js";

const navItems = [
  { label: "Dashboard", icon: "dashboard", to: ROUTE_PATHS.customerDashboard },
  { label: "My Complaints", icon: "assignment", to: ROUTE_PATHS.customerDashboard },
  { label: "Submit Complaint", icon: "add_circle", to: ROUTE_PATHS.submitComplaint },
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

  return (
    <aside className="z-40 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 shadow-none md:flex">
      <div className="mb-8 px-2">
        <div className="text-lg font-black text-primary-container">ResolutionCenter</div>
        <div className="mt-4 flex items-center space-x-3">
          <img
            className="h-10 w-10 rounded-full border border-slate-100 object-cover"
            src={user.avatarUrl}
            alt={`${user.name} profile`}
          />
          <div>
            <p className="text-h3 text-on-surface">Welcome back</p>
            <p className="text-body-sm text-slate-500">Support Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            className={`flex items-center rounded-[0.5rem] px-3 py-2 text-sm font-medium transition-all duration-200 ${
              item.to !== "#" && location.pathname === item.to
                ? "bg-blue-50 text-primary-container"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            to={item.to}
          >
            <span className="material-symbols-outlined mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-100 pt-4">
        <button
          className="flex items-center rounded-[0.5rem] px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          type="button"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
