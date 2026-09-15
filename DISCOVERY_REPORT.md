# Airline AI Agent — Discovery Report

Status: historical discovery record. The target design in this report was implemented locally; see `README.md`, `AI_CONTEXT.md`, and `TECHNICAL_SPECIFICATION_V2.md` for the current state.

## Current workspace

The workspace now contains the implementation described by this report: `apps/web`, `apps/api`, `packages/ui`, `e2e`, `.github/workflows`, `docker-compose.yml`, `turbo.json`, `package.json`, and the project documentation. This file remains as a record of the original discovery and planning decisions rather than a live implementation status report.

This report therefore records the approved target design and the decisions that preceded implementation.

## 1. TurboRepo structure

The approved pnpm TurboRepo target is:

```text
IAG/
├─ apps/
│  ├─ web/                 Next.js, React, TypeScript, Tailwind, ECharts, Storybook integration
│  └─ api/                 FastAPI/Python, Pydantic, SQLAlchemy 2.x, SQLite
├─ packages/
│  └─ ui/                  shared React UI components and stories
├─ e2e/
│  ├─ features/            Gherkin business scenarios
│  ├─ steps/               Cucumber-JS TypeScript bindings
│  └─ support/             Playwright/browser and test-world support
├─ docker/                 Docker support files
├─ .github/workflows/      CI workflows
├─ docker-compose.yml
├─ turbo.json
├─ package.json
├─ pnpm-workspace.yaml     (required workspace file; implied by pnpm/TurboRepo)
└─ README.md
```

`pnpm-workspace.yaml` is an implementation detail implied by the approved pnpm workspace and is marked as an assumption because it is not named in the specification tree. `packages/ui` must stay framework-light and reusable; product pages belong in `apps/web`. `apps/api` owns all persistence and OpenAI access. `e2e` consumes the running web/API surfaces and should not contain domain logic.

## 2. Frontend and FastAPI module boundaries

The browser talks to Next.js over the public web surface. Next.js owns route rendering, protected-shell UX, forms, loading/empty/error/success states, accessibility, frontend validation, API client/types, and presentation. The frontend must never call OpenAI. Shared visual primitives belong in `packages/ui`; pages and airline product components remain in `apps/web`.

Within `apps/api`, dependencies point inward:

```text
HTTP routes/controllers → application services/use cases → domain + repository/provider ports
                                             ↓
                         SQLAlchemy adapters → SQLite
                         AIProvider adapter → OpenAI API
```

The practical FastAPI modules are routes/controllers, application services, repositories (ports plus SQLAlchemy adapters), database models/session setup, Pydantic request/response schemas, and external provider adapters. Controllers translate HTTP only; business rules live in application services/domain code; `PromptBuilder` is centralized in the agent service path.

## 3. Approved data model and relationships

Approved entities and fields are:

| Entity             | Fields and constraints                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User               | `id`, `email`, `password_hash`, `role` (`admin` in V2), `created_at`, `updated_at`                                                                                       |
| AgentConfiguration | `id`, `context`, `guardrails`, `content`, `language`, timestamps; one active configuration required                                                                      |
| Airline            | `id`, `name`, `code`, `created_at`                                                                                                                                       |
| Intent             | `id`, `name`, `created_at`; seeded fixed list: baggage, check-in, booking, cancellation, flight-status                                                                   |
| Conversation       | `id`, `airline_id`, `intent_id`, `started_at`, `updated_at`                                                                                                              |
| Message            | `id`, `conversation_id`, `role` (`user`/`assistant`), `content`, nullable token fields (`input_tokens`, `output_tokens`, `total_tokens`, `estimated_cost`), `created_at` |
| ConversationRating | `id`, `conversation_id`, `rating` (`positive`/`negative`), `created_at`; at most one per conversation                                                                    |

Relationships: each conversation references one airline and one fixed intent; a conversation has many messages and zero or one rating; the single active agent configuration is loaded when generating a response. Seed data creates one administrator, demonstration airlines, and the fixed intents only—never fake conversations, messages, ratings, usage, or costs. Estimated cost is an application calculation from token usage and documented model-pricing configuration, not provider billing data.

## 4. Login/session approach and approval point

The approved authentication behavior is administrator email/password login and logout, secure password hashing, protected backoffice routes/APIs, backend-only OpenAI credentials, and no secrets or password material returned to the frontend. Public registration, social login, password reset, email verification, multiple roles, and complex RBAC are explicitly out of scope.

The implemented session mechanism is a signed, finite-lived HttpOnly cookie with `SameSite=Lax`; `Secure` is enabled for production deployment and disabled for local HTTP development. Logout clears the cookie. This deliberately avoids browser storage and does not introduce a session table for the local demo.

## 5. REST resource and route plan

The following route plan is the implemented local API surface. DTOs and validation live at the FastAPI boundary; the frontend consumes it through one centralized REST client.

| Area                | Implemented routes                                                                 | Purpose                                                                         |
| ------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Authentication      | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`           | establish, end, and inspect the admin session                                   |
| Dashboard           | `GET /api/dashboard?range=7d                                                       | 30d                                                                             | all` | KPI aggregates and four chart series |
| Agent configuration | `GET /api/agent-config`, `PUT /api/agent-config`                                   | retrieve and save the single configuration                                      |
| Airlines            | `GET /api/airlines`                                                                | fixed chat selector data                                                        |
| Intents             | `GET /api/intents`                                                                 | seeded fixed-intent selector data                                               |
| Conversations       | `POST /api/conversations`, `GET /api/conversations`, `GET /api/conversations/{id}` | create, paginate/filter table, inspect history and metadata                     |
| Messages            | `POST /api/conversations/{id}/messages`, `GET /api/conversations/{id}/messages`    | send a user message and return/persist the assistant response; retrieve history |
| Ratings             | `PUT /api/conversations/{id}/rating`                                               | create/replace the one positive/negative rating                                 |

The chat create request includes the selected `airline_id` and fixed `intent_id`. The user selects both values; the API does not infer or invent intents. Request validation is Pydantic-backed and errors use a safe JSON envelope. The current implementation also exposes `/api/airline-config` for optional per-airline prompt fields with global agent configuration fallback.

## 6. Docker Compose and local development

`docker compose up --build` must start a frontend service and a FastAPI backend service. SQLite remains file-based; Compose must mount a persistent volume for the SQLite file and does not need a database container. Secrets are environment variables, with frontend/backend `.env.example` files and real `.env` files excluded from Git. The web service calls the API over the Compose network; OpenAI access occurs only in the API container.

Without Docker, the documented path is `pnpm install` followed by `pnpm dev`, orchestrated through TurboRepo and pnpm scripts. Dockerfiles, workspace scripts, environment validation, health endpoint, lint/format/type-check/test commands, and CI workflow wiring are implemented. AWS deployment is not part of V2; container boundaries and repository isolation preserve future readiness.

## 7. Test and component boundaries

- **pytest:** Python domain/application services, repositories, `PromptBuilder`, authentication, Pydantic validation, FastAPI endpoints, dashboard aggregations, and OpenAI-provider behavior. OpenAI requests are always mocked.
- **Gherkin/Cucumber-JS:** business-readable scenarios in `e2e/features`; TypeScript step definitions in `e2e/steps`; shared setup/world in `e2e/support`. Scenarios cover admin login/dashboard, configuration save, airline plus fixed intent selection, question/response, rating, and conversation inspection.
- **Playwright:** real browser journeys against running Next.js/FastAPI services, including login, configuration, chat, rating, and conversation inspection. It verifies route protection and visible UI states rather than replacing pytest unit coverage.
- **Storybook:** component-level development and review for reusable UI in `packages/ui` and web-shared components. The current stories cover the shared components used by the demo.

## 8. Phased implementation plan

1. **Discovery:** repository inspection and target design recorded in this report.
2. **Architecture/API approval:** session/cookie semantics, fixed-intent interaction, dependency direction, DTOs, transactions, errors, and mocking strategy documented in `ARCHITECTURE_DECISIONS.md`.
3. **Technical foundation:** TurboRepo/pnpm, Next.js, FastAPI, SQLAlchemy/SQLite, shared UI, e2e scaffolding, Docker, environment validation, scripts, README, health endpoint.
4. **Authentication/backoffice shell:** seeded admin, secure hashing, signed cookie session, login/logout, protected APIs/routes, validation, and pytest coverage.
5. **Agent/chat/persistence/dashboard workflows:** configuration and `PromptBuilder`; seeded airlines/intents; explicit chat selection; persisted conversations/messages/tokens/cost; rating; conversation inspection; dashboard KPIs and charts; mocked AI tests.
6. **Quality layer:** Storybook, Gherkin/Cucumber, Playwright, responsive/accessibility review, contract synchronization, and full checks.
7. **Documentation/handoff:** README, context, agents, skills, specification, and decision records updated to actual behavior.

Each phase stops at its stated deliverable. Later-phase functionality must not be implemented early.

## 9. Risks and explicit limitations

- The signed cookie is appropriate for this local demo; production cross-site deployment would require a fresh CSRF/CORS, key rotation, revocation, and session-storage review.
- Fixed-intent interaction is explicit: the user selects a seeded airline and intent. Open-ended or automatic classification is prohibited.
- The implemented REST surface and DTO behavior are documented in the API code and README; they remain local-demo contracts rather than production airline integration contracts.
- SQLite is suitable for a local demo, not a multi-instance production deployment; AWS infrastructure and managed database migration are future work.
- OpenAI availability, latency, quota, model pricing, and provider failures require safe mapping and mocks; estimated cost is only an application metric.
- Seed data is intentionally minimal, so a new installation has empty conversation/dashboard states.
- No real airline, flight, reservation, payment, or external operational integration exists in V2.
- No RAG/vector store, document upload, Redis, queues, WebSockets, Kubernetes, or social authentication is allowed.
- The current implementation is intentionally a local portfolio demo. It has no real airline operational integration and should not be presented as a production booking or support platform.
- **Historical assumptions resolved:** the `/api` prefix, pnpm workspace, explicit fixed-intent selection, and signed-cookie approach were approved and implemented.
