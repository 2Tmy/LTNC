import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths.js";
import { clearDemoAuth } from "../utils/demoAuth.js";

const adminNavItems = [
  { label: "Dashboard", icon: "dashboard", to: ROUTE_PATHS.adminDashboard },
  { label: "Complaints", icon: "assignment_late", to: ROUTE_PATHS.adminComplaints },
  { label: "Complaint Status", icon: "checklist", to: ROUTE_PATHS.adminComplaintStatus },
  { label: "Staff Management", icon: "badge", to: ROUTE_PATHS.adminStaff },
  { label: "User Management", icon: "groups", to: ROUTE_PATHS.adminUsers },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearDemoAuth();
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="px-lg py-lg">
        <h1 className="text-h2 text-on-surface">Resolutio Admin</h1>
        <p className="mt-1 text-body-sm text-secondary">Enterprise Support</p>
      </div>

      <nav className="mt-md flex-1 space-y-xs">
        {adminNavItems.map((item) => (
          <Link
            key={item.label}
            className={`relative flex items-center gap-md px-lg py-sm text-body-lg font-medium transition-colors ${
              location.pathname === item.to ? "bg-blue-50 text-blue-700" : "text-secondary hover:bg-slate-50 hover:text-on-surface"
            }`}
            to={item.to}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
            {location.pathname === item.to ? <span className="absolute bottom-0 right-0 top-0 w-1 bg-blue-700" /> : null}
          </Link>
        ))}
      </nav>

      <div className="space-y-md px-md pb-xl">
        <button
          className="flex items-center gap-md px-md py-xs text-body-lg font-medium text-red-600 hover:text-red-700"
          type="button"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
