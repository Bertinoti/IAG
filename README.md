# Airline AI Agent

Technical foundation for the local Airline AI Agent demo. The repository uses pnpm and TurboRepo with a Next.js web app, a FastAPI API, shared React UI, and an e2e test workspace.

## Local development

Copy the relevant `.env.example` files to `.env`, install pnpm dependencies, and run:

```bash
pnpm install
pnpm dev
```

The web app is served on port 3000 and the API health endpoint is available at `http://localhost:8000/health`.

## Docker

```bash
docker compose up --build
```

The API stores SQLite data in the `sqlite-data` persistent volume. Administrator authentication is implemented with a seeded account and signed HttpOnly cookie sessions. Dashboard, chat, OpenAI, and other product workflows remain deferred to later approved phases.

The default local administrator is `admin@example.com` / `ChangeMe123!`; override `ADMIN_EMAIL` and `ADMIN_PASSWORD` through environment variables for local use.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Python tests run from `apps/api` after installing `requirements.txt` with `pytest`.
