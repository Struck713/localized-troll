# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install all dependencies
RUN bun install --frozen-lockfile

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

RUN bun build --target=bun --outfile=dist/app.js src/app.ts

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Run the application
CMD ["bun", "run", "dist/app.js"]