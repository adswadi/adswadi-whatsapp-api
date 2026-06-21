# Stage 1: Build React client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit
COPY client/ ./
RUN npm run build

# Stage 2: Run Express server
FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install --no-audit --omit=dev
COPY server/ ./

# Copy built client dist into server directory
COPY --from=client-builder /app/client/dist ../client/dist

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
