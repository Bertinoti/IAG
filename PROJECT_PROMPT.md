# Airline AI Agent V2 — Project Prompt

You are maintaining the Airline AI Agent V2 project at `C:\Users\jeffe\Documents\GitHub\IAG`.

## Authority and scope

`TECHNICAL_SPECIFICATION_V2.md` is the only authoritative product and technology specification. Preserve the phased prompt, context, agent, skill, documentation, and acceptance-checklist structure in this repository. Do not import unrelated technology or functionality from Base_Node_React.

The shipped product is a local demo with a public `/chat` page and a protected administrator backoffice (`/login`, `/dashboard`, `/agent`, `/airlines`, `/conversations`, and conversation detail). It includes one seeded administrator, signed HttpOnly cookie sessions, fixed seeded airlines and intents, editable agent prompts, centralized `PromptBuilder`, backend-only `AIProvider`/`OpenAIProvider`, persisted conversations/messages/token usage/estimated cost, one rating per conversation, dashboard aggregates, and Storybook/pytest/Gherkin/Cucumber/Playwright verification.

## Approved technology

Use only TurboRepo, pnpm, Next.js, React, TypeScript, Tailwind CSS, Apache ECharts, Storybook, FastAPI, Python, Pydantic, SQLAlchemy 2.x, SQLite, the OpenAI API behind the provider interface, pytest, Gherkin/Cucumber-JS, Playwright, Docker, Docker Compose, and GitHub Actions.

Keep dependencies directed inward in the FastAPI application: routes translate HTTP, services own application rules, repository/provider ports isolate infrastructure adapters, and SQLAlchemy/OpenAI remain at the boundary. The frontend communicates with FastAPI through the centralized JSON REST client and never calls OpenAI directly.

## Explicit exclusions

Do not add public registration or `/register`, Google Login, password recovery, email verification, multiple roles or RBAC, MongoDB, Mongoose, Express, Vite as the frontend application framework, Redis, queues, WebSockets, RAG, vector databases, Kubernetes, real AWS infrastructure, or unrelated Base_Node_React features. Storybook's internal Vite builder is allowed because Storybook is approved; do not create a Vite application.

## Working rules

- Inspect `AI_CONTEXT.md`, the relevant agent instructions, skills, API modules, and tests before editing.
- Keep Pydantic request validation, safe error envelopes, atomic persistence, and backend authorization intact.
- Keep OpenAI calls behind `AIProvider`; inject deterministic fakes in automated tests.
- Keep frontend API types synchronized with FastAPI responses and use semantic, keyboard-accessible, responsive controls.
- Do not claim a verification result without running the command. Document environment-only limitations precisely.
- Stop at the phase boundary requested by the active implementation prompt.

Use the final acceptance criteria in `TECHNICAL_SPECIFICATION_V2.md` as the release checklist.
