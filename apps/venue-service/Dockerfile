# Build stage: install workspace dependencies and produce a production build
FROM node:20-slim AS builder
WORKDIR /workspace

# Avoid starting the Nx daemon inside Docker
ENV NX_DAEMON=false

# Copy the full workspace first (respecting .dockerignore)
COPY . .

# Install root dependencies so Nx can run build targets
# This will also set up workspace symlinks in node_modules
RUN npm ci --ignore-scripts

# Create a pruned production build
RUN npx nx run @nearbrew/venue-service:prune --configuration=production

# Runtime stage: install only runtime dependencies using the pruned lockfile
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/workspace_modules

# Use the pruned package metadata produced during the build stage
COPY --from=builder /workspace/apps/venue-service/dist/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy the compiled application code and assets
COPY --from=builder /workspace/apps/venue-service/dist ./

EXPOSE 3000
CMD ["node", "main.js"]
