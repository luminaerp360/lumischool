# ============================================================
# Stage 1 — Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Bake production API URL into the Angular bundle at build time
RUN npm run build -- --configuration=production

# ============================================================
# Stage 2 — Production (nginx)
# ============================================================
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built Angular app
# Angular application builder outputs to dist/<name>/browser/
COPY --from=builder /app/dist/rentium-frontend/browser /usr/share/nginx/html

# Copy our SPA nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
