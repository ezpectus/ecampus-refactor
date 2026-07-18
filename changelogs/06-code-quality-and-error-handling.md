# Changelog 06 — Code Quality & Error Handling (Phase 3)

**Date:** 18.07.2026
**Scope:** `src/app/`, `src/actions/`, `src/i18n/`, `src/hooks/`, `next.config.mjs`
**Audit References:** Q-05, Q-06, Q-08, Q-12, E-02, E-03, E-04, E-05, P2-11, P2-12, R-03, R-04

---

## 1. Replaced `any` type in API response helpers (Q-05)

**File:** `src/app/api/responses.ts:3`

**Problem:** `okResponse` accepted `data?: any`, bypassing TypeScript's type safety entirely.

**Before:**
```ts
export const okResponse = (data?: any) =>
```

**After:**
```ts
export const okResponse = <T = unknown>(data?: T) =>
```

**Impact:** Callers now get proper type inference for response data instead of `any`.

---

## 2. Replaced `as any` cast in i18n locale check (Q-06)

**File:** `src/i18n/request.tsx:9`

**Problem:** `locale as any` bypassed type safety when checking if the locale is valid.

**Before:**
```ts
if (!locale || !routing.locales.includes(locale as any)) {
```

**After:**
```ts
if (!locale || !routing.locales.includes(locale as string)) {
```

**Impact:** More precise cast — `string` is the correct type for a locale value.

---

## 3. Replaced deprecated `FC` type in Header (Q-08)

**File:** `src/app/[locale]/(private)/header.tsx:3,24`

**Problem:** `FC` (FunctionComponent) is deprecated in React 19. The rest of the codebase uses direct prop typing.

**Before:**
```tsx
import { FC, useEffect, useRef, useState } from 'react';
// ...
export const Header: FC<Props> = ({ user }) => {
```

**After:**
```tsx
import { useEffect, useRef, useState } from 'react';
// ...
export const Header = ({ user }: Props) => {
```

**Impact:** Aligns with React 19 conventions and the codebase's arrow-export pattern. Removes unused `FC` import.

---

## 4. Fixed `sleep(5000)` in Header with proper cleanup (R-03)

**File:** `src/app/[locale]/(private)/header.tsx:37-51`

**Problem:** Used `await sleep(5000)` from `radash` inside `useEffect`. If the component unmounts during the sleep, `setProfilePhotoUrl` is called on an unmounted component (React warning). No cleanup possible with `await sleep`.

**Before:**
```tsx
useEffect(() => {
  const setProfilePhotoUrl = () => setProfilePhoto(getUniqueUserPhotoUrl(user.photo));

  const deferProfileImageUpdate = async () => {
    await sleep(5000);
    setProfilePhotoUrl();
  };

  if (firstRender.current) {
    setProfilePhotoUrl();
    firstRender.current = false;
  } else {
    deferProfileImageUpdate();
  }
}, [user]);
```

**After:**
```tsx
useEffect(() => {
  const setProfilePhotoUrl = () => setProfilePhoto(getUniqueUserPhotoUrl(user.photo));

  if (firstRender.current) {
    setProfilePhotoUrl();
    firstRender.current = false;
  } else {
    const timer = setTimeout(() => setProfilePhotoUrl(), 5000);
    return () => clearTimeout(timer);
  }
}, [user]);
```

**Impact:** Proper cleanup prevents setState-on-unmounted-component warnings. Removes `radash` sleep dependency from this file.

---

## 5. Added `aria-label` to icon-only logout button (A-02)

**File:** `src/app/[locale]/(private)/header.tsx:82`

**Problem:** The logout button had no text or `aria-label`. Screen readers announced it as "button" with no context.

**Before:**
```tsx
<Button variant="secondary" icon={<SignOut />} onClick={handleLogout} />
```

**After:**
```tsx
<Button variant="secondary" icon={<SignOut />} onClick={handleLogout} aria-label={t('button.logout')} />
```

**Impact:** Screen readers now announce "Logout" (or localized equivalent) instead of generic "button".

---

## 6. Error boundary renders fallback UI instead of empty fragment (E-05)

**File:** `src/app/[locale]/(private)/error.tsx`

**Problem:** When a rendering error occurred in any private route, the user saw a blank white page. A toast was shown, but if the toast system itself was broken, there was zero feedback and no recovery option.

**Before:**
```tsx
export default function Error() {
  const { errorToast } = useServerErrorToast();

  useEffect(() => {
    errorToast();
  }, []);

  return <></>;
}
```

**After:**
```tsx
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { errorToast } = useServerErrorToast();
  const t = useTranslations('global.error');

  useEffect(() => {
    errorToast();
  }, [errorToast]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <Heading2>{t('title')}</Heading2>
      <Paragraph>{t('description')}</Paragraph>
      <Button variant="primary" onClick={reset}>
        {t('retry')}
      </Button>
    </div>
  );
}
```

**Translation keys added:** `global.error.title`, `global.error.description`, `global.error.retry` (both `uk.json` and `en.json`).

**Impact:** Users now see an error message with a "Try again" button instead of a blank page. Uses Next.js `reset()` for recovery.

---

## 7. Added `response.ok` check in `getContacts`/`getContactTypes` (E-02)

**File:** `src/actions/profile.actions.ts:10-28`

**Problem:** If the server returned 401/403/500, `response.json()` might throw (if body isn't JSON) or return an error object that doesn't match `Contact[]`. The catch returned `[]`, hiding the error.

**Before:**
```ts
export async function getContacts() {
  try {
    const response = await campusFetch<Contact[]>('profile/contacts');
    return response.json();
  } catch (error) {
    return [];
  }
}
```

**After:**
```ts
export async function getContacts() {
  try {
    const response = await campusFetch<Contact[]>('profile/contacts');
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return [];
  }
}
```

**Impact:** Prevents attempting to parse non-JSON error responses as `Contact[]`. Same fix applied to `getContactTypes`.

---

## 8. Preserved original errors in `profile.actions.ts` mutations (E-03)

**File:** `src/actions/profile.actions.ts` (6 mutation functions)

**Problem:** Every mutation caught the original error and threw a new generic one. The original error (network timeout, 401, 500, validation error) was lost.

**Before:**
```ts
} catch (error) {
  throw new Error('Error while creating contact');
}
```

**After:**
```ts
} catch (error) {
  throw new Error('Error while creating contact', { cause: error });
}
```

**Impact:** The original error is now preserved via `Error.cause`, enabling better debugging without changing the thrown error message. Applied to all 6 mutations: `createContact`, `updateContact`, `deleteContact`, `updateIntellectInfo`, `acceptCodeOfHonor`, `acceptPrivacyConsent`.

---

## 9. Fixed `resetPassword` error handling (P2-12)

**File:** `src/actions/auth.actions.ts:100-102`

**Problem:** All errors (network timeout, 500, 502, actual 400) were replaced with "Bad request". The client never knew the real cause.

**Before:**
```ts
} catch (error) {
  throw new Error('Bad request');
}
```

**After:**
```ts
} catch (error) {
  if (error instanceof Error) throw error;
  throw new Error('Unknown error during password reset');
}
```

**Impact:** Original errors are now re-thrown instead of being masked. The client can distinguish between network errors, server errors, and bad requests.

---

## 10. Improved `loginWithCredentials` error logging (P2-11)

**File:** `src/actions/auth.actions.ts:58-60`

**Problem:** All non-2xx responses returned `null` with no logging. The client couldn't distinguish between wrong password and server error.

**Before:**
```ts
if (response.status < 200 || response.status >= 300) {
  return null;
}
```

**After:**
```ts
if (!response.ok) {
  console.error('Login failed:', response.status);
  return null;
}
```

**Impact:** Server-side logging now records the HTTP status code on login failure, aiding debugging without changing the client-facing return type.

---

## 11. Fixed empty catch block in studysheet page (E-04)

**File:** `src/app/[locale]/(private)/module/studysheet/[id]/page.tsx:41-43`

**Problem:** Error was silently swallowed. No logging, no error state. User saw a blank page.

**Before:**
```ts
} catch (error) {
  setIsLoading(false);
}
```

**After:**
```ts
} catch (error) {
  console.error('Failed to load study sheet:', error);
  setIsLoading(false);
}
```

**Impact:** Errors are now logged to the server console, aiding debugging while maintaining the same user-facing behavior (loading stops, blank state shown).

---

## 12. Extracted duplicate SVG config in `next.config.mjs` (Q-12)

**File:** `next.config.mjs`

**Problem:** The same SVGO config (`removeViewBox: false`) was duplicated for Turbopack and webpack. If one was updated, the other might be forgotten.

**Before:**
```js
// Turbopack config (lines 7-31)
svgoConfig: { plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }] }

// Webpack config (lines 56-93)
svgoConfig: { plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }] }
```

**After:**
```js
const svgoConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: { overrides: { removeViewBox: false } },
    },
  ],
};

// Used in both turbopack and webpack configs
```

**Impact:** Single source of truth for SVGO configuration. Updates only need to happen in one place.

---

## 13. Added Suspense fallbacks (R-04)

**Files:**
- `src/app/[locale]/(private)/notice-board/page.tsx:33`
- `src/app/[locale]/(public)/header.tsx:14`
- `src/app/[locale]/(public)/(auth)/password-reset/success/page.tsx:45`

**Problem:** `<Suspense>` without a `fallback` prop renders `null` while suspended. User sees a blank area with no loading indicator.

**Before:**
```tsx
<Suspense>
  <NoticeList announcements={announcements} />
</Suspense>
```

**After:**
```tsx
<Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">{t('loading')}</div>}>
  <NoticeList announcements={announcements} />
</Suspense>
```

**Translation keys added:** `private.notice-board.loading`, `auth.passwordReset.success.loading` (both `uk.json` and `en.json`).

**Impact:** Users now see a loading indicator while Suspense boundaries are loading, instead of a blank area.
