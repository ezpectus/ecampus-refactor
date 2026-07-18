# Changelog 21 — User Roles + Landing Page

**Date:** 18.07.2026
**Scope:** 8 files modified, 3 files created
**Roadmap:** Phase 3.3 complete, Phase 8.2 started

---

## 1. User roles (Phase 3.3)

Added `Admin` role to the user category system:

- `src/types/enums/user-category.ts` — added `Admin = 'Admin'`
- `src/lib/constants/user-category.ts` — added admin mapping
- `src/messages/en.json` — added `"admin": "Administrator"` to `global.user-category`
- `src/messages/uk.json` — added `"admin": "Адміністратор"` to `global.user-category`

## 2. Removed codeOfHonorSignDate from User model

- `src/types/models/user.ts` — removed `codeOfHonorSignDate` field since the entire code-of-honor system was removed in changelog 20

## 3. Cleaned up KPI menu translations

Removed KPI-specific menu items from `global.menu` in both locales:
- `about`, `documents`, `terms-of-service`, `notice-board`

## 4. Removed KBIS links from public pages

- `src/app/[locale]/(public)/footer.tsx` — removed KBIS link and `env` import
- `src/components/not-found-page.tsx` — removed KBIS link and `env` import

## 5. Landing page (Phase 8.2)

New file: `src/app/[locale]/(public)/landing/page.tsx`

A modern, professional landing page with:
- Header with logo, locale switch, sign-in/register buttons
- Hero section with title, description, and CTAs
- Features grid (6 cards: grades, schedule, messages, analytics, profile, notifications)
- Bottom CTA section
- Footer with copyright

Uses existing in-house SVG icons: `GraduationCap`, `CalendarBlank`, `EnvelopeSimple`, `ChartBarHorizontal`, `UserCircle`, `ChatsTeardrop`.

Added `/landing` to `PUBLIC_PATHS` in middleware constants.

## 6. Landing page translations

Added `landing` namespace to both `en.json` and `uk.json` with:
- Meta title and description
- Nav buttons (login, register)
- Hero section (title, description, CTAs)
- 6 feature cards (title + description each)
- Bottom CTA section
- Footer copyright

---

## Commit message

```
feat: user roles, landing page, KPI translation cleanup

- Add Admin role to UserCategory enum + translations
- Remove codeOfHonorSignDate from User model
- Clean KPI menu items from global.menu translations
- Remove KBIS links from public footer and not-found page
- Add landing page with hero, features grid, CTA sections
- Add landing translations to en.json and uk.json
- Add /landing to public paths
```
