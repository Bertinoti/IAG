---
name: base-backend-development
description: Build and review TypeScript Express backends using Clean Architecture, hexagonal boundaries, MongoDB, secure cookie authentication, and tested API contracts.
---

# Base Backend Development

Use this skill for backend features, refactors, API reviews, authentication, persistence, integrations, and tests in this project base.

## Start Here

Read:

- `AI_CONTEXT.md`
- `PROJECT_PROMPT.md`
- `agents/backend-agent.md`
- the relevant source module, tests, environment schema, and OpenAPI document

## Practical Rules

- Prefer extending an existing use case, port, or adapter over creating a parallel architecture.
- Keep domain rules framework-free and repositories expressed as ports.
- Validate environment variables at startup and request data at the HTTP boundary.
- Add ownership filters to every user-scoped query and test wrong-owner access.
- Keep authentication state transitions explicit: login, refresh, rotation, logout, revoke, and reset.
- Implement registration as a tested use case with normalized email, hashed password, safe response, duplicate-email handling, and a server-assigned default `user` role.
- Use typed error categories with centralized HTTP mapping.
- Add indexes for fields used in ownership, lookup, expiry, and uniqueness constraints.
- Keep migrations or data-shape changes documented even when MongoDB is schemaless.
- Treat external providers as unreliable: define timeouts, error mapping, and retry boundaries.

## Required Verification

For a meaningful backend change, run the smallest relevant set of:

- unit tests for domain/use cases;
- integration tests for HTTP and persistence;
- authentication and authorization tests;
- typecheck, lint, build, and coverage.

Report commands that were not run and why. Never replace a failing test with a weaker assertion merely to obtain green output.

## References

- For auth and security work, read the authentication sections of `PROJECT_PROMPT.md` and `AI_CONTEXT.md`.
- For a new domain module, first define its terms, ownership, lifecycle, and API contract.
