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
    event.preventDefault(); setLoading(true); setError("");
    try { await login(email, password); router.replace("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in"); }
    finally { setLoading(false); }
  }
  return <main className="flex min-h-screen items-center justify-center px-6"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow" aria-label="Administrator login"><div><h1 className="text-2xl font-semibold">Administrator sign in</h1><p className="mt-1 text-sm text-slate-600">Use the seeded administrator account.</p></div><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded border p-2" /></label><label className="block text-sm font-medium">Password<input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded border p-2" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button></form></main>;
}
