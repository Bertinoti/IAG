"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Admin, getSession, logout } from "../../lib/api";

export default function DashboardPage() {
  const router = useRouter(); const [admin, setAdmin] = useState<Admin | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { getSession().then(user => { if (!user) router.replace("/login"); else setAdmin(user); }).finally(() => setLoading(false)); }, [router]);
  if (loading) return <main className="p-8">Loading session…</main>;
  if (!admin) return null;
  return <main className="mx-auto max-w-4xl p-8"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-semibold">Dashboard</h1><p className="mt-2 text-slate-600">Signed in as {admin.email}</p></div><button onClick={async () => { await logout(); router.replace("/login"); }} className="rounded border px-4 py-2">Log out</button></div><section className="mt-8 rounded border bg-white p-6"><h2 className="font-medium">Backoffice shell</h2><p className="mt-2 text-slate-600">Product dashboard features arrive in a later approved phase.</p></section></main>;
}
