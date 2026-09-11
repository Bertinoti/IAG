import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Airline AI Agent</h1>
      <p className="mt-3 text-slate-600">Administrator backoffice</p>
      <Link
        className="mt-6 inline-block rounded bg-slate-900 px-4 py-2 text-white"
        href="/login"
      >
        Sign in
      </Link>
    </main>
  );
}
