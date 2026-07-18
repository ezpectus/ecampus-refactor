# Changelog 17 — De-KPI-fy Codebase + Remaining Audit Fixes

**Date:** 18.07.2026
**Scope:** 20+ files modified, 6 files deleted
**Audit References:** CR-06 (any types), SaaS roadmap Phase 2

---

## 1. Fix remaining `any` types (CR-06) (3 files)

**Files:** `use-dot-button.ts`, `global.d.ts`, `i18n/request.tsx`

**Problem:** Three `any` type usages remained from audit finding CR-06.

**Fix:**
- `use-dot-button.ts`: Replace `api: any` with `api: CarouselApi` in `onInit` and `onSelect` callbacks
- `global.d.ts`: Replace `ResponseType = any` default generic with `ResponseType = unknown`
- `i18n/request.tsx`: Replace `locale as string` with `locale as LOCALE` (proper type import)

---

## 2. Remove KPI ID login system (6 files deleted, 3 files modified)

**Deleted:**
- `src/app/[locale]/(public)/(auth)/login/kpi-id-login.tsx` — KPI ID OAuth button component
- `src/app/[locale]/(public)/(auth)/login/kpi-id/page.tsx` — Account selector page
- `src/app/api/kpi-id/route.ts` — KPI ID API route handler
- `src/components/account-selector/` — Account selector components (2 files)
- `src/types/models/kpi-id-account.ts` — KPI ID account types

**Modified:**
- `src/app/[locale]/(public)/(auth)/login/page.tsx` — Remove KPIIDLogin import, TextDivider, render only CredentialsLogin
- `src/actions/auth.actions.ts` — Remove `getKPIIDAccounts` function and `KPIIDAccount` import
- `src/types/global.d.ts` — Remove `KPI_ID` interface and `Window.KPIID` declaration

**Env cleanup:**
- `src/lib/env.ts` — Remove `NEXT_PUBLIC_KPI_ID_APP_ID` and `NEXT_PUBLIC_KPI_ID_BUTTON` env vars
- `next.config.mjs` — Remove `NEXT_PUBLIC_KPI_ID_APP_ID` from `env` block
- `.env.development` / `.env.production` — Remove KPI ID env vars and 20+ KPI-specific URL env vars

---

## 3. Remove 37 external module redirects (3 files modified)

**Files:** `modules.ts`, `menu.actions.ts`, `module.ts`

**Problem:** 37 out of 48 modules were external redirects to the legacy PHP campus system (`OLD_CAMPUS_URL`). These are KPI-specific and have no place in a generic SaaS product.

**Fix:**
- `modules.ts`: Reduced from 48 modules to 11 internal-only modules. Removed all `isExternal: true` entries. Changed `isExternal` from function `(profileArea) => boolean` to simple `boolean`.
- `module.ts`: Simplified `Module` interface — `isExternal` is now always `boolean`, removed `ProfileArea` import and function variant.
- `menu.actions.ts`: Removed `OLD_CAMPUS_URL`, `OLD_CAMPUS_PROFILE_AREA`, `ProfileArea` dependency, `getIsExternal` function, and external URL composition. All modules now resolve to `/module/${name}`.

---

## 4. Rename `campusFetch` → `apiFetch` (15 files)

**Files:** `lib/client.ts`, `lib/file-upload.ts`, `lib/env.ts`, all 13 action files

**Problem:** `campusFetch` and `CAMPUS_API_BASE_PATH` are KPI-specific names.

**Fix:**
- `lib/client.ts`: `export const campusFetch` → `export const apiFetch`
- `lib/file-upload.ts`: `env.CAMPUS_API_BASE_PATH` → `env.API_BASE_URL`
- `lib/env.ts`: `CAMPUS_API_BASE_PATH` → `API_BASE_URL`, removed `OLD_CAMPUS_URL`
- All 13 action files: `campusFetch` → `apiFetch` (65 occurrences via batch replace)

---

## 5. Rename cookies (1 file)

**File:** `src/lib/constants/cookies.ts`

**Fix:**
- `ecampus-token` → `sp-token`
- `SID` → `sp-session`

---

## 6. Clean up CSP and image domains (1 file)

**File:** `next.config.mjs`

**Fix:**
- CSP `connect-src`: Removed `https://api.campus.kpi.ua` and `https://ecampus.cloud.kpi.ua` (KPI-specific)
- Image `remotePatterns`: Replaced 3 KPI-specific hostnames with wildcard `hostname: '**'` (generic, configurable per deployment)

---

## 7. Update translations (2 files)

**Files:** `src/messages/en.json`, `src/messages/uk.json`

**Fix:**
- `global.metadata.title`: "Campus KPI" / "Кампус КПІ" → "Student Portal"
- `global.metadata.description`: Same change

---

## 8. Update environment files (2 files)

**Files:** `.env.development`, `.env.production`

**Fix:**
- Renamed `CAMPUS_API_BASE_PATH` → `API_BASE_URL`
- Removed `OLD_CAMPUS_URL`
- Removed 20+ KPI-specific env vars (social media URLs, document URLs, schedule URL, library URL, KPI ID vars, WhatsApp link, etc.)
- Kept only essential vars: API URL, cookie domains, env flag, reCAPTCHA key, carousel CDN, GA ID

---

## Commit message

```
feat: de-KPI-fy codebase — remove KPI ID login, external redirects, rename vars

- Remove KPI ID OAuth login system (6 files deleted: kpi-id-login, kpi-id
  page, api/kpi-id route, account-selector components, kpi-id-account type)
- Remove 37 external module redirects to legacy campus, keep 11 internal
- Simplify Module type: isExternal is now boolean, not function
- Rename campusFetch -> apiFetch across 15 files (65 occurrences)
- Rename CAMPUS_API_BASE_PATH -> API_BASE_URL in env schema
- Rename cookies: ecampus-token -> sp-token, SID -> sp-session
- Remove OLD_CAMPUS_URL env var
- Clean up CSP: remove KPI domains from connect-src
- Clean up image domains: wildcard hostname instead of KPI-specific
- Update translations: "Campus KPI" -> "Student Portal"
- Strip 20+ KPI-specific env vars from .env files
- Fix remaining audit CR-06: replace any types in 3 files
```
