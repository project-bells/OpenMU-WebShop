# syntax=docker/dockerfile:1.7
# ==============================================================================
# Multi-Stage Production Dockerfile for OpenMU-WebShop
# Optimized for Oracle Cloud Infrastructure (OCI) Ampere A1 (linux/arm64) & amd64
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Install full dependency tree (cached by lockfile)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Native ARM64 musl compatibility — zero node-gyp toolchain needed
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# ------------------------------------------------------------------------------
# Stage 2: Compile Vite SPA + Bundle Express/PostgreSQL/Redis Server via esbuild
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build && \
    npm run build:server && \
    npm prune --omit=dev && \
    npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 3: Minimal Non-Root Runtime Image (linux/arm64 Ampere A1 Ready)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

# dumb-init ensures proper PID 1 signal forwarding (SIGTERM/SIGINT graceful DB/Redis drain)
RUN apk add --no-cache dumb-init && \
    mkdir -p /app/logs && \
    chown -R node:node /app

ENV NODE_ENV=production \
    PORT=3000 \
    UV_THREADPOOL_SIZE=8 \
    NODE_OPTIONS="--max-old-space-size=512 --enable-source-maps" \
    AUDIT_LOG_PATH=/app/logs/audit.ndjson

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/dist-server ./dist-server

USER node

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=4s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist-server/server.mjs"]
