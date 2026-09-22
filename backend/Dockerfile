# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package manifests for workspace installation
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --workspace=backend

# Copy backend source code and config
COPY backend/ ./backend/

# Build TypeScript
RUN npm run build --workspace=backend

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy node_modules and built dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/dist/index.js"]
