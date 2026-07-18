# Changelog: Security hardening, seed data, deploy configs, docs update

## Overview
Hardened authentication with rate limiting, added parent demo user to seed data, created deploy configs for Netlify and Vercel, and updated all documentation to reflect the current project state.

## Changes

### Security
- **Login rate limiting** — 10 attempts per minute, 5-minute lockout (`src/actions/local-auth.actions.ts`)
- **Registration rate limiting** — 5 attempts per hour (`src/actions/local-auth.actions.ts`)
- **Rate limit reset on success** — `resetRateLimit()` called after successful login
- **PARENT role modules** — parents get `['parent']` module access only (least privilege)
- **ADMIN analytics access** — analytics module added to admin's module list

### Seed Data (`prisma/seed.js`)
- **Parent demo user** — `parent / test12345` linked to demo student via `ParentStudent` model
- **Prisma 7 fix** — import from `../src/generated/prisma/client` instead of `@prisma/client`
- **Prisma 7 adapter** — seed now uses `PrismaBetterSqlite3` adapter
- **Cleanup** — `parentStudent.deleteMany()` added to seed cleanup
- **Updated credentials output** — parent shown in test credentials list

### Deploy Configs
- **`netlify.toml`** — build command, publish dir, env vars, Next.js plugin
- **`vercel.json`** — build command, framework, regions, env vars

### Documentation
- **`README.md`** — added Parent Portal section, Analytics Dashboard in admin, rate limiting in security, parent test credentials, Prisma 7 in tech stack, feature toggles
- **`CLAUDE.md`** — updated Prisma description with adapter names, added parent to account types, rate limiting mention, Key Libraries section with all infrastructure modules
- **`docs/roadmap.md`** — added v1.x completed section, updated parent portal extensions, added new security/infra debt items (CSP nonces, CSRF tokens, password reset, 2FA)

## Files Modified
- `prisma/seed.js` — parent user, Prisma 7 import + adapter, cleanup
- `src/actions/local-auth.actions.ts` — rate limiting on login + register, parent/analytics modules
- `README.md` — parent portal, analytics, security, credentials, tech stack
- `CLAUDE.md` — Prisma 7 adapters, parent role, key libraries section
- `docs/roadmap.md` — completed items, new ideas

## Files Created
- `netlify.toml` — Netlify deploy config
- `vercel.json` — Vercel deploy config

## Temp Files to Delete
- `_fix-generics.cjs` — leftover from previous session
- `check.cjs` — leftover from git status check
