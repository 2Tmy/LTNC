export default function AdminTopBar({ user }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-slate-200 bg-white px-xl">
      <div className="flex items-center gap-md">
        <button className="text-on-surface md:hidden" type="button" aria-label="Open admin navigation">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-[28px] font-semibold leading-9 tracking-normal text-on-surface">
          Good morning, {user.firstName || user.name}
        </h1>
      </div>
    </header>
  );
}
