# Airline AI Agent — Implementation Prompts

This file defines the sequential prompts for implementing the project described in `TECHNICAL_SPECIFICATION_V2.md`.

Run one prompt at a time. Review the deliverable and verification results before continuing. The coding agent must stop at the end of each phase unless the prompt explicitly permits continuation.

## Project workspace

```powershell
Set-Location 'C:\Users\jeffe\Documents\GitHub\IAG'
```

Before starting, read completely:

- `TECHNICAL_SPECIFICATION_V2.md`
- `AI_CONTEXT.md`
- `agents/backend-agent.md`
- `agents/frontend-agent.md`
- `skills/backend-development/SKILL.md`
- `skills/frontend-development/SKILL.md`

The structure of these prompts, agents, context, skills, review points, and acceptance checklist was adapted from `Base_Node_React`. Its technology choices and unrelated product features must not be imported.

## Non-negotiable implementation rules

- Use only the approved stack: Next.js, React, TypeScript, Tailwind CSS, Apache ECharts, Storybook, FastAPI, Python, Pydantic, SQLAlchemy 2.x, SQLite, OpenAI API, pytest, Gherkin, Cucumber-JS, Playwright, TurboRepo, pnpm, Docker, Docker Compose, and GitHub Actions.
- Do not introduce Vite, React Router, Express, Node.js backend services, MongoDB, Mongoose, Google Login, password reset, public registration, Redis, queues, WebSockets, RAG, vector databases, Kubernetes, or real AWS infrastructure.
- Preserve the monorepo and agent-documentation structure in the technical specification.
- Do not invent business rules, entities, fields, endpoints, permissions, or UI flows. Ask before making a decision that changes the approved scope.
- Keep OpenAI calls behind an internal `AIProvider`/`OpenAIProvider` boundary. The frontend must never call OpenAI directly.
- Use mocked AI responses in automated tests.
- Keep secrets in environment variables and never commit real credentials.
- Explain important FastAPI, Python, testing, and architecture decisions in the documentation so they are understandable to a developer learning these tools.

## Prompt 01 — Discovery

```text
You are the lead engineer for the Airline AI Agent project.

Read TECHNICAL_SPECIFICATION_V2.md, AI_CONTEXT.md, the frontend and backend agent instructions, and both skills completely before doing anything else.

Do not write application code.

Inspect the IAG workspace and produce a discovery report covering:

1. the TurboRepo structure for apps/web, apps/api, packages/ui, and e2e;
2. frontend and FastAPI module boundaries;
3. the approved data model and relationships;
4. the login/session approach, identifying any decision that still requires approval;
5. the REST resource and route plan;
6. the Docker Compose and local development plan;
7. pytest, Gherkin/Cucumber, Playwright, and Storybook boundaries;
8. the phased implementation plan;
9. risks and explicit limitations.

Use only the technologies and functionality in TECHNICAL_SPECIFICATION_V2.md. Mark assumptions clearly. Stop after the report.
```

Expected result: a written discovery report with no production code.

## Prompt 02 — Architecture and API approval

```text
Review the discovery report against TECHNICAL_SPECIFICATION_V2.md and AI_CONTEXT.md.

Resolve only decisions required before implementation. For each decision explain the selected option, reason, trade-off, and impact of alternatives.

Define and document:

- Clean Architecture/hexagonal dependency direction within FastAPI;
- Next.js-to-FastAPI communication;
- session and cookie behavior for the admin login;
- request and response schemas for authentication, agent configuration, airlines, intents, conversations, messages, ratings, and dashboard aggregates;
- the fixed-intent interaction, explicitly confirming whether the user selects an intent or the application assigns one;
- persistence and transaction boundaries;
- error format and validation behavior;
- test boundaries and mocking strategy.

Do not implement code. Update only the decision documentation if approved by the project owner, then stop with an approval checklist.
```

Expected result: an approved architecture and API contract.

## Prompt 03 — Technical foundation

```text
Implement only the approved technical foundation.

Create:

- the TurboRepo and pnpm workspace;
- apps/web with Next.js, React, TypeScript strict mode, and Tailwind CSS;
- apps/api with FastAPI, Python typing, Pydantic, SQLAlchemy 2.x, and SQLite;
- packages/ui for reusable React components;
- the e2e Gherkin/Cucumber/Playwright structure;
- the Dockerfiles and docker-compose.yml for web and API, with a persistent SQLite volume;
- environment validation and .env.example files;
- linting, formatting, type checks, and test scripts;
- the initial README and health endpoint.

Do not implement login, dashboard, chat, OpenAI behavior, or product workflows yet.

Run and report the relevant install, lint, typecheck, build, unit-test, and Docker verification commands. Stop after the foundation is bootable.
```

Expected result: a bootable Next.js/FastAPI/SQLite monorepo.

## Prompt 04 — Authentication and backoffice shell

```text
Implement the approved administrator email/password login and logout flow.

Include:

- the seeded administrator account;
- secure password hashing;
- backend-protected administrative routes;
- the Next.js /login page;
- session handling using the approved architecture decision;
- frontend route protection as a UX helper;
- safe validation, loading, error, and logout states;
- OpenAPI documentation and pytest coverage.

Do not add public registration, Google Login, password recovery, email verification, multiple roles, or RBAC.

Verify unauthenticated access, valid login, invalid credentials, session expiry behavior, logout, and protected API access. Stop and report results.
```

Expected result: a working protected admin shell with no unrelated authentication features.

## Prompt 05 — Agent, chat, persistence, and dashboard

```text
Implement the approved product workflows.

Agent configuration:

- build /agent with Context, Guardrails, Content, and Language fields;
- persist and retrieve the single active AgentConfiguration;
- centralize prompt composition in PromptBuilder.

Airline and intent data:

- add seeded airlines and the fixed intent list;
- implement the approved airline selection flow;
- implement the approved fixed-intent assignment flow;
- do not infer airlines or invent open-ended intents.

Chat:

- build /chat with the approved selection controls, messages, input, send action, loading, empty, and error states;
- create conversations and persist user and assistant messages;
- call OpenAI only through AIProvider/OpenAIProvider;
- persist token usage and calculated estimated cost;
- keep API keys on the backend.

Ratings and conversations:

- allow one positive or negative rating per conversation;
- implement paginated /conversations;
- implement /conversations/:id with message history and metadata.

Dashboard:

- implement /dashboard with the approved KPIs, date filters, ECharts charts, and empty states;
- derive all values from persisted data.

Add pytest tests and API contract updates. Mock OpenAI in all automated tests. Stop after the full local workflow works.
```

Expected result: login → configuration → airline/intent selection → chat → persistence → rating → dashboard inspection.

## Prompt 06 — UI components, BDD, E2E, and quality

```text
Complete the approved quality and verification layer.

Create Storybook stories for the useful shared components, at minimum Button, Input, MetricCard, MessageBubble, and ChatWidget.

Create Gherkin features and Cucumber-JS step definitions for:

- administrator login and dashboard access;
- saving agent configuration;
- selecting an airline and approved fixed intent flow;
- sending a question and receiving a response;
- rating a conversation;
- inspecting a persisted conversation.

Use Playwright for the corresponding real-browser journeys.

Review and test:

- FastAPI validation and error handling;
- authentication protection;
- repository and aggregation behavior;
- mocked AI provider behavior;
- responsive and keyboard-accessible UI;
- loading, empty, success, and error states;
- API types and OpenAPI synchronization;
- Docker startup.

Run lint, formatting checks, TypeScript checks, Python checks, pytest, Cucumber, Playwright, Storybook checks, production builds, and Docker verification. Fix real defects and report skipped checks honestly.
```

Expected result: a tested and reviewable implementation with transparent verification results.

## Prompt 07 — Documentation and handoff

```text
Prepare the project for a developer who is learning the backend and testing technologies.

Update README.md, AI_CONTEXT.md, the frontend/backend agent files, and both skills so they describe the actual shipped Airline AI Agent behavior.

Document:

- project purpose and scope;
- why Next.js/React and FastAPI/Python are separated;
- repository structure and dependency direction;
- SQLAlchemy and SQLite responsibilities;
- authentication lifecycle;
- PromptBuilder and AIProvider responsibilities;
- airline and fixed-intent behavior;
- dashboard calculations and token/cost meaning;
- Docker and local commands;
- environment variables;
- pytest, Gherkin/Cucumber, Playwright, and Storybook roles;
- AWS readiness and limitations;
- known decisions deferred to a later version.

Do not add new functionality during documentation work.

Finish with changed files, verification commands and results, assumptions, known limitations, and recommended next steps. Stop.
```

Expected result: a self-contained, explainable project handoff.

## Final acceptance checklist

### Scope and architecture

- [ ] The implementation runs from `C:\Users\jeffe\Documents\GitHub\IAG`.
- [ ] The project uses Next.js/React/TypeScript and FastAPI/Python.
- [ ] SQLite is accessed through SQLAlchemy 2.x.
- [ ] The frontend never calls OpenAI directly.
- [ ] The project contains the adapted prompts, context, agents, skills, and documentation.
- [ ] No inherited MongoDB, Express, Vite, Google Login, registration, password-reset, or unrelated features remain.

### Product behavior

- [ ] Seeded admin login works.
- [ ] Administrative routes are protected.
- [ ] Agent Context, Guardrails, Content, and Language can be saved.
- [ ] Airline selection is required and persisted.
- [ ] The approved fixed-intent flow is implemented.
- [ ] Conversations and messages are persisted.
- [ ] Token usage and estimated cost are stored clearly as application metrics.
- [ ] One positive or negative rating can be stored per conversation.
- [ ] Dashboard KPIs and ECharts charts use persisted data and show empty states.
- [ ] Conversations can be paginated and inspected.

### Verification

- [ ] pytest passes with OpenAI mocked.
- [ ] Gherkin/Cucumber scenarios pass.
- [ ] Playwright journeys pass.
- [ ] Storybook stories are available for the shared components.
- [ ] TypeScript, Python checks, lint, builds, and Docker startup pass.
- [ ] No command or verification result is claimed without actually running it.

## Handoff rule

The project may proceed to the next phase only after the current phase deliverable has been reviewed. Unchecked items must be fixed or documented as known limitations before the project is considered complete.
