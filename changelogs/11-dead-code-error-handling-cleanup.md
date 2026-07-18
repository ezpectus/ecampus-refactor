# Changelog 11 — Dead Code Cleanup, Error Handling Standardization

**Date:** 18.07.2026
**Scope:** 10 files deleted, 6 files modified
**Audit References:** CR-13 (empty catch), CR-04 (useEffect deps), ARCH-01 (Storybook), ARCH-02 (unused components), FT-01 (error handling strategy)

---

## 1. Empty catch block in print-certificate (CR-13)

**File:** `src/app/[locale]/(private)/module/facultycertificate/utils/print-certificate.ts:25`

**Problem:** Empty `catch {}` block silently swallowed errors when setting the iframe document title. While this is a best-effort operation (cross-origin iframe), the empty catch made it impossible to distinguish intentional suppression from a bug.

**Before:**
```ts
} catch {}
```

**After:**
```ts
} catch {
  // Cross-origin iframe — title assignment is best-effort
}
```

**Impact:** Intent is now explicitly documented. The catch still suppresses the error (correct behavior for cross-origin iframes), but the comment makes it clear this is deliberate.

---

## 2. useEffect with state in deps (CR-04) — Already Fixed

**File:** `src/hooks/use-toast.ts:180`

**Problem:** `useEffect` had `[state]` in its dependency array, causing the listener to re-register on every state change.

**Status:** Already fixed in a previous changelog — line 180 now reads `}, []);`. Verified during this audit pass.

---

## 3. Remove unused UI components (ARCH-02)

**Files deleted:**
- `src/components/ui/accordion.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/switch.tsx`

**Dependencies removed from `package.json`:**
- `@radix-ui/react-accordion`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-switch`

**Problem:** These three UI components had zero external imports — only self-references within their own files. They were never used in any page, component, or module.

**Impact:** Reduced bundle size and eliminated 3 unused Radix dependencies.

---

## 4. Remove Storybook (ARCH-01)

**Files/folders deleted:**
- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `.storybook/` (folder)
- `src/stories/Button.stories.tsx`
- `src/stories/` (folder)

**Dependencies removed from `package.json`:**
- `@chromatic-com/storybook`
- `@storybook/addon-essentials`
- `@storybook/addon-links`
- `@storybook/addon-onboarding`
- `@storybook/blocks`
- `@storybook/nextjs`
- `@storybook/react`
- `@storybook/test`
- `eslint-plugin-storybook`
- `storybook`

**Scripts removed from `package.json`:**
- `storybook`
- `build-storybook`

**Problem:** Storybook was configured with only 1 story (`Button.stories.tsx`) and ~50 MB of dependencies. It was not used in CI, not referenced in any documentation, and added significant install time.

**Impact:** ~50 MB of devDependencies removed. Faster `npm install`. Cleaner `package.json`.

---

## 5. Standardize error handling in server actions (FT-01)

### 5a. Missing `response.ok` checks in `certificates.actions.ts`

**File:** `src/actions/certificates.actions.ts`

**Problem:** Three functions had no `response.ok` check, meaning HTTP errors (404, 500, etc.) would silently pass through and `response.json()` would either throw an opaque error or return invalid data.

**Functions fixed:**
- `createCertificateRequest` (mutation) — now throws on non-OK
- `getCertificate` (read) — now throws on non-OK
- `getAllFacultyCertificates` (read) — now throws on non-OK

**Before:**
```ts
export async function createCertificateRequest(body: CertificateRequestBody) {
  await campusFetch('/certificates', { method: 'POST', body: JSON.stringify({ ...body }) });
  revalidatePath('/module/certificates');
}

export async function getCertificate(id: number) {
  const res = await campusFetch<Certificate>(`/certificates/${id}`);
  return res.json();
}
```

**After:**
```ts
export async function createCertificateRequest(body: CertificateRequestBody) {
  const response = await campusFetch('/certificates', { method: 'POST', body: JSON.stringify({ ...body }) });
  if (!response.ok) {
    throw new Error(`${response.status} Error`);
  }
  revalidatePath('/module/certificates');
}

export async function getCertificate(id: number) {
  const res = await campusFetch<Certificate>(`/certificates/${id}`);
  if (!res.ok) {
    throw new Error(`${res.status} Error`);
  }
  return res.json();
}
```

### 5b. `group.actions.ts` — read action throwing instead of returning safe default

**File:** `src/actions/group.actions.ts`

**Problem:** `searchByGroupName` caught errors and re-threw a new Error without the original cause. As a read/search action, it should return an empty array on failure (matching `announcement.actions.ts` convention).

**Before:**
```ts
} catch (error) {
  throw new Error('Error loading groups');
}
```

**After:**
```ts
} catch {
  return [];
}
```

### 5c. `request-certificate-form.tsx` — mutation call without try/catch

**File:** `src/app/[locale]/(private)/module/certificates/components/request-certificate-form.tsx`

**Problem:** `createCertificateRequest` was called without any error handling. If the API returned an error, the form would still call `form.reset()` and appear successful to the user.

**After:** Added try/catch with `useServerErrorToast` for errors and success toast on completion. Added `private.certificate.success` translation key to both `uk.json` and `en.json`.

### 5d. AGENTS.md — Updated error handling convention

**File:** `AGENTS.md`

Updated the server actions section to explicitly document:
- **Throw** on non-OK for mutations and reads where the page cannot render without the data
- **Return a safe default** for list/search reads where the page can render an empty state
- **Always check `response.ok`** — never skip it
- Added `msg.actions.ts` and `profile.actions.ts` as reference examples

---

## Commit message

```
refactor: remove dead code, standardize error handling in actions

- Delete unused UI components: accordion, dropdown-menu, switch
- Remove 3 unused @radix-ui packages from dependencies
- Remove Storybook (.storybook/, src/stories/, 10 devDependencies, 2 scripts)
- Fix empty catch {} in print-certificate.ts — add explanatory comment
- Add missing response.ok checks to 3 functions in certificates.actions.ts
- Change group.actions.ts searchByGroupName to return [] on error (read pattern)
- Add try/catch with error/success toast to certificate request form
- Add private.certificate.success translation key (uk + en)
- Update AGENTS.md with clearer error handling convention docs
```
