# Airline AI Agent V2 — AI Context

## Repository and purpose

Repository: `C:\Users\jeffe\Documents\GitHub\IAG`.

This is a small, explainable local demo for configuring and using an AI agent that answers airline questions. The public surface is `/chat`; the administrator backoffice contains `/login`, `/dashboard`, `/agent`, `/airlines`, `/conversations`, and conversation detail.

## Approved stack and boundaries

Use TurboRepo/pnpm, Next.js/React/TypeScript, Tailwind CSS, Apache ECharts, Storybook, FastAPI/Python, Pydantic, SQLAlchemy 2.x, SQLite, OpenAI behind `AIProvider`/`OpenAIProvider`, pytest, Gherkin/Cucumber-JS, Playwright, Docker Compose, and GitHub Actions. Next.js calls FastAPI through the centralized REST client. The browser never calls OpenAI or stores credentials.

FastAPI routes translate HTTP and call application services. Services depend on repository/provider boundaries; SQLAlchemy and OpenAI adapters implement those boundaries. SQLite persists the approved User, AgentConfiguration, Airline, Intent, Conversation, Message, and ConversationRating entities. Message writes are atomic and ratings are unique per conversation.

## Shipped decisions

- One seeded administrator uses a signed, finite-lived HttpOnly, SameSite=Lax cookie. The signing secret is backend-only; production can enable Secure. Logout clears the cookie. No credentials or tokens are stored in browser storage.
- The user selects a seeded airline and one fixed intent before a conversation starts. The API never infers airlines or invents open-ended intents.
- `PromptBuilder` composes agent fields, airline, intent, conversation history, and the latest user message. Only the backend provider boundary can call OpenAI; automated tests inject fakes.
- Dashboard KPIs and charts are derived from persisted data. Estimated cost is calculated from stored token usage and configured prices; it is not provider billing data.
- Pydantic validates request boundaries and errors use safe JSON envelopes without traces, secrets, hashes, or provider payloads.

## Testing and local operations

pytest covers Python services, repositories, validation, auth, aggregation, and provider behavior. Gherkin/Cucumber-JS binds business scenarios. Playwright exercises browser journeys; its web server can start Next.js automatically and tests mock API responses. Storybook reviews reusable UI states.

Use `pnpm install`, `pnpm dev`, `pnpm format`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`. Run API tests with `cd apps/api; python -m pytest -q`. Docker uses `docker compose up --build` with a persistent SQLite volume. Never commit real `.env` files.

## Explicit exclusions and limitations

V2 does not include public registration or `/register`, Google/social login, password recovery, email verification, multiple roles/RBAC, real airline/reservation/payment integrations, MongoDB/Mongoose/Express, Vite as an application framework, Redis, queues, WebSockets, RAG, vector databases, Kubernetes, or real AWS infrastructure. SQLite and signed cookies are suitable for this local demo; cross-site production deployment would require a new CSRF/CORS review. These exclusions are implementation rules, not deferred requirements.

Future AWS deployment, managed relational storage, additional roles, and operational airline integrations require a new approved version.
