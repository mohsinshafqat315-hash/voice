# Dockerfile for containerizing the backend application
# Multi-stage build for optimization

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy application code
COPY backend/ .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy dependencies and code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create upload directory
RUN mkdir -p storage/uploads

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"]
