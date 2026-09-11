---
name: airline-backend-development
description: Build and review Airline AI Agent FastAPI/Python, Pydantic, SQLAlchemy 2.x, SQLite, auth cookies, providers, and pytest.
---

# Airline Backend Development

Read `AI_CONTEXT.md`, `PROJECT_PROMPT.md`, the backend agent instructions, relevant API modules, tests, and environment files first. Keep application rules independent from FastAPI, SQLAlchemy, and OpenAI; controllers translate HTTP, ports precede adapters, and Pydantic validates every boundary value.

Preserve signed HttpOnly admin-cookie lifecycle, safe errors, parameterized ORM queries, atomic message writes, and one-rating-per-conversation. All AI calls cross `AIProvider`; inject deterministic fakes in automated tests. Verify pytest auth/validation/repository/aggregation behavior, OpenAPI, formatting/lint/type checks, and Docker. Report skipped browser/BDD/Storybook checks and warnings honestly. Do not introduce unapproved entities or auth/product features.
