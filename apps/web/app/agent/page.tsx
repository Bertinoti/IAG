"use client";
import { FormEvent, useEffect, useState } from "react";
import { getSession } from "../../lib/api";
const api = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
export default function AgentPage() {
  const [form, setForm] = useState({
    context: "",
    guardrails: "",
    content: "",
    language: "English",
  });
  const [state, setState] = useState("Loading…");
  useEffect(() => {
    getSession().then((u) => {
      if (!u) location.href = "/login";
      else
        fetch(`${api}/api/agent-config`, { credentials: "include" })
          .then((r) => r.json())
          .then(setForm)
          .then(() => setState("Ready"));
    });
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    setState("Saving…");
    const r = await fetch(`${api}/api/agent-config`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setState(r.ok ? "Saved" : "Error saving");
  }
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">Agent configuration</h1>
      <p className="mt-2 text-slate-600">{state}</p>
      <form onSubmit={save} className="mt-6 space-y-4">
        {(["context", "guardrails", "content"] as const).map((k) => (
          <label key={k} className="block font-medium">
            {k}
            <textarea
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="mt-1 min-h-24 w-full rounded border p-2"
            />
          </label>
        ))}
        <label className="block font-medium">
          Language
          <input
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <button className="rounded bg-slate-900 px-4 py-2 text-white">
          Save configuration
        </button>
      </form>
    </main>
  );
}
