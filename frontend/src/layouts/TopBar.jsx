export default function TopBar({ user }) {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="text-on-surface md:hidden" type="button" aria-label="Open navigation">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-h1 text-on-surface">Good morning, {user.firstName}</h1>
      </div>
    </header>
  );
}
