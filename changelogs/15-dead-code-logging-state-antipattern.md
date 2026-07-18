# Changelog 15 — Dead Code, Redundant Logging, State Anti-Pattern

**Date:** 18.07.2026
**Scope:** 4 files modified, 1 file deleted
**Audit References:** AGENTS.md §3 (error handling), React docs (adjusting state during render)

---

## 1. Delete dead `study-sheet.tsx` (1 file deleted)

**File:** `src/app/[locale]/(private)/module/studysheet/components/study-sheet.tsx` (deleted)

**Problem:** In changelog 14, the studysheet list page was converted to SSR. The old `StudySheet` client component (which fetched data via `useEffect`) was replaced by `StudySheetContent` (which receives data as props). The old file was left behind as dead code.

**Fix:** Deleted `study-sheet.tsx`. Verified no imports reference it.

---

## 2. Remove redundant `console.error` before re-throw (2 files)

**Files:**
- `src/actions/announcement.actions.ts` — 3 functions: `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`
- `src/actions/certificates.actions.ts` — 1 function: `getCertificatePDF`

**Problem:** These functions had `catch (error) { console.error(...); throw error; }` — the `console.error` is redundant because:
1. The error is re-thrown and caught by the caller, which shows a toast
2. Server-side `console.error` in production goes to server logs, not user-facing UI
3. The error message from `throw new Error(...)` already contains the status code

**Fix:** Removed `console.error` lines, kept the `throw error` (or simplified to just `throw`).

**Impact:** Cleaner error handling, no redundant server-side logging. The caller's `useServerErrorToast` handles user notification.

---

## 3. Fix `announcements-filters.tsx` state sync anti-pattern (1 file)

**File:** `src/app/[locale]/(private)/module/announcementseditor/components/announcements-filters.tsx`

**Problem:** Used `useEffect` to sync `searchValue` state from the `search` URL param:

```tsx
const [searchValue, setSearchValue] = useState(search);

useEffect(() => {
  setSearchValue(search);
}, [search]);
```

This is the classic "sync state to props" anti-pattern. It causes an extra render cycle: prop changes → render → effect runs → state updates → re-render.

**Fix:** Replaced with React-recommended "adjust state during render" pattern:

```tsx
const [searchValue, setSearchValue] = useState(search);
const [prevSearch, setPrevSearch] = useState(search);
if (search !== prevSearch) {
  setPrevSearch(search);
  setSearchValue(search);
}
```

This adjusts state during render (no extra render cycle). React handles this pattern efficiently — it's documented in the official React docs under "You Might Not Need an Effect".

**Impact:** Eliminates one unnecessary render cycle when URL search param changes. Input still updates immediately when user types (local state), and syncs when URL changes externally (e.g., clearing filters).

---

## 4. Audit remaining actions for `response.ok` checks (audit only)

**Files audited:**
- `src/actions/certificates.actions.ts` — all 10 functions have `response.ok` checks
- `src/actions/msg.actions.ts` — all 9 functions have `response.ok` checks
- `src/actions/auth.actions.ts` — all functions have `response.ok` checks (or equivalent status range check)

**Result:** No missing checks found. All three files are clean.

---

## 5. Client-facing functionality doc (gitignored)

**File:** `docs/client-functionality-overview.md` (created, added to `.gitignore`)

**Purpose:** Detailed Russian-language document describing all portal functionality after refactoring. Intended for client presentation. Not committed to the repository — stays local only.

**Contents:**
- Architecture overview (SSR, ISR, caching)
- All 14 internal modules with feature descriptions
- Public pages (login, certificate verification, curator search)
- Security measures (JWT, cookies, env validation, URL validation)
- UI/UX improvements (loading, icons, accessibility)
- Tech stack table
- Project structure
- Refactoring summary (performance, security, code quality, accessibility)

---

## Commit message

```
refactor: dead code cleanup, redundant logging, state anti-pattern fix

- Delete dead study-sheet.tsx (replaced by study-sheet-content.tsx
  in changelog 14)
- Remove redundant console.error before re-throw in 4 functions
  (announcement.actions: create/update/delete, certificates.actions:
  getCertificatePDF) — caller catches and shows toast
- Fix announcements-filters.tsx: replace useEffect state sync with
  React-recommended "adjust state during render" pattern (eliminates
  extra render cycle)
- Audit certificates, msg, auth actions for response.ok checks —
  all clean
- Add client-facing functionality doc (gitignored, for client
  presentation)
```
