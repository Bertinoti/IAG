"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Admin, getDashboard, getSession } from "../../lib/api";
import { Chart } from "./chart";

export default function DashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7d" | "30d" | "all">("all");
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getSession()
      .then((user) => {
        if (!user) router.replace("/login");
        else {
          setAdmin(user);
          return getDashboard(range).then(setData);
        }
      })
      .finally(() => setLoading(false));
  }, [router, range]);
  if (loading) return <main className="p-8">Loading session…</main>;
  if (!admin) return null;
  const k = data?.kpis ?? {};
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-slate-600">Signed in as {admin.email}</p>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as typeof range)}
          className="rounded border p-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Conversations", k.total_conversations],
          ["Messages", k.total_messages],
          [
            "Avg messages",
            Number(k.average_messages_per_conversation ?? 0).toFixed(1),
          ],
          [
            "Positive %",
            `${Number(k.positive_rating_percentage ?? 0).toFixed(1)}%`,
          ],
          ["Tokens", k.total_tokens],
          ["Estimated cost", `$${Number(k.estimated_ai_cost ?? 0).toFixed(4)}`],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded border bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <strong className="text-2xl">{value}</strong>
          </article>
        ))}
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="min-w-0 overflow-hidden rounded border bg-white p-1 sm:p-2">
          <Chart
            title="By airline"
            items={data?.conversations_by_airline ?? []}
          />
        </article>
        <article className="min-w-0 overflow-hidden rounded border bg-white p-1 sm:p-2">
          <Chart
            title="Intent distribution"
            items={data?.intent_distribution ?? []}
          />
        </article>
        <article className="min-w-0 overflow-hidden rounded border bg-white p-1 sm:p-2">
          <Chart title="Feedback" items={data?.feedback_distribution ?? []} />
        </article>
        <article className="min-w-0 overflow-hidden rounded border bg-white p-1 sm:p-2">
          <Chart
            title="Languages"
            items={data?.language_distribution ?? []}
            type="pie"
          />
        </article>
      </section>
    </main>
  );
}
