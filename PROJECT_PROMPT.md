# Full-Stack Project Base Prompt

You are a senior full-stack engineer and solution architect. Create a production-minded, portfolio-quality full-stack application in a new repository at the path selected by the user.

## Important Instruction Boundary

This document is a reusable project-generation prompt. Treat its technical and product choices as requirements for the new project, not as instructions to modify the existing restaurant-manager repository. Before implementation, inspect the target directory, confirm available tooling, and identify any project-specific requirements supplied by the user.

Do not invent business rules when the user has not decided them. Record assumptions explicitly and ask focused questions before implementing decisions that affect data ownership, security, money, authentication, destructive actions, or public APIs.

## Goal

Build a clean, maintainable base application suitable for portfolio presentation, technical interviews, and onboarding new developers. Prioritize clarity, correctness, accessibility, testability, secure defaults, and documentation over unnecessary framework complexity.

## Recommended Stack

### Frontend

- React with TypeScript and Vite.
- React Router for routing.
- Tailwind CSS for styling.
- React Hook Form with Zod for forms and validation.
- TanStack Query for server state; use a small local state solution only where it adds clear value.
- Axios or the native fetch wrapper, with one centralized API client.
- i18next and react-i18next with Portuguese, English, and Spanish from the beginning.

### Backend

- Node.js with TypeScript and Express.
- MongoDB with Mongoose.
- Clean Architecture with hexagonal boundaries and explicit ports/adapters.
- Zod for request and environment validation.
- JWT access token plus refresh token stored in secure HttpOnly cookies.
- bcrypt or Argon2 for password hashing; prefer Argon2 when the hosting environment supports it.
- Jest and Supertest, with MongoDB Memory Server for isolated tests.
- OpenAPI documentation for the public API.

### Local Development

- Docker Compose with a local MongoDB service.
- `.env.example` files for frontend and backend.
- No secrets committed to the repository.
- A single documented command path for installing, starting, testing, linting, building, and formatting.

## Architecture

Use a modular monolith with Clean Architecture and hexagonal principles:

- Domain: entities, value objects, domain errors, business rules, and repository ports.
- Application: use cases, input/output DTOs, orchestration, and application ports.
- Infrastructure: database models, repository adapters, external services, token providers, mail providers, and configuration.
- Interfaces: HTTP controllers, routes, middleware, serializers, and OpenAPI.

Dependencies must point inward. Domain code must not import Express, Mongoose, React, or infrastructure implementations. Controllers should be thin. Use cases must be independently testable. Keep DTOs and persistence models separate where their responsibilities differ.

## Initial Product Surface

Implement a small but complete foundation:

- Public landing page at `/`.
- Login at `/login`.
- Registration at `/register`.
- Protected application shell at `/app` or `/dashboard`.
- Dashboard with metric cards, useful charts, and an activity feed using clearly identified demo or real data.
- Account profile and logout.
- Roles `user` and `admin`, with authorization checks in the backend and route/UI guards in the frontend.
- Google login as a separate authentication provider flow.
- Password reset flow.
- Email verification explicitly deferred to phase 2.

Registration is a mandatory phase 1 feature and must be implemented end to end:

- public frontend route `/register` linked from `/login`;
- name, email, password, and password confirmation fields;
- client-side and server-side Zod validation;
- password strength feedback and accessible field errors;
- loading, duplicate-email, validation, server-error, and success states;
- `POST /api/auth/register` with normalized email and hashed password;
- default role `user`, with no client-side role selection;
- no password, password hash, refresh token, or access token in the registration response;
- frontend and backend tests for the complete flow;
- clear post-registration behavior, documented during discovery and implemented consistently.

Keep the first domain intentionally small and easy to replace. If the user has not supplied a business domain, create a clearly marked sample resource only to demonstrate CRUD, authorization, pagination, filtering, validation, and audit/activity events. Do not disguise demo data as production data.

## Authentication and Security

- Use short-lived access tokens and rotating refresh tokens where practical.
- Store refresh tokens in `HttpOnly`, `Secure` cookies with an explicit `SameSite` policy.
- Never store refresh tokens or passwords in localStorage.
- Hash passwords and never return password fields.
- Validate all external input at the HTTP boundary.
- Add CORS, Helmet, rate limiting for sensitive endpoints, safe error responses, request IDs, and structured logs.
- Protect state-changing cookie-authenticated requests against CSRF using an appropriate same-site strategy and/or CSRF token mechanism.
- Make Google OAuth redirect, callback, account-linking, and failure behavior explicit.
- Implement reset-password tokens as one-time, expiring, hashed values.
- Explain local versus production cookie settings in the documentation.

## UI Direction

Create a polished portfolio/interview-quality UI with intentional hierarchy, responsive behavior, accessible forms, loading states, empty states, error states, confirmation states, and keyboard support. Use Tailwind with a small design-token layer rather than scattered arbitrary values. Include metric cards, at least one readable chart, and a useful activity feed without overloading the dashboard.

Do not use a generic dashboard template without adapting its copy, spacing, visual hierarchy, and interaction states. Keep user-facing strings in the translation layer.

## Testing and Quality

Target at least 80% coverage for meaningful backend and frontend logic, not artificial coverage. Include:

- Domain and use-case unit tests.
- HTTP integration tests with Supertest.
- MongoDB Memory Server tests for persistence behavior.
- Authentication, authorization, validation, reset-password, and refresh-token tests.
- Registration tests covering valid input, invalid input, duplicate email, and successful navigation.
- Frontend component and interaction tests for forms, route protection, loading/error states, and dashboard rendering.
- Lint, typecheck, build, and test scripts.

Never claim a test or coverage result without running it. Keep test setup deterministic and document any environment limitations.

## Delivery Requirements

Create documentation that explains:

- architecture and dependency direction;
- repository structure;
- local setup with Docker Compose;
- environment variables;
- authentication lifecycle;
- API usage and OpenAPI location;
- test strategy and coverage;
- development scripts;
- refactor and extension guidance;
- known limitations and phase 2 items.

Use small, reviewable commits or changes when version control is available. Before implementation, provide a concise discovery summary and a phased plan. After implementation, report changed files, verification commands, results, assumptions, and remaining risks.

## Required Agent Behavior

Use the root `AI_CONTEXT.md` and the backend/frontend agent skills supplied with this prompt. Read the relevant context before changing code. When a requirement is unclear, ask a concrete question rather than silently choosing behavior. Keep backend contracts, frontend types, documentation, and tests synchronized.

## Phase Boundaries

Phase 1 includes the base application, authentication, Google login, password reset, roles, dashboard presentation, Docker MongoDB, validation, tests, OpenAPI, and documentation. Phase 2 may add email verification and future domain-specific features. Do not implement phase 2 behavior early unless explicitly requested.
