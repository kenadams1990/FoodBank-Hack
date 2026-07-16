FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY apps/web/package.json ./apps/web/
RUN npm install --workspace=apps/web

# Copy source
COPY . .

# Build SvelteKit app
WORKDIR /app/apps/web
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=base /app/apps/web/build ./build
COPY --from=base /app/apps/web/package.json ./package.json
RUN npm install --production
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
CMD ["node", "build"]
