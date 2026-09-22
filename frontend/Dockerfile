# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package manifests for workspace installation
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY shared/ ./shared/

# Install dependencies
RUN npm ci --workspace=frontend

# Copy frontend source code and config
COPY frontend/ ./frontend/

# Build Next.js app
RUN npm run build --workspace=frontend

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend ./frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=frontend"]
