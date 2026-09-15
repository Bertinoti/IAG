# Airline AI Agent V2 — Architecture and API Decision Record

Status: implemented and verified against the current local project.

This record resolves the decisions requested after discovery and is constrained by `TECHNICAL_SPECIFICATION_V2.md`. The user’s request is treated as project-owner approval to record these choices.

## Decision 1: FastAPI Clean Architecture and hexagonal boundaries

**Selected option:** `routes/controllers → application services/use cases → domain objects and ports`, with SQLAlchemy repository adapters and an `AIProvider`/`OpenAIProvider` adapter at the outer boundary.

**Reason:** it keeps airline/conversation rules testable without FastAPI, SQLAlchemy, or OpenAI and matches the specification’s required separation.

**Trade-off:** more files and explicit interfaces than a direct CRUD route; the extra boundary is limited to repositories and the AI provider so it remains explainable.

**Alternative impact:** putting rules in controllers or ORM hooks would be quicker initially but would couple business behavior to HTTP/persistence and make pytest coverage and a future relational database replacement harder.

## Decision 2: Next.js-to-FastAPI communication

**Selected option:** documented JSON REST over HTTP, consumed through one typed API client in `apps/web`; browser credentials are sent with requests as required by the approved cookie session.

**Reason:** REST is the specified integration boundary, is directly documented by FastAPI OpenAPI, and keeps OpenAI exclusively behind the backend.

**Trade-off:** frontend types must stay synchronized with Pydantic schemas and a request adds a network hop; this is preferable to duplicating provider or persistence logic in Next.js.

**Alternative impact:** direct OpenAI calls would expose the backend secret and bypass persistence, validation, and token/cost recording, so they are disallowed.

## Decision 3: Admin session and cookie behavior

**Selected option:** FastAPI/Starlette signed session cookie. It contains only a non-sensitive admin id and expiry, is `HttpOnly`, `SameSite=Lax`, finite `Max-Age`, and `Secure` in production (local HTTP may explicitly disable `Secure`). The signing secret is an API-only environment variable. Login sets it, logout clears it, and protected routes validate signature, expiry, and `admin` role.

**Reason:** it satisfies “no credentials in browser storage” without adding an unapproved session entity or database table. No password, hash, OpenAI key, access token, or refresh token is returned to or stored by the frontend.

**Trade-off:** cookie revocation before expiry is limited without a server-side session store; logout clears the browser cookie, while secret rotation invalidates all signed sessions. SameSite protection assumes same-site deployment.

**Alternative impact:** a server-side opaque-session table would improve revocation but introduce a new persistence entity and lifecycle not approved in V2. JWT access/refresh tokens are also outside the specified stack and would add rotation/CSRF decisions.

## Decision 4: Request and response schemas

All schemas are JSON, versioned through the route contract, and exclude passwords, hashes, secrets, and internal stack traces.

| Resource            | Request schema                                                                 | Response schema                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Auth login          | `{email: string, password: string}`                                            | `{admin: {id, email, role}}`; session is set only in the cookie                                                   |
| Auth logout         | empty body                                                                     | `{success: true}`                                                                                                 |
| Auth session        | none                                                                           | `{authenticated: boolean, admin?: {id, email, role}}`                                                             |
| Agent configuration | `{context, guardrails, content, language: string}`                             | `{id, context, guardrails, content, language, created_at, updated_at}`                                            |
| Airline             | none for create (seeded only)                                                  | `{id, name, code, created_at}`; list returns `{items: Airline[]}`                                                 |
| Intent              | none for create (seeded only)                                                  | `{id, name, created_at}`; list returns `{items: Intent[]}`                                                        |
| Conversation create | `{airline_id: id, intent_id: id}`                                              | `{id, airline, intent, started_at, updated_at, message_count, rating}`                                            |
| Conversation list   | query `{page: positive int, page_size: bounded int, range/filter as approved}` | `{items: ConversationSummary[], page, page_size, total, pages}`                                                   |
| Conversation detail | path `id`                                                                      | `{conversation, messages: Message[], rating}`                                                                     |
| Message send        | `{content: non-empty bounded string}`                                          | `{user_message: Message, assistant_message: Message}`                                                             |
| Message             | none for separate creation                                                     | `{id, conversation_id, role, content, input_tokens?, output_tokens?, total_tokens?, estimated_cost?, created_at}` |
| Rating              | `{rating: "positive"                                                           | "negative"}`                                                                                                      | `{id, conversation_id, rating, created_at}` |
| Dashboard           | query `range: "7d"                                                             | "30d"                                                                                                             | "all"`                                      | `{kpis, conversations_over_time, conversations_by_airline, intent_distribution, feedback_distribution}` |

`kpis` contains total conversations, total messages, average messages per conversation, positive-rating percentage, total tokens, and estimated AI cost. Chart arrays contain labeled aggregate points and return empty arrays plus zero-valued KPIs for a new installation. Exact timestamp serialization and identifier type follow the SQLAlchemy model convention selected during foundation work.

## Decision 5: Fixed-intent flow

**Selected option:** the chat user explicitly selects an intent from the seeded list (`baggage`, `check-in`, `booking`, `cancellation`, `flight-status`) before conversation creation.

**Reason:** the specification requires the intent to come from a fixed list and leaves the interaction open; explicit selection is transparent and avoids unapproved classification behavior.

**Trade-off:** it adds one required user choice and may be less convenient than automatic assignment.

**Alternative impact:** application-assigned intent would require a documented deterministic rule and UI/API behavior approval; open-ended or automatic intent discovery remains prohibited.

## Decision 6: Persistence and transaction boundaries

Use SQLAlchemy 2.x sessions against SQLite. Seed administrator, airlines, and intents in an idempotent startup/management operation. Each HTTP request or command owns one unit of work. Conversation creation is atomic. Message sending persists the user and successful assistant messages plus usage/cost atomically; provider errors do not leave a partial assistant record. Rating writes are atomic and enforce uniqueness at both application and database levels. Dashboard aggregation is read-only.

## Decision 7: Validation and error behavior

Pydantic validates every body, query, and path value. Strings have explicit non-empty and size constraints; enum fields reject unknown roles, message roles, ratings, and intents. FastAPI validation errors are normalized into `{code, message, details?, request_id}`. Use 401/403/404/409/422/502-or-503/500 as documented in `AI_CONTEXT.md`; unexpected responses never expose traces, provider payloads, credentials, or hashes.

## Decision 8: Test boundaries and mocking

pytest owns Python behavior and HTTP/API contracts. Repository tests use isolated SQLite fixtures; OpenAI tests inject a deterministic fake `AIProvider` and cover success, token metadata, timeout/provider failure, and safe mapping. Cucumber-JS owns business-readable scenarios and TypeScript step bindings. Playwright owns end-to-end browser journeys. Storybook owns isolated shared-component states. No automated test performs a real OpenAI request.

## Approval checklist

- [x] FastAPI dependency direction selected.
- [x] Next.js REST communication boundary selected.
- [x] Admin signed-cookie session behavior selected.
- [x] Authentication, domain, dashboard, and error schemas defined.
- [x] User-selected fixed-intent flow confirmed.
- [x] SQLAlchemy transaction/unit-of-work boundaries defined.
- [x] Pydantic validation and safe error envelope defined.
- [x] pytest, Cucumber-JS/Gherkin, Playwright, Storybook, and AI mocking boundaries defined.
- [x] Architecture/API review of exact endpoint paths, identifier/timestamp serialization, and cookie deployment values completed for the local demo.

## Implementation alignment

The implementation includes the approved global `AgentConfiguration` and an additional airline-specific configuration route for the seeded airlines. The airline-specific configuration is a documented extension: it falls back to the global configuration and does not represent multiple agents. The implementation also confirms that users select both airline and fixed intent before creating a conversation.
