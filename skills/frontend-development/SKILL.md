---
name: airline-frontend-development
description: Build and review Airline AI Agent Next.js, React, TypeScript, Tailwind, REST, accessibility, Storybook, and Playwright UI.
---

# Airline Frontend Development

Read `AI_CONTEXT.md`, `PROJECT_PROMPT.md`, the frontend agent instructions, relevant routes, API client, and shared components before editing. Keep server, form, URL, and transient state separate. Centralize REST calls, send the signed cookie with `credentials: include`, and keep frontend types aligned with FastAPI schemas. Never call OpenAI in the browser or store credentials.

Use semantic controls, visible focus, keyboard support, responsive Tailwind layouts, and stable loading/empty/error/success states. Shared components belong in `packages/ui` with Storybook stories. Use ECharts only for approved persisted dashboard aggregates and provide an accessible empty/text alternative.

Run and report lint, strict TypeScript, production build, Storybook, and relevant Playwright checks. Do not claim skipped checks.
