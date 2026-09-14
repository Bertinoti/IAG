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
    [state, setState] = useState("Select an airline and intent to begin."),
    [pendingSelection, setPendingSelection] = useState<{
      field: "airline" | "intent";
      value: string;
    } | null>(null);
  const [sending, setSending] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch(`${api}/api/airlines`).then((r) => r.json()),
      fetch(`${api}/api/intents`).then((r) => r.json()),
    ]).then(([a, i]) => {
      setAirlines(a.items);
      setIntents(i.items);
    });
  }, []);
  async function start(nextAirline = airline, nextIntent = intent) {
    if (!nextAirline || !nextIntent) return;
    const r = await fetch(`${api}/api/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        airline_id: +nextAirline,
        intent_id: +nextIntent,
      }),
    });
    const c = await r.json();
    setConversation(c);
    setMessages([]);
    setState("Ready");
  }
  function requestSelection(field: "airline" | "intent", value: string) {
    const nextAirline = field === "airline" ? value : airline;
    const nextIntent = field === "intent" ? value : intent;
    const changesSelection = value !== (field === "airline" ? airline : intent);
    if (changesSelection && conversation) {
      setPendingSelection({ field, value });
      return;
    }
    if (field === "airline") setAirline(value);
    else setIntent(value);
    if (!conversation && nextAirline && nextIntent) {
      setState("Starting a new conversation…");
      void start(nextAirline, nextIntent);
    }
  }
  function confirmNewConversation() {
    if (!pendingSelection) return;
    const nextAirline =
      pendingSelection.field === "airline" ? pendingSelection.value : airline;
    const nextIntent =
      pendingSelection.field === "intent" ? pendingSelection.value : intent;
    if (pendingSelection.field === "airline")
      setAirline(pendingSelection.value);
    else setIntent(pendingSelection.value);
    setConversation(null);
    setMessages([]);
    setText("");
    setState("Starting a new conversation…");
    setPendingSelection(null);
    void start(nextAirline, nextIntent);
  }
  async function send() {
    if (!conversation || !text.trim() || sending) return;
    setSending(true);
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
      setSending(false);
      return;
    }
    setMessages((m) => [...m, d.user_message, d.assistant_message]);
    setText("");
    setState("Ready");
    setSending(false);
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
          onChange={(e) => requestSelection("airline", e.target.value)}
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
          onChange={(e) => requestSelection("intent", e.target.value)}
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
      <form
        className="mt-3 flex min-w-0 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          disabled={!conversation || sending}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2.5 focus:border-brand-500 focus:outline-none disabled:bg-slate-100"
          placeholder="Ask a question"
        />
        <button
          disabled={!conversation || sending}
          type="submit"
          className="shrink-0 whitespace-nowrap rounded-lg bg-brand-600 px-2.5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3.5"
        >
          {sending ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Sending</span>
              <span className="sm:hidden" aria-label="Sending">
                …
              </span>
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
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
      {pendingSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-conversation-title"
          >
            <h2 id="new-conversation-title" className="text-xl font-semibold">
              Start a new conversation?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {conversation
                ? `Changing the ${pendingSelection.field} will end this conversation and clear its messages.`
                : "Your selections are ready. Start a new conversation with these options?"}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingSelection(null)}
                className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Keep conversation
              </button>
              <button
                type="button"
                onClick={confirmNewConversation}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Start conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
