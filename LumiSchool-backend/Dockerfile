# ============================================================
# Stage 1 — Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ============================================================
# Stage 2 — Production
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --chown=appuser:appgroup package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --chown=appuser:appgroup --from=builder /app/dist ./dist

USER appuser

EXPOSE 3400

HEALTHCHECK --interval=10s --timeout=5s --start-period=35s --retries=5 \
  CMD node -e "const net=require('net');const c=net.connect(3400,'127.0.0.1',()=>{c.end();process.exit(0)});c.on('error',()=>process.exit(1));"

CMD ["node", "dist/main"]
