FROM node:20-alpine AS base
WORKDIR /app

# Build Web Frontend
FROM base AS web-builder
WORKDIR /app/web
COPY infinity-clinic/web/package*.json ./
RUN npm ci
COPY infinity-clinic/web/ ./
RUN npm run build

# Production Server
FROM base AS runner
WORKDIR /app/api
COPY infinity-clinic/api/package*.json ./
RUN npm ci --only=production
COPY infinity-clinic/api/ ./
COPY --from=web-builder /app/web/dist ./public

EXPOSE 4000
CMD ["npm", "start"]
