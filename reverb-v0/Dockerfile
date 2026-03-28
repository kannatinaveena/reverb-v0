# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema before npm ci
COPY prisma ./prisma

# Install dependencies, including dev dependencies for the build
RUN npm ci --omit=dev

# Copy all project files
COPY . .

# Run the Next.js build command
RUN npm run build

# Stage 2: Create the final lightweight image
FROM node:20-alpine AS runner
WORKDIR /app

# The Next.js standalone output contains everything needed
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Install bash + netcat if needed for DB wait
RUN apk add --no-cache bash netcat-openbsd

# Ensure the correct user and permissions (optional but good practice)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs .next
USER nextjs

EXPOSE 3001

# Command to run the application in production
CMD ["node", "server.js"]
