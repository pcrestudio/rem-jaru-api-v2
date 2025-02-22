# Stage 1: Build the application
FROM mcr.microsoft.com/playwright:v1.40.0 as playwright-base

FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Instalar dependencias del sistema necesarias para Playwright
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install Yarn
RUN corepack enable

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the application code
COPY . .

# Instalar Playwright y sus navegadores
RUN yarn add playwright
RUN npx playwright install --with-deps

# Stage 2: Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Instalar dependencias del sistema necesarias para Playwright en producción
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Install Yarn
RUN corepack enable

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules

# Expose the port NestJS app runs on
EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/src/main.js"]
