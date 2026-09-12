"use client";
import { useEffect, useState } from "react";
const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export default function ChatPage() {
  const [airlines, setAirlines] = useState<any[]>([]),
    [intents, setIntents] = useState<any[]>([]),
    [airline, setAirline] = useState(""),
    [intent, setIntent] = useState(""),
    [conversation, setConversation] = useState<any>(null),
    [messages, setMessages] = useState<any[]>([]),
    [text, setText] = useState(""),
    [state, setState] = useState("Select an airline and intent to begin.");
  useEffect(() => {
    Promise.all([
      fetch(`${api}/api/airlines`).then((r) => r.json()),
      fetch(`${api}/api/intents`).then((r) => r.json()),
    ]).then(([a, i]) => {
      setAirlines(a.items);
      setIntents(i.items);
    });
  }, []);
  async function start() {
    if (!airline || !intent) return;
    const r = await fetch(`${api}/api/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ airline_id: +airline, intent_id: +intent }),
    });
    const c = await r.json();
    setConversation(c);
    setMessages([]);
    setState("Ready");
  }
  async function send() {
    if (!conversation || !text.trim()) return;
    setState("Sending…");
    const r = await fetch(
      `${api}/api/conversations/${conversation.id}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      },
    );
    const d = await r.json();
    if (!r.ok) {
      setState(d.detail ?? "Unable to send message");
      return;
    }
    setMessages((m) => [...m, d.user_message, d.assistant_message]);
    setText("");
    setState("Ready");
  }
  async function rate(rating: string) {
    await fetch(`${api}/api/conversations/${conversation.id}/rating`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    setState(`Rated ${rating}`);
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-brand-600">
          Public assistant
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Ask about your journey
        </h1>
        <p className="mt-2 text-slate-600">
          Choose an airline and a supported topic to start a conversation.
        </p>
      </div>
      <div className="grid gap-3 rounded-2xl border bg-white p-5 shadow-soft sm:grid-cols-2">
        <select
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          className="rounded-xl border bg-slate-50 px-3 py-2.5 focus:border-brand-500 focus:bg-white focus:outline-none"
        >
          <option value="">Choose airline</option>
          {airlines.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className="rounded-xl border bg-slate-50 px-3 py-2.5 focus:border-brand-500 focus:bg-white focus:outline-none"
        >
          <option value="">Choose intent</option>
          {intents.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={start}
        className="mt-4 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
      >
        Start conversation
      </button>
      <p className="mt-3 text-sm text-slate-600">{state}</p>
      <section className="mt-6 min-h-56 space-y-3 rounded-2xl border bg-white p-5 shadow-soft">
        {messages.length ? (
          messages.map((m) => (
            <p
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              <span className="mr-1 font-semibold">
                {m.role === "user" ? "You" : "Assistant"}:
              </span>{" "}
              {m.content}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            No messages yet. Start by choosing your airline and topic.
          </p>
        )}
      </section>
      <div className="mt-3 flex gap-2">
        <input
          disabled={!conversation}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          className="flex-1 rounded-lg border bg-white px-3 py-2.5 focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
          placeholder="Ask a question"
        />
        <button
          disabled={!conversation}
          onClick={send}
          className="rounded-lg bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {conversation && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => rate("positive")}
            className="rounded-lg border bg-white px-2.5 py-1.5 text-sm font-medium transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            👍
          </button>
          <button
            onClick={() => rate("negative")}
            className="rounded-lg border bg-white px-2.5 py-1.5 text-sm font-medium transition hover:border-rose-400 hover:bg-rose-50"
          >
            👎
          </button>
        </div>
      )}
    </main>
  );
}
