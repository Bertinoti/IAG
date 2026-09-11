---
name: base-frontend-development
description: Build and review React TypeScript interfaces with Vite, Tailwind, accessible stateful UI, translated copy, and reliable API/auth integration.
---

# Base Frontend Development

Use this skill for React pages, components, forms, route protection, API integration, design-system work, responsive UI, accessibility, tests, and frontend refactors.

## Start Here

Read:

- `AI_CONTEXT.md`
- `PROJECT_PROMPT.md`
- `agents/frontend-agent.md`
- the relevant route, API client, types, providers, locale files, and UI primitives

## Practical Rules

- Keep server state, URL state, form state, and transient UI state separate.
- Centralize API calls and response normalization; do not fetch directly inside many unrelated components.
- Keep API types aligned with backend DTOs and update both sides in the same workstream.
- Use React Hook Form and Zod for non-trivial forms.
- Treat `/register` as a required public flow: accessible fields, password confirmation, translated validation, password feedback, loading, duplicate-email/server errors, success, and navigation back to `/login`.
- Make destructive actions explicit and recoverable where possible.
- Use stable loading, error, empty, success, and retry states instead of layout shifts.
- Prefer semantic HTML, visible focus, useful labels, and keyboard-complete interactions.
- Add translation keys for every visible string and verify longer Portuguese/Spanish text does not break layout.
- Use charts only when they clarify a decision; provide labels, summaries, and accessible alternatives.
- Avoid unnecessary state libraries, memoization, abstraction, and component fragmentation.

## Visual Quality

Use Tailwind through coherent tokens for color, spacing, typography, radii, and shadows. A polished interface needs consistent hierarchy and responsive behavior, not merely more decoration. Review at narrow mobile width, desktop width, keyboard navigation, and reduced-motion settings.

## Required Verification

For a meaningful frontend change, run the smallest relevant set of:

- component and interaction tests;
- lint and typecheck;
- production build;
- accessibility checks when available.

Report skipped checks and known limitations honestly.

## References

- For auth UI, read the authentication sections of `PROJECT_PROMPT.md` and `AI_CONTEXT.md`.
- For new screens, confirm the API contract and permission model before designing optimistic behavior.
