FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile=false
COPY apps/web apps/web
COPY apps/api/tests apps/api/tests
COPY packages/ui packages/ui
RUN pnpm --filter @airline-ai/web build
EXPOSE 3000
CMD ["pnpm", "--filter", "@airline-ai/web", "start"]
