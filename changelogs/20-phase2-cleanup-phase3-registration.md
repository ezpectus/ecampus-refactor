# Changelog 20 — Phase 2 Cleanup + Phase 3 Registration

**Date:** 18.07.2026
**Scope:** 15+ files modified/deleted, 3 files created
**Roadmap:** Phase 2 complete, Phase 3 started

---

## 1. Removed KPI-specific pages (Phase 2.3)

Deleted the following KPI-specific pages and their components:
- `src/app/[locale]/(private)/about/` — KPI about page
- `src/app/[locale]/(private)/accept-code-of-honor/` — KPI code of honor acceptance
- `src/app/[locale]/(private)/notice-board/` — KPI external notice board
- `src/app/[locale]/(private)/student-manual/` — KPI student manual
- `src/app/[locale]/(private)/user-manual/` — KPI user manual
- `src/app/[locale]/(private)/terms-of-service/` — KPI terms of service
- `src/app/[locale]/(private)/documents/` — KPI documents page (renamed from kpi-documents in changelog 18)
- `src/app/[locale]/(private)/frequently-asked-questions/` — KPI FAQ page

## 2. Removed KPI-specific dashboard cards

Deleted:
- `src/app/[locale]/(private)/cards/information-card.tsx` — KPI links card (schedule, DNVR, library, etc.)
- `src/app/[locale]/(private)/cards/social-networks-card.tsx` — KPI social media card

Updated:
- `src/app/[locale]/(private)/cards/index.ts` — removed exports for deleted cards
- `src/app/[locale]/(private)/page.tsx` — removed deleted cards from dashboard layout

## 3. Removed code-of-honor system

The code-of-honor was deeply KPI-specific (middleware enforcement, profile component, user model field).

Deleted:
- `src/middleware/code-of-honor.middleware.ts` — entire middleware
- `src/app/[locale]/(private)/profile/components/code-of-honor.tsx` — profile component

Updated:
- `src/middleware/authentication.middleware.ts` — auth chain now goes directly to `authorizationMiddleware` instead of through `codeOfHonorMiddleware`
- `src/middleware/constants.ts` — removed `CODE_OF_HONOR_PATH`
- `src/app/[locale]/(private)/profile/page.tsx` — removed `CodeOfHonor` import and usage

## 4. Updated sidebar and footer

- `src/components/app-sidebar/app-sidebar.tsx` — removed `notice-board` menu item
- `src/components/app-sidebar/footer.tsx` — removed KPI footer links (about, documents, terms-of-service), removed KBIS link and `env` import, simplified to just contacts link + copyright

## 5. Cleaned up footer translations (Phase 2.5)

Replaced KPI-specific footer text in both `en.json` and `uk.json`:
- Removed KBIS developer link
- Removed "Igor Sikorsky Kyiv Polytechnic Institute" references
- Replaced with generic "Student Portal" copyright

## 6. Added registration page (Phase 3.1)

New files:
- `src/app/[locale]/(public)/(auth)/register/page.tsx` — server component with metadata
- `src/app/[locale]/(public)/(auth)/register/register-form.tsx` — client form with Zod validation (name, email, password, confirm password)

Updated:
- `src/actions/auth.actions.ts` — added `registerUser` server action (calls `account/register` API, handles 409 conflict)
- `src/middleware/constants.ts` — added `/register` to `PUBLIC_PATHS`
- `src/app/[locale]/(public)/(auth)/login/page.tsx` — added "Sign up" link to registration page

## 7. Added registration translations

Added `auth.register` namespace to both `en.json` and `uk.json` with:
- Header, description
- Field labels (name, email, password, confirm)
- Error messages (email-taken, generic)
- Button labels (register, login link)
- Validation messages (required fields, email format, password min length, password match)

Also added `register` key to `auth.login` in both locales for the "Don't have an account?" link.

## 8. Updated roadmap

Updated `docs/saas-transformation-roadmap.md` progress tracking:
- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: In Progress

---

## Commit message

```
feat: Phase 2 cleanup + Phase 3 registration

Phase 2 (complete):
- Remove KPI pages: about, accept-code-of-honor, notice-board, manuals,
  terms-of-service, documents, FAQ
- Remove KPI dashboard cards: information-card, social-networks-card
- Remove code-of-honor middleware and profile component
- Clean up sidebar (remove notice-board) and footer (remove KPI links/KBIS)
- Replace KPI footer translations with generic Student Portal branding

Phase 3 (started):
- Add /register page with Zod-validated form (name, email, password, confirm)
- Add registerUser server action (POST account/register, 409 handling)
- Add /register to public paths in middleware
- Add "Sign up" link on login page
- Add auth.register translations to en.json and uk.json
```
