# Build stage
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
ENV LEFTHOOK=0

# Install dependencies first so this layer is cached until manifests change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/www/package.json apps/www/
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Runtime stage — nitro node-server output is self-contained
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node /app/apps/www/.output ./
EXPOSE 3000
ENV PORT=3000
USER node
CMD ["node", "server/index.mjs"]
