"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession } from "../../lib/api";
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export default function ConversationsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    getSession().then((u) => {
      if (!u) location.href = "/login";
      else
        fetch(`${api}/api/conversations`, { credentials: "include" })
          .then((r) => r.json())
          .then((d) => setItems(d.items));
    });
  }, []);
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-semibold">Conversations</h1>
      <div className="mt-6 overflow-x-auto rounded border bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Airline</th>
              <th className="p-3">Intent</th>
              <th className="p-3">Messages</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">
                    <Link className="underline" href={`/conversations/${c.id}`}>
                      {c.id}
                    </Link>
                  </td>
                  <td className="p-3">
                    {c.airline_code || c.airline_name || "—"}
                  </td>
                  <td className="p-3 capitalize">{c.intent_name || "—"}</td>
                  <td className="p-3">{c.message_count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-6 text-slate-500" colSpan={4}>
                  No conversations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
