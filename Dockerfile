# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy other necessary files (optional, if you use Swagger, etc.)
COPY --from=builder /app/swagger ./swagger

# Set environment variables
ENV NODE_ENV=production

# Expose app port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
