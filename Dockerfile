# Build stage
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Runtime stage — nitro node-server output is self-contained
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/apps/www/.output ./
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server/index.mjs"]
