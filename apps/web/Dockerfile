FROM node:20-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Workspace metadata first for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/core/package.json packages/core/package.json

RUN pnpm install --frozen-lockfile

# Source code.
COPY apps/web apps/web
COPY packages/core packages/core
COPY docs/08-example-data docs/08-example-data
COPY scripts scripts

RUN pnpm --filter @orbital-poc/web build

# Runtime image
FROM node:20-bookworm-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"

RUN corepack enable

WORKDIR /app

# Writable runtime dirs (and seeds for named volumes on first run).
RUN mkdir -p /app/tmp/object-store /app/tmp/fixture-seed /pnpm \
  && chown -R node:node /app/tmp /pnpm

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-lock.yaml

COPY --from=build --chown=node:node /app/apps/web /app/apps/web
COPY --from=build /app/packages/core /app/packages/core
COPY --from=build /app/docs/08-example-data /app/docs/08-example-data
COPY --from=build /app/scripts /app/scripts

WORKDIR /app/apps/web

USER node

EXPOSE 3000

CMD ["pnpm", "start"]
