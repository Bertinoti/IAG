"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSession } from "../../../lib/api";
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export default function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    getSession().then((u) => {
      if (!u) location.href = "/login";
      else
        fetch(`${api}/api/conversations/${id}`, { credentials: "include" })
          .then((r) => r.json())
          .then(setData);
    });
  }, [id]);
  if (!data) return <main className="p-8">Loading conversation…</main>;
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Conversation {id}</h1>
      <p className="mt-2 text-slate-600">
        Airline {data.conversation.airline_id} · Intent{" "}
        {data.conversation.intent_id} · Rating {data.rating ?? "None"}
      </p>
      <section className="mt-6 space-y-3 rounded border bg-white p-4">
        {data.messages.map((m: any) => (
          <p key={m.id}>
            <b>{m.role}:</b> {m.content}
          </p>
        ))}
      </section>
    </main>
  );
}
