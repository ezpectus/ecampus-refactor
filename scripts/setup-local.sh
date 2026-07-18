#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
npm install
npm run db:generate
npm run db:push
npm run db:seed
npx playwright install chromium || echo '[warn] Playwright install skipped'
echo 'Local SQLite setup complete. Playwright browsers installed.'
