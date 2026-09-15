"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="block text-sm font-medium">
          <label htmlFor="password">Password</label>
          <span className="relative mt-2 block">
            <input
              id="password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-slate-50 px-3 py-2.5 pr-11 transition focus:border-brand-500 focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide secret" : "Show secret"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPassword ? <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></> : <><path d="m3 3 18 18" /><path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18.3 18.3 0 0 1-3.1 3.9M6.2 6.2C3.7 7.9 2 12 2 12s3.5 7 10 7a10.8 10.8 0 0 0 3.4-.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}
              </svg>
            </button>
          </span>
        </div>
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
