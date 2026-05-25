#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> Deploy: user-check-frontend"
echo "==> Directory: $APP_DIR"

if [ ! -f .env.production ]; then
  if [ -f .env.production.example ]; then
    cp .env.production.example .env.production
    echo "Yangi .env.production yaratildi (.env.production.example dan)."
  else
    echo "Xato: .env.production topilmadi."
    echo "Avval .env.production.example dan nusxa oling."
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1091
source .env.production
set +a

mkdir -p logs

echo "==> npm install"
npm ci

echo "==> build (production)"
npm run build

echo "==> PM2 startOrRestart"
pm2 startOrRestart ecosystem.config.cjs --update-env
pm2 save

FRONTEND_PORT="${PORT:-3000}"

echo ""
echo "Deploy tugadi."
echo "User panel: http://SERVER_IP:${FRONTEND_PORT}"
echo "PM2 status: pm2 status"
echo "Logs: pm2 logs user-check-frontend"
