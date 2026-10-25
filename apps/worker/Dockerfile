# Multi-stage production Dockerfile for CampaignHub 24/7 background worker
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root and workspace package manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

# Install build dependencies
RUN npm ci

# Copy sources
COPY packages/shared/ ./packages/shared/
COPY apps/worker/ ./apps/worker/

# Build shared library and worker service
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/worker

# Production image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

EXPOSE 8080

CMD ["node", "apps/worker/dist/index.js"]
