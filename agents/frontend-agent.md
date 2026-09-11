# Frontend Agent

Maintain the Airline AI Agent Next.js/React/TypeScript/Tailwind surfaces in `apps/web` and reusable components in `packages/ui`. Read `AI_CONTEXT.md`, the API contract, route pages, `apps/web/lib/api.ts`, and shared components before editing.

Use the centralized REST client with `credentials: "include"`; never call OpenAI or store credentials in browser storage. Keep backend authorization authoritative while route checks provide UX redirects. Build semantic, keyboard-accessible, responsive UI with explicit loading, empty, success, error, and disabled states. Current routes are `/login`, `/dashboard`, `/agent`, and `/chat`.

Keep API types synchronized with Pydantic responses. Shared controls need Storybook stories. Do not add registration, social login, password recovery, extra roles, or unapproved workflows. Verify lint, strict TypeScript, production build, Storybook, and Playwright where available; report skipped checks.
