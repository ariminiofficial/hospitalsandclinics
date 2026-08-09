#!/bin/bash
set -euo pipefail

APP_DIR="/var/www/infinity-clinic"
cd "$APP_DIR"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing API dependencies..."
cd api && npm ci --production && cd ..

echo "==> Running migrations..."
cd api && npm run migrate && cd ..

echo "==> Installing web dependencies and building..."
cd web && npm ci && npm run build && cd ..

echo "==> Reloading PM2..."
pm2 reload deploy/ecosystem.config.js --env production

echo "==> Reloading Nginx..."
sudo nginx -s reload

echo "==> Deploy complete."
