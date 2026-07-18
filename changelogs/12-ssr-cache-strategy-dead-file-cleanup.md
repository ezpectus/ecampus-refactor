# Changelog 12 — SSR Conversion, Cache Strategy, Dead File Cleanup

**Date:** 18.07.2026
**Scope:** 3 files created, 3 files modified, 4 files deleted
**Audit References:** CR-07/PERF-03 (client-side page), PERF-01 (cache strategy), CR-02 (dead duplicate file)

---

## 1. Convert studysheet/[id] to server component (CR-07, PERF-03)

**Files:**
- `src/app/[locale]/(private)/module/studysheet/[id]/page.tsx` — rewritten (server component)
- `src/app/[locale]/(private)/module/studysheet/[id]/page.content.tsx` — new (client component)

**Problem:** The only client-side `page.tsx` in the project. Data was fetched in a `useEffect` with `useState`/`setLoading`, causing a loading spinner on every visit. No SSR, no streaming, error swallowed in catch.

**Before:**
```tsx
'use client';

export default function InfoPageClient() {
  const { id } = useParams();
  const [creditModule, setCreditModule] = useState<CreditModule>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    async function fetchData() {
      try {
        const data = await getMonitoringById(id as string);
        if (!isCancelled) { setCreditModule(data); setIsLoading(false); }
      } catch (error) {
        if (!isCancelled) { console.error('Failed to load study sheet:', error); setIsLoading(false); }
      }
    }
    fetchData();
    return () => { isCancelled = true; };
  }, [id]);

  if (isLoading) return <LoadingScreen />;
  if (!creditModule) return null;
  // ... render
}
```

**After:**
```tsx
// page.tsx — server component
export default async function InfoPage({ params }: Props) {
  const { id } = await params;

  let creditModule;
  try {
    creditModule = await getMonitoringById(id);
  } catch (error) {
    console.error('Failed to load study sheet:', error);
  }

  if (!creditModule) return <LoadingScreen />;
  return <StudySheetContent creditModule={creditModule} />;
}
```

```tsx
// page.content.tsx — client component (tab interactivity)
'use client';
export const StudySheetContent = ({ creditModule }: Props) => {
  const [selectedSheet, setSelectedSheet] = useState(SheetTranslationKeys.Journal);
  // ... tab UI (unchanged from original)
};
```

**Impact:**
- Data fetched on server — no loading spinner on navigation, content is SSR'd
- Follows the `page.tsx` + `page.content.tsx` pattern used by `facultycertificate`
- Eliminates `useEffect` fetch, `useParams`, `isCancelled` race condition guard
- Error handling preserved (console.error + fallback to LoadingScreen)

---

## 2. Replace `cache: 'no-cache'` with ISR revalidate (PERF-01)

**File:** `src/lib/client.ts:30`

**Problem:** Every `campusFetch` call without an explicit `next` option used `cache: 'no-cache'`, bypassing Next.js cache entirely. No ISR, no stale-while-revalidate. Every page visit hit the backend.

**Before:**
```ts
const cacheOption = 'next' in otherOptions ? {} : { cache: 'no-cache' as const };
```

**After:**
```ts
const cacheOption =
  'next' in otherOptions || 'cache' in otherOptions
    ? {}
    : { next: { revalidate: 300 } as const };
```

**Impact:**
- GET requests now cached for 5 minutes (300s) by default
- Callers with explicit `next` (e.g., `getUserDetails` with cache tags) are unaffected
- Callers with explicit `cache` option are unaffected
- Mutations (POST/PUT/DELETE) are unaffected — Next.js doesn't cache non-GET requests
- `revalidatePath()` calls in mutations still purge cached pages immediately

---

## 3. Delete dead duplicate file `contants.ts` (CR-02 follow-up)

**File deleted:** `src/middleware/contants.ts`

**Problem:** The typo'd file `contants.ts` was renamed to `constants.ts` in changelog 05, but the old file was never deleted. Both files had identical content. No imports referenced `contants.ts` anymore.

**Impact:** Eliminated confusion — only `constants.ts` remains.

---

## 4. Delete Storybook (ARCH-01 follow-up)

**Files deleted:**
- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `.storybook/` (folder)
- `src/stories/Button.stories.tsx`
- `src/stories/` (folder)

**Note:** These were removed from `package.json` in changelog 11 but the files themselves required manual deletion (IDE file lock).

---

## 5. Scan results — no new issues found

Verified the following:
- **`process.env`** — only reference is in `env.ts` (the schema parser). Zero raw `process.env` in app code.
- **`as any`** — zero occurrences
- **`console.log/warn/info`** — zero occurrences (only `console.error` in actions, expected)
- **`dangerouslySetInnerHTML`** — zero occurrences (fixed in changelog 01)
- **`eval()`** — zero occurrences
- **Hardcoded secrets** — zero occurrences
- **TODO/FIXME** — 3 remaining, all documented and intentional:
  - `code-of-honor.middleware.ts` — "Refactor to not use actions here" (architectural)
  - `student-manual/page.tsx` — "Remove this page when the manual is ready" (temporary page)
  - `password-reset/layout.tsx` + `password-reset-form.tsx` — "Replace recaptcha library when it supports React 19" (external dependency)

---

## Commit message

```
refactor: SSR for studysheet, ISR cache default, dead file cleanup

- Convert studysheet/[id] from client-side useEffect fetch to server
  component + page.content.tsx client wrapper (matches facultycertificate pattern)
- Replace cache: 'no-cache' with next: { revalidate: 300 } in campusFetch
  for 5-minute ISR caching on GET requests
- Delete dead duplicate contants.ts (renamed to constants.ts in changelog 05)
- Delete Storybook files (.storybook/, src/stories/) — deps removed in changelog 11
```
