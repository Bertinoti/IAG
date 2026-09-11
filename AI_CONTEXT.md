# AI Context

## Purpose

This repository is the Airline AI Agent V2 local demo: a small, explainable full-stack application for configuring and using an airline question-answering agent.

## Decision Record

The entries below describe the reusable Base_Node_React reference and are not implementation decisions for Airline AI Agent V2. The V2 decisions in the next section supersede any conflicting technology, product, and authentication choices.

- Repository: new repository under `C:\Users\jeffe\Documents\GitHub\Base_Node_React`.
- Architecture: Clean Architecture with hexagonal boundaries.
- Frontend: React, TypeScript, Vite, React Router, Tailwind CSS, React Hook Form, Zod, i18next.
- Backend: Node.js, TypeScript, Express, MongoDB, Mongoose, Zod, JWT.
- Authentication: access token plus refresh token in HttpOnly cookies.
- Providers: password authentication and Google login.
- Roles in phase 1: `user`, `admin`.
- Password reset: phase 1.
- Email verification: phase 2.
- Registration: phase 1, with a public `/register` page and `POST /api/auth/register`.
- Local database: Docker Compose MongoDB.
- Test database: MongoDB Memory Server.
- Coverage target: 80% for meaningful code paths.
- Languages: Portuguese, English, Spanish.
- UI: polished portfolio/interview quality with cards, charts, and activity feed.

### Airline AI Agent V2 approved architecture decisions

- **FastAPI dependency direction:** HTTP routes/controllers depend on application services; application services depend on framework-independent domain types and repository/provider ports; SQLAlchemy and OpenAI adapters implement those ports. Database models, Pydantic HTTP schemas, and provider SDK details stay at the boundary. Dependencies point inward and controllers perform HTTP translation only.
- **Web/API communication:** `apps/web` communicates with `apps/api` through documented JSON REST endpoints over HTTP. A single typed frontend API client owns base URL, credentials, response normalization, and safe error mapping. The browser never calls OpenAI and Next.js does not import Python code.
- **Admin session:** use a signed session cookie managed by FastAPI/Starlette middleware. The cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in production (configurable for local HTTP), has an explicit finite `Max-Age`, and contains only a non-sensitive admin identifier and expiry data. The signing secret is backend-only and supplied through an environment variable. Login sets the cookie; logout clears it; protected requests validate signature, expiry, and the admin role. No access/refresh token or credential is placed in localStorage, sessionStorage, or response JSON. CSRF protection is provided by SameSite=Lax plus same-origin state-changing requests; if deployment becomes cross-site, an explicit CSRF token mechanism must be approved before changing cookie policy.
- **Fixed intent interaction:** the user selects one intent from the seeded fixed list before creating a conversation. The API validates that the selected intent exists; it does not infer, discover, or classify open-ended intents.
- **Persistence/transactions:** one SQLAlchemy session/unit of work is used per request or application command. Conversation creation commits the selected airline and intent together. Sending a message commits the user message and assistant message with token metrics as one successful workflow; provider failure rolls back the unfinished command and returns a safe error. Rating creation/update is one transaction guarded by the one-rating-per-conversation constraint. Dashboard reads use read-only sessions and aggregate in SQL where practical.
- **Errors/validation:** all request bodies, query parameters, and path identifiers are validated at the FastAPI boundary with Pydantic. Errors use one JSON envelope (`code`, `message`, optional field-level `details`, and request correlation id); validation maps to HTTP 422, unauthenticated to 401, forbidden to 403, missing resources to 404, conflicts (including duplicate rating) to 409, provider failures to a safe 502/503, and unexpected failures to 500 without stack traces or secrets.
- **Testing/mocking:** pytest covers domain/application services, repository adapters, PromptBuilder, auth/session behavior, Pydantic validation, FastAPI routes, dashboard aggregates, and provider error mapping. The OpenAI provider is injected behind `AIProvider` and replaced by deterministic mocks/fakes in all automated tests. Cucumber-JS binds business-readable Gherkin scenarios; Playwright exercises real browser journeys against local services; Storybook isolates shared UI components.

## Working Rules

- Inspect the existing code before editing.
- Preserve working behavior unless the task explicitly changes it.
- Do not invent business rules, permissions, token lifecycle details, or destructive behavior.
- Keep the domain independent from frameworks and persistence.
- Keep API contracts versionable and reflected in frontend types.
- Keep the V2 scope limited to the seeded administrator and approved product workflows. Public registration, social login, password recovery, email verification, and complex RBAC are out of scope.
- Use explicit loading, empty, error, success, and confirmation states.
- Keep translation keys in locale files; do not scatter user-facing strings in components.
- Never expose secrets, password hashes, refresh tokens, or sensitive provider payloads.
- Do not claim verification without running the relevant command.

## Implementation Sequence

1. Confirm requirements, assumptions, and phase boundaries.
2. Define domain language, module boundaries, and API contracts.
3. Implement environment/configuration validation.
4. Implement domain and application use cases.
5. Add infrastructure adapters and persistence.
6. Add HTTP interfaces and OpenAPI.
7. Add frontend API types, auth lifecycle, routes, and UI states.
8. Add tests, documentation, Docker verification, and refactor pass.

## High-Risk Areas

- Signed cookie expiry, secret rotation, cookie attributes, and cross-site CSRF/CORS.
- Error serialization without leaking hashes, secrets, provider payloads, or traces.
- Keeping frontend route checks consistent with backend session enforcement.
- Atomic message persistence and one-rating-per-conversation behavior.
- Keeping API schemas, frontend types, OpenAPI, and seeded fixed-intent behavior synchronized.

## Open Decisions To Resolve Before Domain Work

- None for the V2 implementation scope. The product domain, authentication scope, chart library, and deployment limitations are defined by `TECHNICAL_SPECIFICATION_V2.md`.
- **Future approval trigger:** a cross-site production deployment would require revisiting cookie/CSRF and CORS settings; AWS deployment itself is outside V2.

Keep providers behind interfaces and record any future deployment or product decision before implementation.
