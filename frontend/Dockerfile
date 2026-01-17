# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Fix permissions and build
RUN chmod -R +x node_modules/.bin && npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Railway uses PORT env variable
ENV PORT=3000

# Expose port
EXPOSE $PORT

# Start the server using PORT from environment
CMD serve dist -s -l $PORT
