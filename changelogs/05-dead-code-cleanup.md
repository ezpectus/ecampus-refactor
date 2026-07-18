# Changelog 05 — Dead Code Cleanup (Phase 2)

**Date:** 18.07.2026
**Scope:** `src/middleware/`, `src/hooks/`, `src/components/`
**Audit References:** Q-02, Q-04, D-03

---

## 1. Filename typo: `contants.ts` → `constants.ts` (Q-02)

**File:** `src/middleware/contants.ts` → `src/middleware/constants.ts`

**Problem:** The filename was misspelled ("contants" instead of "constants"). Imported by 4 files:
- `src/middleware/authentication.middleware.ts`
- `src/middleware/authorization.middleware.ts`
- `src/middleware/code-of-honor.middleware.ts`
- `src/middleware/utils.ts`

**Before:**
```ts
import { PUBLIC_PATHS } from './contants';
import { MODULES_BASE_PATH } from './contants';
import { CODE_OF_HONOR_PATH } from './contants';
import { LOGIN_PATH, NOT_FOUND_PATH, ROOT_PATH } from './contants';
```

**After:**
```ts
import { PUBLIC_PATHS } from './constants';
import { MODULES_BASE_PATH } from './constants';
import { CODE_OF_HONOR_PATH } from './constants';
import { LOGIN_PATH, NOT_FOUND_PATH, ROOT_PATH } from './constants';
```

**Impact:** Correct filename improves code searchability and removes a long-standing typo that could confuse new developers.

---

## 2. `useEffect` deps fix in `use-toast.ts` (Q-04)

**File:** `src/hooks/use-toast.ts:180`

**Problem:** `state` was in the dependency array of `useEffect`, causing the effect to re-run (unregister + re-register listener) on every state change. The listener registration should only happen once on mount.

**Before:**
```ts
React.useEffect(() => {
  listeners.push(setState);
  return () => {
    const index = listeners.indexOf(setState);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}, [state]);
```

**After:**
```ts
React.useEffect(() => {
  listeners.push(setState);
  return () => {
    const index = listeners.indexOf(setState);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}, []);
```

**Impact:** Eliminates unnecessary listener re-registration on every toast state change, reducing memory churn and preventing potential race conditions in the toast system.

---

## 3. Deleted unused file: `src/components/types.ts` (D-03)

**File:** `src/components/types.ts` (deleted)

**Problem:** The file contained a single type export (`IconPosition = 'start' | 'end'`) with zero imports across the entire codebase.

**Before:**
```ts
// src/components/types.ts
export type IconPosition = 'start' | 'end';
```

**After:** File deleted. No imports to update.

**Impact:** Removes dead code that could mislead developers into thinking `IconPosition` is used somewhere.
