# Airline AI Agent — Discovery Report

Status: discovery only. No application code exists yet, and no production code was written for this report.

## Current workspace

The workspace contains the project guidance files (`TECHNICAL_SPECIFICATION_V2.md`, `AI_CONTEXT.md`, `PROJECT_PROMPT.md`, `PROMPTS.md`), two agent instruction files, and the frontend/backend skill files. It is not currently a Git repository (`git status` reports “not a git repository”). The specified application directories and runtime files are absent: `apps/web`, `apps/api`, `packages/ui`, `e2e`, `docker`, `.github/workflows`, `docker-compose.yml`, `turbo.json`, `package.json`, and `README.md` do not yet exist.

This report therefore records the approved target design separately from the present filesystem state.

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

The exact session mechanism remains unresolved and must be approved during architecture phase. The specification requires a local-demo-appropriate mechanism that does not expose credentials in browser storage, but it does not choose cookie/session semantics or add a session entity. **Assumption/recommendation for approval:** use an HttpOnly, Secure, explicitly SameSite cookie carrying an opaque or signed session identifier, with server-side validation on protected requests; define expiry, logout invalidation, local `Secure` behavior, CSRF posture, and whether session persistence is in SQLite before implementation. Do not implement until this decision is recorded in `AI_CONTEXT.md`.

## 5. REST resource and route plan

The specification requires documented FastAPI REST resources; exact names and schemas are a pre-implementation deliverable. The following is the proposed route plan, subject to architecture/API approval:

| Area                | Proposed routes                                                                                                        | Purpose                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Authentication      | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`                                               | establish, end, and inspect the admin session                                   |
| Dashboard           | `GET /api/dashboard?range=7d                                                                                           | 30d                                                                             | all` | KPI aggregates and four chart series |
| Agent configuration | `GET /api/agent-config`, `PUT /api/agent-config`                                                                       | retrieve and save the single configuration                                      |
| Airlines            | `GET /api/airlines`                                                                                                    | fixed chat selector data                                                        |
| Intents             | `GET /api/intents`                                                                                                     | seeded fixed-intent selector data                                               |
| Conversations       | `POST /api/conversations`, `GET /api/conversations`, `GET /api/conversations/{id}`                                     | create, paginate/filter table, inspect history and metadata                     |
| Messages            | `POST /api/conversations/{id}/messages`, `GET /api/conversations/{id}/messages` (if needed by approved response shape) | send a user message and return/persist the assistant response; retrieve history |
| Ratings             | `PUT /api/conversations/{id}/rating` (or approved equivalent)                                                          | create/replace the one positive/negative rating                                 |

The chat create request must include selected `airline_id` and the approved fixed-intent assignment. Request validation is Pydantic-backed; errors need one documented safe format; pagination and dashboard filters must be explicit. The exact endpoint names, DTOs, status codes, and rating idempotency semantics remain an architecture-phase approval item.

## 6. Docker Compose and local development

`docker compose up --build` must start a frontend service and a FastAPI backend service. SQLite remains file-based; Compose must mount a persistent volume for the SQLite file and does not need a database container. Secrets are environment variables, with frontend/backend `.env.example` files and real `.env` files excluded from Git. The web service calls the API over the Compose network; OpenAI access occurs only in the API container.

Without Docker, the documented path is `pnpm install` followed by `pnpm dev`, orchestrated through TurboRepo and pnpm scripts. Foundation work must add Dockerfiles, workspace scripts, environment validation, health endpoint, lint/format/type-check/test commands, and CI workflow wiring. AWS deployment is not part of V2; container boundaries and repository isolation preserve future readiness.

## 7. Test and component boundaries

- **pytest:** Python domain/application services, repositories, `PromptBuilder`, authentication, Pydantic validation, FastAPI endpoints, dashboard aggregations, and OpenAI-provider behavior. OpenAI requests are always mocked.
- **Gherkin/Cucumber-JS:** business-readable scenarios in `e2e/features`; TypeScript step definitions in `e2e/steps`; shared setup/world in `e2e/support`. Scenarios cover admin login/dashboard, configuration save, airline plus fixed intent selection, question/response, rating, and conversation inspection.
- **Playwright:** real browser journeys against running Next.js/FastAPI services, including login, configuration, chat, rating, and conversation inspection. It verifies route protection and visible UI states rather than replacing pytest unit coverage.
- **Storybook:** component-level development and review for reusable UI in `packages/ui` and web-shared components. Minimum planned stories: Button, Input, MetricCard, MessageBubble, and ChatWidget.

## 8. Phased implementation plan

1. **Discovery:** this report and repository inspection; stop here.
2. **Architecture/API approval:** decide session/cookie semantics, fixed-intent interaction, dependency direction, DTOs, transactions, errors, and mocking strategy; document decisions.
3. **Technical foundation:** TurboRepo/pnpm, Next.js, FastAPI, SQLAlchemy/SQLite, shared UI, e2e scaffolding, Docker, environment validation, scripts, README, health endpoint.
4. **Authentication/backoffice shell:** seeded admin, secure hashing, approved session, login/logout, protected APIs/routes, validation and pytest coverage.
5. **Agent/chat/persistence/dashboard workflows:** configuration and `PromptBuilder`; seeded airlines/intents; approved chat flow; persisted conversations/messages/tokens/cost; rating; paginated inspection; dashboard KPIs, filters, ECharts, empty states; mocked AI tests.
6. **Quality layer:** Storybook, Gherkin/Cucumber, Playwright, responsive/accessibility review, contract synchronization, full checks.
7. **Documentation/handoff:** update README, context, agents, skills to actual behavior; record limitations and verification; no new functionality.

Each phase stops at its stated deliverable. Later-phase functionality must not be implemented early.

## 9. Risks and explicit limitations

- Session mechanism, cookie flags, expiry/revocation, CSRF strategy, and session persistence are unresolved and can affect schema, middleware, and tests.
- Fixed-intent interaction is explicitly pending: user selector versus an approved application assignment rule. Open-ended or automatic classification is prohibited.
- Exact REST names, DTOs, status codes, pagination contract, and rating update semantics are not yet approved.
- SQLite is suitable for a local demo, not a multi-instance production deployment; AWS infrastructure and managed database migration are future work.
- OpenAI availability, latency, quota, model pricing, and provider failures require safe mapping and mocks; estimated cost is only an application metric.
- Seed data is intentionally minimal, so a new installation has empty conversation/dashboard states.
- No real airline, flight, reservation, payment, or external operational integration exists in V2.
- No RAG/vector store, document upload, Redis, queues, WebSockets, Kubernetes, or social authentication is allowed.
- The current workspace has no implementation, package manifests, Git metadata, or runnable test/Docker configuration, so bootability and test results cannot yet be verified.
- **Assumptions:** the `/api` prefix and route names in section 5, `pnpm-workspace.yaml`, and opaque-cookie recommendation are planning proposals only and require architecture approval before coding.
