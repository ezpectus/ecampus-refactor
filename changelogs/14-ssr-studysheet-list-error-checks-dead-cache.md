# Changelog 14 — SSR Conversion, Missing Error Checks, Dead Cache Option

**Date:** 18.07.2026
**Scope:** 4 files modified, 1 file created
**Audit References:** CR-07/PERF-03 (SSR conversion), AGENTS.md §3 (response.ok checks)

---

## 1. Convert studysheet list page to server component (2 files)

**Files:**
- `src/app/[locale]/(private)/module/studysheet/page.tsx` (modified)
- `src/app/[locale]/(private)/module/studysheet/components/study-sheet-content.tsx` (created)

**Problem:** The studysheet list page followed the same anti-pattern as the `[id]` page did before changelog 12: `page.tsx` was a thin server component that just rendered `<StudySheet />`, a client component that fetched data via `useEffect` + `useState` with a loading spinner. This caused:
- Unnecessary loading spinner flash
- No SSR benefit — data fetched on client only
- Waterfall: page shell → JS bundle → data fetch

**Fix:** Same pattern as changelog 12's `[id]` conversion:
- `page.tsx` now fetches `getMonitoring()` on the server and passes `sheet` as a prop
- New `study-sheet-content.tsx` client component handles interactive filtering (`useLocalStorage`, `useMemo`) with the pre-fetched data
- Removed `useEffect`, `useState`, `useCallback`, `useServerErrorToast`, `LoadingScreen` from the client component — no longer needed

**Impact:** Eliminates client-side loading spinner, data is available immediately on first render. Filter interactivity preserved via `useLocalStorage` in the client wrapper.

---

## 2. Add missing response.ok checks in profile.actions.ts (1 file)

**File:** `src/actions/profile.actions.ts`

**Problem:** 6 mutation functions (`createContact`, `updateContact`, `deleteContact`, `updateIntellectInfo`, `acceptCodeOfHonor`, `acceptPrivacyConsent`) had `try/catch` blocks but **no `response.ok` check**. This means if the API returned a 400 or 500 response, the function would silently succeed — only network errors (which throw from `fetch` itself) would be caught. The `revalidateTag` / `redirect` calls would execute even on failed mutations.

Per AGENTS.md §3: "Always check `response.ok` — never skip it."

**Fix:** Added `if (!response.ok) throw new Error(...)` before `revalidateTag` / `redirect` in all 6 functions. The outer `try/catch` wraps the thrown error with context.

**Impact:** Failed mutations now correctly throw and surface errors to the user via `useServerErrorToast` in the calling components, instead of silently succeeding and revalidating stale data.

---

## 3. Remove dead `cache: 'no-cache'` from file-upload.ts (1 file)

**File:** `src/lib/file-upload.ts`

**Problem:** The `fileUpload` function used `cache: 'no-cache'` in its `fetch` options. However, this is a POST request — Next.js never caches POST requests, so this option is dead code. It was also the last remaining `cache: 'no-cache'` in the codebase after changelog 12 replaced the one in `campusFetch`.

**Fix:** Removed the `cache: 'no-cache'` line. The `AbortSignal.timeout(30000)` and `response.ok` check remain.

**Impact:** Cleaner code, no misleading cache option. Zero behavioral change (POST was never cached).

---

## Commit message

```
refactor: SSR studysheet list, add response.ok checks, remove dead cache option

- Convert studysheet list page to server component (same pattern as [id]
  in changelog 12) — fetch getMonitoring() on server, pass to new
  StudySheetContent client wrapper for filter interactivity
- Add response.ok checks to 6 mutations in profile.actions.ts
  (createContact, updateContact, deleteContact, updateIntellectInfo,
  acceptCodeOfHonor, acceptPrivacyConsent) — silently succeeded on
  4xx/5xx before
- Remove cache: 'no-cache' from file-upload.ts — POST requests are
  never cached, this was the last remaining no-cache in codebase
```
