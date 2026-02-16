# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install ALL dependencies (including devDependencies) for development
RUN npm install

# --- NEW STAGE: Development ---
# This matches the 'target: development' in your docker-compose.yaml
FROM deps AS development
WORKDIR /app
COPY . .
ENV NODE_ENV=development
# Port 3000 for Next.js dev server
EXPOSE 3000
# The command is handled by docker-compose, but we add it here for safety
CMD ["npm", "run", "dev"]

# Stage 2: Builder (for production)
FROM deps AS builder
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV=production
# Build the application using the standalone output
RUN npm run build

# Stage 3: Runner (Production Image)
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application (Standalone mode)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]