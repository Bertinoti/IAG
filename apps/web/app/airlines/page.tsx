"use client";

import { useEffect, useState } from "react";
import { getSession } from "../../lib/api";

const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
type Item = {
  airline: { id: number; name: string; code: string };
  configuration: {
    context: string;
    guardrails: string;
    content: string;
    language: string;
  };
};

export default function AirlinesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [status, setStatus] = useState("Loading…");
  useEffect(() => {
    getSession().then((user) => {
      if (!user) {
        location.href = "/login";
        return;
      }
      fetch(`${api}/api/airline-config`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          setItems(d.items);
          setSelected(d.items[0] ?? null);
          setStatus("Ready");
        });
    });
  }, []);
  async function save() {
    if (!selected) return;
    setStatus("Saving…");
    const r = await fetch(`${api}/api/airline-config/${selected.airline.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected.configuration),
    });
    setStatus(r.ok ? "Saved" : "Unable to save");
  }
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-brand-600">
        Administration
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Airline prompts
      </h1>
      <p className="mt-2 text-slate-600">
        Configure the prompt context used for each airline.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
        {" "}
        <aside className="rounded-2xl border bg-white p-2 shadow-soft">
          {items.map((item) => (
            <button
              key={item.airline.id}
              onClick={() => setSelected(item)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm ${selected?.airline.id === item.airline.id ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-slate-50"}`}
            >
              <span className="block">{item.airline.name}</span>
              <span className="text-xs text-slate-500">
                {item.airline.code}
              </span>
            </button>
          ))}
        </aside>
        {selected && (
          <section className="rounded-2xl border bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {selected.airline.name}
                </h2>
                <p className="text-sm text-slate-500">
                  {selected.airline.code}
                </p>
              </div>
              <span className="text-sm text-slate-500">{status}</span>
            </div>
            <div className="mt-6 space-y-5">
              {(["context", "guardrails", "content"] as const).map((key) => (
                <label
                  key={key}
                  className="block text-sm font-medium capitalize"
                >
                  {key}
                  <textarea
                    value={selected.configuration[key]}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        configuration: {
                          ...selected.configuration,
                          [key]: e.target.value,
                        },
                      })
                    }
                    className="mt-2 min-h-28 w-full rounded-xl border bg-slate-50 px-3 py-2.5 font-normal focus:border-brand-500 focus:bg-white focus:outline-none"
                  />{" "}
                </label>
              ))}
              <label className="block text-sm font-medium">
                Language
                <input
                  value={selected.configuration.language}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      configuration: {
                        ...selected.configuration,
                        language: e.target.value,
                      },
                    })
                  }
                  className="mt-2 w-full rounded-xl border bg-slate-50 px-3 py-2.5 font-normal focus:border-brand-500 focus:bg-white focus:outline-none"
                />
              </label>
              <button
                onClick={save}
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Save airline prompt
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
