export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-lg text-center">
      <section className="rounded-[0.75rem] border border-outline-variant bg-white p-xl shadow-sm">
        <h1 className="text-h1 text-on-surface">Page not found</h1>
        <p className="mt-sm text-body-md text-secondary">The page you requested does not exist.</p>
      </section>
    </main>
  );
}
