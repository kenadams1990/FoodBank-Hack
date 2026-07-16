# TideLift — Production Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install --frozen-lockfile

# Build shared package
COPY packages/shared ./packages/shared
RUN cd packages/shared && npm run build 2>/dev/null || true

# Build web app
COPY apps/web ./apps/web
COPY apps/agents ./apps/agents
RUN cd apps/web && npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/web/build ./build
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/web/package.json ./package.json

EXPOSE 3000
CMD ["node", "build"]
