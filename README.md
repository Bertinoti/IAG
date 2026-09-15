# Airline AI Agent

Local portfolio demo for an airline question-answering agent. The shipped stack is a pnpm/TurboRepo monorepo with Next.js/React web, FastAPI/Python API, SQLAlchemy 2.x, SQLite, shared UI, Gherkin/Cucumber, Playwright, and Storybook.

Next.js owns browser routes, accessible UI state, and one REST client. FastAPI owns validation, authentication, transactions, persistence, prompt construction, and the AI provider boundary. This separation keeps Python/SQLAlchemy concerns out of the browser and keeps OpenAI credentials backend-only.

## Structure and data

- `apps/web`: `/login`, `/dashboard`, `/agent`, and `/chat`.
- `apps/api/app`: configuration, auth, SQLAlchemy models/database, routes, `PromptBuilder`, and `AIProvider`.
- `packages/ui`: reusable React components and stories.
- `e2e`: Gherkin features, Cucumber bindings, and Playwright tests.

FastAPI routes depend on application/provider boundaries; SQLAlchemy and AI adapters are at the outside. SQLite stores the approved User, AgentConfiguration, Airline, Intent, Conversation, Message, and ConversationRating entities.

## Run locally

Requirements: Node.js 22 or later and npm. Verify them in PowerShell:

```powershell
node --version
npm --version
```

Install the pinned pnpm version globally and verify it:

```powershell
npm install --global pnpm@9.15.0
pnpm --version
```

If `pnpm` is still not recognized, close and reopen PowerShell so the updated PATH is loaded. As an alternative, activate pnpm through Corepack:

```powershell
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm --version
```

Copy the relevant `.env.example` files to `.env` and verify the templates before installing dependencies:

```powershell
Test-Path .env.example
Test-Path apps/api/.env.example
Test-Path apps/web/.env.example
pnpm install
```

Start the development services with `pnpm dev`. Web is on port 3000 and API on port 8000. The default seeded admin is `admin@example.com` / `ChangeMe123!`; override it through environment variables.

## Docker

Copy `apps/api/.env.example` to `apps/api/.env`, set a strong `SESSION_SECRET`, and provide `OPENAI_API_KEY` for real responses. Then `docker compose up --build` starts web and API and persists SQLite in the `sqlite-data` volume.

Variables include `NEXT_PUBLIC_API_URL`, `API_HOST`, `API_PORT`, `DATABASE_URL`, `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE`, `COOKIE_SECURE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `OPENAI_API_KEY`. Real `.env` files are ignored.

## Behavior and testing

Login sets a signed HttpOnly, SameSite=Lax cookie containing an admin id and expiry; logout clears it and protected routes validate it. `/agent` persists the global Context, Guardrails, Content, and Language. `/airlines` stores the same prompt fields per airline, with the global configuration as fallback. `/chat` requires a seeded airline and fixed intent, persists messages and token/cost metrics, and supports one rating. `PromptBuilder` centralizes prompts; `AIProvider` is the only AI boundary. Estimated cost is an application metric, not provider billing.

`pnpm test` runs the real Cucumber-JS business scenarios. API pytest is intentionally run separately because it is Python rather than a TurboRepo package:

```powershell
cd C:\Users\jeffe\Documents\GitHub\IAG\apps\api
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pytest -q
```

Run the other verification suites explicitly with `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm --filter @airline-ai/ui build-storybook`, and `pnpm --filter @airline-ai/e2e playwright`. Playwright starts the Next.js dev server automatically; its frontend journeys mock API responses and never call OpenAI. Automated AI tests inject a fake provider.

Verified: Docker image build/start, API health, web production build, web typecheck/lint, pytest (8 passed), Cucumber (4 scenarios, 13 steps passed), Playwright (2 passed), and Storybook build. Automated chat tests mock the AI provider.

Pull requests are checked by `.github/workflows/ci.yml`, which runs API compilation and pytest, workspace lint/typecheck/build, Cucumber, Storybook, Docker Compose validation/image builds, and Playwright browser journeys against the Docker services.

Generated Storybook, Playwright, and build artifacts are excluded through `.prettierignore`.

AWS deployment, real airline integrations, RAG, queues, WebSockets, public registration, social login, password recovery, and email verification are outside V2. The local cookie has no server-side revocation store; cross-site deployment needs a new CSRF/CORS review.
