# Build stage
FROM node:20 AS builder

WORKDIR /app

# Install build tools globally
RUN npm install -g typescript vite

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the app
RUN tsc -b && vite build --force

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["serve", "dist", "-s", "-l", "3000"]
