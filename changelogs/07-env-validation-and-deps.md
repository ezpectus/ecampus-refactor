# Changelog 07 — Environment Validation & Dependency Cleanup

**Date:** 18.07.2026
**Scope:** `src/lib/`, `src/actions/`, `package.json`
**Audit References:** P2-10, D-01

---

## 1. Created `env.ts` with Zod schema validation (P2-10)

**File:** `src/lib/env.ts` (new)

**Problem:** Environment variables were accessed via `process.env.X!` across 20+ files. No validation at startup — if a required URL was missing or malformed, the app would silently break at runtime with cryptic errors.

**Before:**
```ts
// src/lib/client.ts
export const campusFetch = Client(process.env.CAMPUS_API_BASE_PATH!);

// src/lib/file-upload.ts
export const fileUpload = FileUpload(process.env.CAMPUS_API_BASE_PATH!);

// src/actions/auth.actions.ts
const MAIN_COOKIE_DOMAIN = process.env.MAIN_COOKIE_DOMAIN;
const ROOT_COOKIE_DOMAIN = process.env.ROOT_COOKIE_DOMAIN;
const isProduction = process.env.NODE_ENV === 'production';

// src/actions/menu.actions.ts
const OLD_CAMPUS_URL = process.env.OLD_CAMPUS_URL;
```

**After:**
```ts
// src/lib/env.ts (new file)
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CAMPUS_API_BASE_PATH: z.string().url(),
  OLD_CAMPUS_URL: z.string().url().optional(),
  MAIN_COOKIE_DOMAIN: z.string().optional(),
  ROOT_COOKIE_DOMAIN: z.string().optional(),
  // ... all NEXT_PUBLIC_* vars
});

export const env = envSchema.parse(process.env);
```

```ts
// src/lib/client.ts
import { env } from './env';
export const campusFetch = Client(env.CAMPUS_API_BASE_PATH);

// src/lib/file-upload.ts
import { env } from './env';
export const fileUpload = FileUpload(env.CAMPUS_API_BASE_PATH);

// src/actions/auth.actions.ts
import { env } from '@/lib/env';
const MAIN_COOKIE_DOMAIN = env.MAIN_COOKIE_DOMAIN;
const ROOT_COOKIE_DOMAIN = env.ROOT_COOKIE_DOMAIN;
const isProduction = env.NODE_ENV === 'production';

// src/actions/menu.actions.ts
import { env } from '@/lib/env';
const OLD_CAMPUS_URL = env.OLD_CAMPUS_URL;
```

**Impact:** App now fails fast with a clear Zod error message at startup if any required env var is missing or malformed. All `process.env.X!` non-null assertions in server code are replaced with typed `env.X` access. URL-shaped env vars are validated as URLs.

---

## 2. Added 30s timeout to file upload fetch

**File:** `src/lib/file-upload.ts:22`

**Problem:** `fileUpload` had no timeout. A stalled upload would hang indefinitely.

**Before:**
```ts
const response = await fetch(input, {
  method: 'POST',
  cache: 'no-cache',
  body: formData,
  // no timeout
});
```

**After:**
```ts
const response = await fetch(input, {
  method: 'POST',
  cache: 'no-cache',
  signal: AbortSignal.timeout(30000), // 30s for file uploads (longer than 10s default)
  body: formData,
});
```

**Impact:** File uploads now time out after 30 seconds instead of hanging forever. Uses 30s (vs 10s for regular API calls) since file uploads are expected to take longer.

---

## 3. Removed unused npm dependencies (D-01)

**File:** `package.json`

**Problem:** Three dependencies were installed but never imported anywhere in `src/`:
- `date-fns` — the codebase uses `dayjs` exclusively
- `react-day-picker` — no date picker component exists
- `@tanstack/react-table` — all tables use a custom `<Table>` component

**Before:**
```json
"dependencies": {
  "@tanstack/react-table": "^8.21.3",
  "date-fns": "^4.1.0",
  "react-day-picker": "9.11.0",
  // ... 30+ other deps
}
```

**After:** All three removed from `dependencies`.

**Impact:** Reduces `node_modules` size by ~2-3 MB, removes 3 transitive dependency trees, and eliminates confusion about which date/table libraries are used.
