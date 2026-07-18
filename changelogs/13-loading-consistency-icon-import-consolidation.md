# Changelog 13 — Loading Consistency, Icon Import Consolidation

**Date:** 18.07.2026
**Scope:** 11 files modified, 0 files created, 0 files deleted
**Audit References:** AGENTS.md §5 (icon imports), §9 (shared components)

---

## 1. Replace inline loading spinners with shared LoadingScreen (2 files)

**Files:**
- `src/app/[locale]/(private)/module/directory/loading.tsx`
- `src/app/[locale]/(private)/module/msg/loading.tsx`

**Problem:** These two `loading.tsx` files duplicated the `LoadingScreen` component's markup inline — importing `SpinnerGap` directly and wrapping it in a `div` with the same classes. Other loading files (`vedomoststud`, `announcementseditor`) already use `<LoadingScreen />`.

**Before:**
```tsx
import SpinnerGap from '../../../../images/icons/SpinnerGap.svg';
import React from 'react';

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <SpinnerGap />
    </div>
  );
}
```

**After:**
```tsx
import { LoadingScreen } from '@/components/loading-screen';

export default function Loading() {
  return <LoadingScreen />;
}
```

**Impact:** Single source of truth for loading UI. If the spinner design changes, only `LoadingScreen` needs updating.

---

## 2. Deduplicate IconPosition type (1 file)

**File:** `src/components/ui/text-button.tsx`

**Problem:** `text-button.tsx` declared `type IconPosition = 'start' | 'end'` locally, duplicating the shared type in `src/components/types.ts` that `button.tsx` already imports from.

**Fix:** Removed the local declaration, imported from `../types` (same as `button.tsx`).

---

## 3. Consolidate all SVG icon imports to central `@/app/images` index (10 files)

**Files:**
- `src/components/ui/button.tsx` — `SpinnerGap`
- `src/components/ui/text-button.tsx` — `SpinnerGap`
- `src/components/ui/sort-icon.tsx` — `CaretUp`, `CaretDown`
- `src/components/ui/password-input.tsx` — `EyeRegular`, `EyeClosedRegular`
- `src/components/ui/carousel.tsx` — `CaretLeftRegular`, `CaretRightRegular`
- `src/app/[locale]/(private)/notice-board/components/notice-list.tsx` — `MagnifyingGlassRegular`
- `src/app/[locale]/(private)/settings/settings-form.tsx` — `EnvelopeSimple`
- `src/app/[locale]/(public)/auth-nav-layout.tsx` — `CaretLeftRegular`
- `src/app/[locale]/(public)/(support)/curator-search/curator-search.tsx` — `MagnifyingGlassRegular`
- `src/app/[locale]/(public)/(auth)/login/public-links.tsx` — `LifebuoyOutline`, `Student`, `Chats`

**Problem:** Per AGENTS.md §5, SVG icons should be imported from the central index at `@/app/images`. Many files bypassed this, importing directly from `@/app/images/icons/*.svg` or using deep relative paths like `../../../../images/icons/*.svg`. This breaks the convention and makes it harder to audit which icons are used.

**Fix:** Changed all imports to use `import { IconName } from '@/app/images'`.

**Additional change:** Added `CaretUp` and `CaretDown` (plain, without weight suffix) to the central `@/app/images/index.ts` — they existed as SVG files but were not exported from the index.

**Impact:**
- Zero direct SVG path imports remain in the codebase
- All icon usage is auditable from the single `index.ts` barrel file
- Consistent `@/` path alias usage (no deep relative paths)

---

## Commit message

```
refactor: consolidate icon imports, deduplicate types, loading consistency

- Replace inline loading spinners in directory/ and msg/ with shared
  LoadingScreen component (matches vedomoststud, announcementseditor)
- Remove duplicate IconPosition type in text-button.tsx — import from
  shared ../types (same as button.tsx)
- Consolidate all direct SVG icon imports to central @/app/images index
  (10 files, per AGENTS.md §5 convention)
- Add CaretUp and CaretDown to @/app/images/index.ts (existed as SVG
  files but were not exported)
```
