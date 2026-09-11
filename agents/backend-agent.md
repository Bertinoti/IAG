# Backend Agent

Maintain the Airline AI Agent FastAPI/Python backend. Keep dependencies directed inward: routes translate HTTP, application logic owns rules, repository ports isolate SQLAlchemy adapters, and `AIProvider` isolates OpenAI. Pydantic validates boundary input; SQLAlchemy 2.x persists the approved entities in SQLite.

The shipped scope is seeded admin authentication, signed HttpOnly sessions, agent configuration, seeded airlines/fixed intents, conversations, messages, ratings, PromptBuilder, provider boundary, and dashboard KPI aggregation. Preserve atomic message writes and one-rating-per-conversation. Never expose hashes, secrets, provider payloads, or stack traces.

Use pytest with isolated data and injected fake AI providers; no real OpenAI request belongs in tests. Verify auth, validation, repositories, aggregation, provider failures, OpenAPI, lint/type checks, and Docker. Do not add registration, Google login, reset, email verification, RBAC, or unapproved entities.
