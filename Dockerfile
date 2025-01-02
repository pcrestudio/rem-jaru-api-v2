# backend/Dockerfile

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl
# RUN apk add --no-cache python3 make g++

# Create a symbolic link if it doesn’t exist
# RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install Yarn
RUN corepack enable

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN yarn prisma generate
#RUN yarn prisma

# Build the NestJS application
RUN yarn build

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl
# RUN apk add --no-cache python3 make g++

# Create a symbolic link if it doesn’t exist
# RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install Yarn
RUN corepack enable

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install only production dependencies
RUN yarn install --production

# Copy Prisma Client
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
#COPY --from=builder /app/node_modules/@prisma-remtrack/client ./node_modules/@prisma-remtrack/client
#COPY --from=builder /app/node_modules/@prisma-imanage/client ./node_modules/@prisma-imanage/client

# Expose the port NestJS app runs on
EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/src/main.js"]

# Start the NestJS application with NODE_OPTIONS
#CMD ["sh", "-c", "NODE_OPTIONS=--openssl-legacy-provider node dist/main.js"]
