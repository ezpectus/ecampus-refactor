# Changelog 18 — Remove Hardcoded KPI URLs, Clean Up Logging, Rename Documents Route

**Date:** 18.07.2026
**Scope:** 15 files modified, 1 folder renamed

---

## 1. Remove hardcoded KPI URLs (7 files)

**Problem:** Multiple files contained hardcoded `campus.kpi.ua`, `cdn.cloud.kpi.ua`, `ecampus@kpi.ua`, and KPI-specific image URLs.

**Fix:**
- `login-carousel.tsx`: Replaced 10 KPI campus images (Ukrainian descriptions, `@kpi_look` credits, Instagram links) with 5 generic English descriptions
- `internal-materials-table.tsx`: Replaced `https://campus.kpi.ua/student/index.php?mode=mob&show&irid=...` with relative `/module/studysheet/${row.resourceId}`
- `contacts/page.tsx`: Replaced `mailto:ecampus@kpi.ua` with `mailto:support@student-portal.app`
- `support-card.tsx`: Replaced `mailto:ecampus@kpi.ua` with `mailto:support@student-portal.app`, removed WhatsApp button (removed unused `Chats` import)
- `default-announcement-slide.tsx`: Replaced `https://cdn.cloud.kpi.ua/public/welcome-to-campus.png` with `/images/welcome.png`
- `settings-form.tsx`: Replaced `nickname@kpi.ua` placeholder with `user@example.com`
- `auth.actions.ts`: Replaced hardcoded `.kpi.ua` hostname check with configurable `API_BASE_URL` hostname check

---

## 2. Rename kpi-documents route to documents (3 files, 1 folder)

**Files:** `kpi-documents/` → `documents/`, `footer.tsx`, `code-of-honor.tsx`

**Fix:**
- Renamed folder `src/app/[locale]/(private)/kpi-documents/` → `documents/`
- Renamed component `KPIDocumentsPage` → `DocumentsPage`
- Updated footer link `/kpi-documents` → `/documents`
- Updated code-of-honor link `/kpi-documents` → `/documents`

---

## 3. Remove all console.error calls (audit FT-02) (6 files, 13 occurrences)

**Files:** `announcement.actions.ts`, `colleague-contacts.actions.ts`, `auth.actions.ts`, `studysheet/page.tsx`, `studysheet/[id]/page.tsx`, `code-of-honor.middleware.ts`

**Problem:** 13 `console.error` calls remained in server-side code, logging to server console with no user-facing benefit. These are noise in production logs.

**Fix:** Removed all `console.error` calls. Changed `catch (error)` to `catch` (unused variable). Safe defaults (`[]`, `null`) are already returned in each catch block.

---

## 4. Clean up env.ts and .env.example (3 files)

**Files:** `env.ts`, `.env.example`, `.env.development`, `.env.production`

**Fix:**
- `env.ts`: Removed `NEXT_PUBLIC_BETA_LOGO` (unused). Kept all other URL env vars as optional — they're generic configurable URLs, not KPI-specific in name
- `.env.example`: Updated with all configurable URL env vars, organized by category (Support, Social, Documents, University)
- `.env.development` / `.env.production`: Already stripped in changelog 17

---

## Commit message

```
refactor: remove hardcoded KPI URLs, clean up logging, rename documents route

- Replace hardcoded campus.kpi.ua links with relative routes
- Replace ecampus@kpi.ua with support@student-portal.app
- Replace KPI CDN image URL with local /images/ path
- Replace KPI email placeholder with generic example.com
- Replace hardcoded .kpi.ua hostname check with API_BASE_URL config
- Rename kpi-documents route to documents (folder, component, links)
- Remove 13 console.error calls from 6 files (audit FT-02)
- Clean up env.ts: remove unused BETA_LOGO, keep configurable URLs
- Update .env.example with all configurable URL vars
- Replace 10 KPI carousel images with 5 generic English descriptions
```
