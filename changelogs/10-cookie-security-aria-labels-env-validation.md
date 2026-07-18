# Changelog 10 — Cookie Security, ARIA Labels, Environment Variable Validation

**Date:** 18.07.2026
**Scope:** 18 files
**Audit References:** P1-09 (sidebar cookie), A-02 (icon-only button aria-labels), P2-10 (process.env non-null assertions)

---

## 1. Sidebar cookie missing security flags (SEC-09)

**File:** `src/components/ui/sidebar.tsx:76`

**CWE:** CWE-155 (Improper Neutralization of Wildcard or Placeholder)

**Problem:** The sidebar state cookie was set without `secure` or `samesite` flags, making it vulnerable to interception over HTTP and susceptible to CSRF attacks.

**Before:**
```ts
document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
```

**After:**
```ts
document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; secure; samesite=lax`;
```

**Impact:** Cookie is now only sent over HTTPS (`secure`) and restricted to same-site requests (`samesite=lax`), preventing CSRF and MITM attacks.

---

## 2. Icon-only buttons missing aria-labels (A11Y-02)

**Files:**
- `src/app/[locale]/(private)/module/facultycertificate/components/all-docs-table.tsx` (5 buttons)
- `src/app/[locale]/(private)/module/announcementseditor/components/announcements-table/announcements-table.tsx` (2 buttons)
- `src/app/[locale]/(private)/profile/components/editable-field.tsx` (2 buttons)

**CWE:** CWE-1164 (Improper Implementation of Web Page)

**Problem:** Icon-only buttons (sign, approve, reject, print, view, edit, delete) had no text content or `aria-label`, making them invisible to screen readers. Users relying on assistive technology could not identify or use these actions.

**Before:**
```tsx
<Button variant="secondary" size="small" disabled={shouldDisableSignButton} onClick={() => handleSignClick(row.id)}>
  <PencilRegular />
</Button>
```

**After:**
```tsx
<Button variant="secondary" size="small" aria-label={tTable('button.sign')} disabled={shouldDisableSignButton} onClick={() => handleSignClick(row.id)}>
  <PencilRegular />
</Button>
```

**Translation keys added:**
- `private.facultycertificate.button.sign` (UK: "Підписати", EN: "Sign")
- `private.facultycertificate.button.view` (UK: "Переглянути", EN: "View")

**Impact:** All 9 icon-only buttons across 3 components now have localized `aria-label` attributes, making them accessible to screen reader users.

---

## 3. Replace process.env.X! with validated env.X (ENV-01)

**Files (18 total):**
- `src/lib/env.ts` — Added 5 missing vars to Zod schema
- `src/lib/file-upload.ts`
- `src/app/[locale]/(private)/user-manual/page.tsx`
- `src/app/[locale]/(private)/student-manual/page.tsx`
- `src/app/[locale]/(private)/kpi-documents/page.tsx`
- `src/app/[locale]/(private)/contacts/page.tsx`
- `src/app/[locale]/(private)/accept-code-of-honor/page.tsx`
- `src/app/[locale]/(private)/cards/social-networks-card.tsx`
- `src/app/[locale]/(private)/cards/support-card.tsx`
- `src/app/[locale]/(private)/cards/information-card.tsx`
- `src/app/[locale]/(public)/footer.tsx`
- `src/app/[locale]/(public)/(auth)/login/public-links.tsx`
- `src/app/[locale]/(public)/(auth)/login/kpi-id-login.tsx`
- `src/app/[locale]/(public)/(auth)/login-carousel.tsx`
- `src/app/[locale]/(public)/(auth)/password-reset/layout.tsx`
- `src/app/[locale]/(public)/validate-certificate/certificate-verifier.tsx`
- `src/components/suggestions-form.tsx`
- `src/components/not-found-page.tsx`
- `src/components/logo.tsx`
- `src/components/app-sidebar/footer.tsx`
- `src/widgets/faq/frequently-asked-questions.tsx`

**CWE:** CWE-1188 (Insecure Default Initialization of Resource)

**Problem:** 30+ references to `process.env.NEXT_PUBLIC_*!` used TypeScript's non-null assertion operator (`!`) to bypass type checking. If an environment variable was missing or misspelled, the app would silently use `undefined` at runtime — causing broken links, failed API calls, or blank iframes. No validation occurred at startup.

**Missing vars added to Zod schema:**
- `NEXT_PUBLIC_RECAPTCHA_KEY`
- `NEXT_PUBLIC_CAROUSEL_CDN_BASE_URL`
- `NEXT_PUBLIC_KPI_ID_BUTTON`
- `NEXT_PUBLIC_UNIVERSITY_NEWS`
- `NEXT_PUBLIC_STUDENT_COUNCIL`

**Before:**
```ts
const USER_MANUAL_URL = process.env.NEXT_PUBLIC_USER_MANUAL_URL!;
// ...
<iframe src={process.env.NEXT_PUBLIC_SUGGESTIONS_FORM!} ... />
```

**After:**
```ts
import { env } from '@/lib/env';

const USER_MANUAL_URL = env.NEXT_PUBLIC_USER_MANUAL_URL;
// ...
<iframe src={env.NEXT_PUBLIC_SUGGESTIONS_FORM} ... />
```

**Impact:** All environment variables are now validated at startup via Zod schema in `src/lib/env.ts`. Missing required variables cause a clear build-time error instead of silent runtime failures. The non-null assertion (`!`) is eliminated — types correctly reflect that optional variables may be `undefined`. Zero `process.env` references remain in `src/`.
