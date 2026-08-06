# Base Node Image
FROM node:20-slim AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production Runner
FROM node:20-slim AS runner
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/.env* ./

EXPOSE 5000
ENV NODE_ENV=production

CMD ["npm", "start"]
