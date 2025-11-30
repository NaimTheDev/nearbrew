# Build stage: install workspace dependencies and produce a production build
FROM node:20-slim AS builder
WORKDIR /workspace

# Avoid starting the Nx daemon inside Docker
ENV NX_DAEMON=false

# Install root dependencies so Nx can run build targets
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy the full workspace (respecting .dockerignore) and create a pruned production build
COPY . .
RUN npx nx run @nearbrew/venue-service:prune --configuration=production

# Runtime stage: install only runtime dependencies using the pruned lockfile
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Use the pruned package metadata produced during the build stage
COPY --from=builder /workspace/apps/venue-service/dist/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy the compiled application code and assets
COPY --from=builder /workspace/apps/venue-service/dist ./

EXPOSE 3000
CMD ["node", "main.js"]
