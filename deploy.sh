#!/bin/bash
# ═══════════════════════════════════════════════════════
#  Adswadi WhatsApp API — One-Click Deploy Script
#  Run this on your Hostinger VPS after first-time setup
#  Usage: chmod +x deploy.sh && ./deploy.sh
# ═══════════════════════════════════════════════════════

set -e  # Exit on any error

echo ""
echo "🚀 Adswadi Deploy Starting..."
echo "================================"

# ── 1. Pull latest code ──────────────────────────────
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# ── 2. Install server deps ───────────────────────────
echo "📦 Installing server dependencies..."
cd server && npm install --production && cd ..

# ── 3. Build React frontend ──────────────────────────
echo "🔨 Building React frontend..."
cd client && npm install && npm run build && cd ..

# ── 4. Copy build to web root ────────────────────────
echo "📁 Copying build files..."
sudo cp -r client/dist/* /var/www/adswadi/client/dist/

# ── 5. Restart server with PM2 ───────────────────────
echo "🔄 Restarting API server..."
cd server
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

# ── 6. Reload Nginx ─────────────────────────────────
echo "🌐 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Deploy Complete!"
echo "================================"
echo "🌐 Website: https://yourdomain.com"
echo "📡 API:     https://yourdomain.com/api"
echo "================================"
pm2 status
