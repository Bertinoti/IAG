import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[.22em] text-brand-600">
          Airline intelligence
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          A calmer way to manage airline support.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Configure your assistant, review conversations, and understand
          customer questions from one focused workspace.
        </p>
        <Link
          className="mt-8 inline-flex items-center rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-700"
          href="/login"
        >
          Open workspace <span className="ml-2">→</span>
        </Link>
      </div>
    </main>
  );
}
