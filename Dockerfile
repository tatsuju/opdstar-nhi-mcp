# syntax=docker/dockerfile:1.7
# Dockerfile for @opdstar/nhi-mcp — required by Glama for listing checks.
# Glama only needs the server to start and respond to MCP introspection
# (initialize + tools/list). This image runs the published npm package via
# stdio so the introspection check passes without any extra wiring.

FROM node:20-alpine AS builder
WORKDIR /app

# Install build deps (we copy package*.json first to use Docker layer cache).
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

# Strip dev deps for the runtime stage.
RUN npm prune --omit=dev


FROM node:20-alpine AS runtime
WORKDIR /app

# Run as a non-root user (Glama best practice + healthcare data hygiene).
RUN addgroup -S mcp && adduser -S mcp -G mcp

COPY --from=builder --chown=mcp:mcp /app/dist ./dist
COPY --from=builder --chown=mcp:mcp /app/node_modules ./node_modules
COPY --chown=mcp:mcp package.json ./

USER mcp

# Optional: override the API base for staging / self-host. Defaults to prod.
ENV OPDSTAR_API_BASE=https://opdstar.com/api/mcp
ENV NODE_ENV=production

# MCP servers communicate over stdio — no port to expose.
ENTRYPOINT ["node", "dist/index.js"]
