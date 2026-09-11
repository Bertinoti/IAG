# Airline AI Agent — Technical Specification V2

**Status:** Draft for approval  
**Version:** 2.0  
**Purpose:** Technical specification for a local demo and portfolio project

**Implementation target:** `C:\Users\jeffe\Documents\GitHub\IAG`

## 1. Objective

Build a full-stack application for configuring and using an AI agent that answers questions about airline companies.

The application must demonstrate the technologies required by the job description while remaining small, understandable, locally executable, testable, and prepared for future AWS deployment.

The project will reuse the organizational model of the existing `Base_Node_React` project: phased prompts, a project context file, separate frontend/backend agent instructions, skills, explicit approval points, and a final acceptance checklist. Its technology choices and product functionality will be specific to this airline project. `Base_Node_React` is reference material only; implementation will take place in the `IAG` directory.

## 2. Scope

The system has two areas:

1. **Protected backoffice** for the administrator.
2. **Public chat page** for asking questions to the airline AI agent.

### Backoffice routes

- `/login`
- `/dashboard`
- `/conversations`
- `/conversations/:id`
- `/agent`

### Public route

- `/chat`

## 3. Confirmed business decisions

### Airline selection

The user selects an airline from a fixed list in the chat interface. The selected airline is stored on the conversation.

The AI must not infer the airline automatically in V2.

### Intent classification

Intents are defined in a fixed, seeded list. The initial list is:

- baggage;
- check-in;
- booking;
- cancellation;
- flight-status.

The intent associated with a conversation must come from this fixed list. V2 does not yet prescribe whether it is selected by the user or assigned by the application; that interaction decision must be approved before the chat flow is implemented. Automatic open-ended intent discovery is outside this version.

### Conversation rating

Each conversation may receive one rating:

- positive (`👍`);
- negative (`👎`).

### Initial data

The seed process creates:

- one administrator account;
- a fixed list of demonstration airlines;
- the fixed intent list above.

It must not create fake conversations, messages, ratings, token usage, or costs.

## 4. Out of scope

The following are not part of V2:

- public user registration;
- multiple agents;
- complex roles or RBAC;
- Google or social login;
- password recovery;
- email verification;
- real airline integrations;
- real flight information;
- reservations or payments;
- RAG or vector databases;
- document upload;
- Redis, queues, WebSockets, or Kubernetes;
- real AWS infrastructure or deployment;
- automatic airline identification;
- open-ended intent classification.

## 5. Technology stack

| Area | Technology |
|---|---|
| Repository structure | TurboRepo monorepo |
| Package manager | pnpm |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Charts | Apache ECharts |
| Component development | Storybook |
| Backend | FastAPI |
| Backend language | Python |
| Validation | Pydantic |
| ORM | SQLAlchemy 2.x |
| Database | SQLite |
| AI provider | OpenAI API behind an internal provider interface |
| Backend tests | pytest |
| BDD | Gherkin and Cucumber-JS |
| Browser tests | Playwright |
| Containers | Docker and Docker Compose |
| CI | GitHub Actions |
| Future cloud target | AWS-ready, with no AWS deployment in V2 |

No technology from the `Base_Node_React` stack may be introduced unless explicitly added to this specification.

## 6. Architecture

```text
Browser
  ↓
Next.js / React / TypeScript
  ↓ HTTP REST
FastAPI / Python
  ├── Application services
  ├── Repository ports and SQLAlchemy adapters
  │       ↓
  │     SQLite
  └── Agent service
          ├── Prompt builder
          └── AI provider adapter
                  ↓
               OpenAI API
```

The frontend must never call OpenAI directly.

The backend should keep responsibilities separated into routes/controllers, application services, repositories, database models, schemas, and external provider adapters. The code should remain easy to explain and should avoid abstractions that do not support a stated requirement.

## 7. Repository and agent structure

The project must preserve the following non-technology structure from the existing base project:

```text
airline-ai-agent/
├── PROMPTS.md
├── PROJECT_PROMPT.md
├── AI_CONTEXT.md
├── agents/
│   ├── frontend-agent.md
│   └── backend-agent.md
├── skills/
│   ├── frontend-development/SKILL.md
│   └── backend-development/SKILL.md
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── ui/
├── e2e/
│   ├── features/
│   ├── steps/
│   └── support/
├── docker/
├── .github/workflows/
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

`PROMPTS.md` must define sequential phases with a stopping point and expected deliverable for each phase. `AI_CONTEXT.md` must record approved decisions, scope boundaries, architecture rules, and unresolved limitations. The frontend and backend agent files must contain project-specific instructions and must not retain instructions for Vite, Express, MongoDB, Google Login, or unrelated features.

## 8. Data model

### User

- `id`
- `email`
- `password_hash`
- `role` (`admin` in V2)
- `created_at`
- `updated_at`

### AgentConfiguration

- `id`
- `context`
- `guardrails`
- `content`
- `language`
- `created_at`
- `updated_at`

Only one active agent configuration is required in V2.

### Airline

- `id`
- `name`
- `code`
- `created_at`

### Intent

- `id`
- `name`
- `created_at`

### Conversation

- `id`
- `airline_id`
- `intent_id`
- `started_at`
- `updated_at`

### Message

- `id`
- `conversation_id`
- `role` (`user` or `assistant`)
- `content`
- `input_tokens` (nullable)
- `output_tokens` (nullable)
- `total_tokens` (nullable)
- `estimated_cost` (nullable)
- `created_at`

### ConversationRating

- `id`
- `conversation_id`
- `rating` (`positive` or `negative`)
- `created_at`

There must be at most one rating per conversation.

The estimated cost is calculated by the application from token usage and a documented model-pricing configuration. It must not be presented as provider billing data.

## 9. Authentication

The backoffice uses email and password authentication.

Required behavior:

- seed one administrator account;
- store only a secure password hash;
- protect all backoffice routes and APIs;
- support login and logout;
- keep the OpenAI key exclusively on the backend;
- never return passwords, hashes, or secrets to the frontend.

The exact session mechanism must be selected during the architecture phase, documented in `AI_CONTEXT.md`, and implemented consistently. It must be appropriate for a local demo and must not expose credentials in browser storage.

## 10. Agent configuration

The `/agent` page provides a form for editing:

- Context;
- Guardrails;
- Content;
- Language.

The form must persist the configuration and show loading, saved, and error states.

The request flow is:

```text
AgentConfiguration + conversation airline + conversation intent + user message
  ↓
PromptBuilder
  ↓
AgentService
  ↓
AIProvider / OpenAIProvider
```

Prompt construction must be centralized in `PromptBuilder`. Prompt strings must not be duplicated across route handlers.

## 11. Chat flow

The `/chat` page contains:

- airline selector;
- fixed intent selector;
- conversation messages;
- message input;
- send button;
- loading state;
- error state;
- empty state;
- rating controls for 👍/👎.

The flow is:

```text
Select airline
  ↓
Create conversation
  ↓
Send user message
  ↓
Validate request
  ↓
Persist user message
  ↓
Load agent configuration
  ↓
Build prompt
  ↓
Call OpenAI through AIProvider
  ↓
Persist assistant message and token usage
  ↓
Return response to the chat UI
```

OpenAI calls in automated tests must be mocked.

The intent assignment interaction remains pending approval: the implementation must either add an intent selector using the fixed list or assign an intent through an explicitly approved application rule. It must not invent open-ended classification.

## 12. Dashboard

The dashboard must use persisted data and show empty states on a new installation.

### KPI cards

- total conversations;
- total messages;
- average messages per conversation;
- positive rating percentage;
- total tokens;
- estimated AI cost.

### Charts

- conversations over time;
- conversations by airline;
- intent distribution;
- user feedback distribution.

Charts must use ECharts, must be derived from database data, and must show a clear empty state when there is no data.

Supported dashboard filters:

- last 7 days;
- last 30 days;
- all time.

## 13. Conversations

`/conversations` shows a paginated table with:

- date;
- airline;
- intent;
- message count;
- rating;
- tokens.

`/conversations/:id` shows the complete message history and stored metadata for one conversation.

## 14. API resource areas

FastAPI must expose documented REST endpoints for:

- authentication;
- dashboard aggregates;
- agent configuration;
- airlines;
- intents;
- conversations;
- messages;
- ratings.

Exact endpoint names and request/response schemas must be defined before implementation and kept synchronized with frontend types. FastAPI OpenAPI documentation is required.

## 15. Testing strategy

### pytest

Use pytest for Python domain and backend behavior:

- services;
- repositories;
- PromptBuilder;
- authentication;
- Pydantic validation;
- FastAPI endpoints;
- dashboard aggregations;
- OpenAI provider behavior using mocks.

Tests must not require a real OpenAI request.

### Gherkin and Cucumber-JS

Use Gherkin for business-readable scenarios and Cucumber-JS to bind those scenarios to executable TypeScript steps.

Initial scenarios:

- administrator logs in and views the dashboard;
- administrator updates and saves agent configuration;
- user selects an airline and intent, sends a question, and receives a response;
- user rates a conversation.

### Playwright

Use Playwright for real browser flows, including login, configuration, chat, rating, and conversation inspection.

## 16. Docker and local execution

The project must support:

```bash
docker compose up --build
```

The Compose setup must include frontend and backend services plus a persistent volume for the SQLite file. A separate database container is not required.

Development without Docker should be documented through TurboRepo and pnpm, for example:

```bash
pnpm install
pnpm dev
```

Secrets must be supplied through environment variables. Provide `.env.example` files and keep real `.env` files out of Git.

## 17. Security, performance, and quality

The implementation must include:

- password hashing;
- protected backoffice routes;
- backend-only secrets;
- Pydantic and frontend input validation;
- safe error responses without stack traces;
- input-size limits;
- ORM-based parameterized queries;
- pagination for conversations;
- efficient dashboard aggregation queries;
- no unnecessary OpenAI calls;
- responsive accessible UI;
- explicit loading, empty, success, and error states;
- TypeScript strict mode and explicit Python type hints;
- modular code with clear responsibilities;
- linting, formatting, type checks, and tests.

## 18. AWS readiness

V2 does not include AWS infrastructure or deployment.

The code must remain suitable for future deployment by:

- containerizing frontend and backend;
- keeping configuration in environment variables;
- isolating persistent storage from application code;
- keeping persistence behind SQLAlchemy repositories so SQLite can later be replaced by a managed relational database.

## 19. Implementation phases

The adapted prompt system will execute in this order:

1. Discovery and repository inspection.
2. Architecture and API contract approval.
3. TurboRepo, Next.js, FastAPI, SQLite, Docker, and shared foundation.
4. Authentication and protected backoffice shell.
5. Agent configuration and PromptBuilder.
6. Airline, intent, conversation, message, rating, and OpenAI flows.
7. Dashboard, charts, filters, and conversation inspection.
8. Storybook, pytest, Gherkin, Cucumber, and Playwright coverage.
9. Security, performance, documentation, and acceptance verification.

Each phase must stop at its stated deliverable. The agent must not implement later-phase functionality early.

## 20. Acceptance criteria

The V2 project is accepted when:

- the application starts locally with Docker Compose;
- the seeded administrator can log in;
- protected routes reject unauthenticated access;
- the dashboard initially shows zero or empty data correctly;
- the administrator can save the four agent configuration fields;
- the chat requires airline selection, and the approved fixed-intent assignment flow is implemented;
- a question produces an OpenAI-backed response through FastAPI;
- the conversation, messages, token usage, and estimated cost are persisted;
- the conversation can be rated positively or negatively;
- dashboard KPIs and charts update from persisted data;
- conversations can be paginated and inspected;
- pytest tests pass with OpenAI mocked;
- defined Cucumber scenarios pass;
- Playwright flows pass;
- TypeScript checks, Python checks, lint, builds, and Docker startup pass;
- the repository contains the adapted prompt, context, agent, skill, and documentation files;
- no unrelated technology or functionality from `Base_Node_React` has been introduced.

## 21. Implementation rule

The future implementation prompt must include this rule:

> Use the approved technology stack and functionality in this specification. Preserve the phased prompt, context, agent, skill, documentation, and acceptance-checklist structure from the Base_Node_React project, but do not import its technology choices or unrelated product features. Do not introduce libraries, services, database entities, fields, endpoints, architectural patterns, or functionality that are not explicitly defined here without first requesting approval.
