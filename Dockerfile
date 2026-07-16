# Build stage
FROM node:26.5-alpine@sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66 AS builder
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
ARG VITE_SITE_URL
ARG VITE_GA_ID=""
ARG VITE_SITE_NAME=""
ARG VITE_SITE_DESCRIPTION=""
ARG VITE_SITE_AUTHOR=""
ARG VITE_HOMEPAGE_URL=""
ARG VITE_GITHUB_URL=""
ARG VITE_TWITTER_HANDLE=""
ENV VITE_SITE_URL=${VITE_SITE_URL}
ENV VITE_GA_ID=${VITE_GA_ID}
ENV VITE_SITE_NAME=${VITE_SITE_NAME}
ENV VITE_SITE_DESCRIPTION=${VITE_SITE_DESCRIPTION}
ENV VITE_SITE_AUTHOR=${VITE_SITE_AUTHOR}
ENV VITE_HOMEPAGE_URL=${VITE_HOMEPAGE_URL}
ENV VITE_GITHUB_URL=${VITE_GITHUB_URL}
ENV VITE_TWITTER_HANDLE=${VITE_TWITTER_HANDLE}
RUN test -n "${VITE_SITE_URL}"
RUN pnpm build

# Runtime stage — nitro node-server output is self-contained
FROM node:26.5-alpine@sha256:e88a35be04478413b7c71c455cd9865de9b9360e1f43456be5951032d7ac1a66 AS runner
ENV NODE_ENV=production
WORKDIR /app
ARG APP_VERSION=development
ENV APP_VERSION=${APP_VERSION}
COPY --from=builder --chown=node:node /app/apps/www/.output ./
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health/live').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server/index.mjs"]
