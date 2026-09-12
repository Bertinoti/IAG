"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-soft"
        aria-label="Administrator login"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-brand-600">
            Airline intelligence
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use the seeded administrator account.
          </p>
        </div>
        <label className="block text-sm font-medium">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 transition focus:border-brand-500 focus:bg-white focus:outline-none"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
