#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."

if [[ ! -d node_modules ]]; then
  echo '[setup] Installing dependencies...'
  npm install || exit 1
fi
if [[ ! -f prisma/dev.db ]]; then
  echo '[setup] Creating SQLite database...'
  npm run db:generate || exit 1
  npm run db:push || exit 1
  npm run db:seed || exit 1
fi
if [[ ! -d src/generated/prisma ]]; then
  npm run db:generate || exit 1
fi

open_terminal() {
  local title="$1"
  shift
  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="Student Portal - $title" -- bash -lc "$*; exec bash"
  elif command -v osascript >/dev/null 2>&1; then
    osascript -e "tell application \"Terminal\" to do script \"cd '$PWD' && $*\""
  elif command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -e bash -lc "$*; exec bash"
  else
    echo "[$title] Run in another terminal: $*"
  fi
}

echo " Opening 6 CLI terminals..."

open_terminal "Frontend"   "echo '\n STUDENT PORTAL — FRONTEND\n Next.js Dev Server\n http://localhost:3000\n' && npm run dev"
open_terminal "Backend"    "echo '\n STUDENT PORTAL — BACKEND\n API Health Monitor\n' && node scripts/health-watch.cjs"
open_terminal "TypeCheck"  "echo '\n STUDENT PORTAL — TYPECHECK\n TypeScript Watch\n' && npx tsc --noEmit --watch"
open_terminal "Database"   "echo '\n STUDENT PORTAL — DATABASE\n Prisma Studio\n http://localhost:5555\n' && npm run db:studio"
open_terminal "Tests"      "echo '\n STUDENT PORTAL — TESTS\n Vitest Watch\n q=quit  a=all  f=filter\n' && npm run test:watch"
open_terminal "Info"       "echo '\n STUDENT PORTAL — INFO\n Dashboard\n\n Frontend:      http://localhost:3000\n Prisma Studio: http://localhost:5555\n\n Accounts: admin / teacher / student — test12345\n\n npm run test:quick  - tsc+lint+vitest\n npm run test:all    - full suite\n npm run db:push     - apply schema\n npm run db:seed     - seed data\n npm run build       - prod build\n\n Stack: Next.js 15.5 / React 19.2 / Prisma 7.8\n Branch: '$(git branch --show-current 2>/dev/null || echo unknown)'\n' && read -r"

cat <<'INFO'

 6 terminals opened:
   [1] Frontend    — http://localhost:3000
   [2] Backend     — API health monitor
   [3] TypeCheck   — tsc --watch
   [4] Database    — Prisma Studio http://localhost:5555
   [5] Tests       — Vitest watch
   [6] Info        — Dashboard

 Close each terminal or Ctrl+C to stop.
INFO
