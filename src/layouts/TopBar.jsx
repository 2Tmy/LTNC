import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../routes/routePaths.js";

export default function TopBar({ user }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="text-on-surface md:hidden" type="button" aria-label="Open navigation">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-h1 text-on-surface">Good morning, {user.firstName}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-50"
          type="button"
          aria-label="Notifications"
          onClick={() => navigate(ROUTE_PATHS.notifications)}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-1.5 top-1.5 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white" />
        </button>

        <div className="mx-2 h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <span className="hidden text-body-md font-medium text-slate-700 sm:block">{user.name}</span>
          <img className="h-8 w-8 rounded-full object-cover" src={user.avatarUrl} alt={`${user.name} avatar`} />
        </div>
      </div>
    </header>
  );
}
