# Changelog 08 — Accessibility, Security Hardening, React Anti-Patterns

**Date:** 18.07.2026
**Scope:** `src/app/layout.tsx`, `src/middleware/`, `src/lib/client.ts`, 12 component files
**Audit References:** A-01, E-06, P1-09, R-01

---

## 1. Added `lang` attribute to `<html>` tag (A-01) [WCAG 3.1.1]

**File:** `src/app/layout.tsx:14`

**Problem:** The `<html>` tag had no `lang` attribute. Screen readers cannot determine the page language. WCAG 2.1 Level A violation.

**Before:**
```tsx
<html>
```

**After:**
```tsx
<html lang="uk">
```

**Impact:** Screen readers now announce content in the correct language. Ukrainian is the default locale. The `[locale]/layout.tsx` handles locale switching via `setRequestLocale`.

---

## 2. Code-of-honor middleware: fail safe instead of bypassing (E-06)

**File:** `src/middleware/code-of-honor.middleware.ts:33-35`

**Problem:** If `getUserDetails()` threw (network error, 500, timeout), the catch block silently fell through to `authorizationMiddleware`. This meant a backend outage could bypass code-of-honor enforcement — users who hadn't signed the honor code would get access.

**Before:**
```ts
} catch (error) {
  return authorizationMiddleware(request);
}
```

**After:**
```ts
} catch (error) {
  console.error('Code of honor middleware error:', error);
  return gotoLogin(request);
}
```

**Impact:** On backend failure, users are redirected to login instead of bypassing the honor code check. The error is logged for debugging.

---

## 3. Sanitized IP header forwarding (P1-09) [CWE-20]

**File:** `src/lib/client.ts:30-33, 40-41`

**Problem:** `X-Forwarded-For` and `X-Real-IP` headers from incoming requests were forwarded to the backend without validation. A client could spoof these headers to fake their IP address, potentially bypassing IP-based rate limiting or logging.

**Before:**
```ts
'X-Forwarded-For': resolvedHeaders.get('x-forwarded-for') || '',
'X-Real-IP': resolvedHeaders.get('x-real-ip') || '',
```

**After:**
```ts
const forwardedFor = resolvedHeaders.get('x-forwarded-for');
const realIp = resolvedHeaders.get('x-real-ip');
const sanitizedForwardedFor = forwardedFor ? forwardedFor.split(',')[0].trim() : '';
const sanitizedRealIp = realIp ? realIp.trim() : '';
// ...
'X-Forwarded-For': sanitizedForwardedFor,
'X-Real-IP': sanitizedRealIp,
```

**Impact:** Only the first IP in `X-Forwarded-For` is forwarded (strips chained spoofing attempts). Whitespace is trimmed from both headers. Empty string is sent when headers are absent.

---

## 4. Replaced `key={index}` with stable keys in 12 list renders (R-01)

**Files (12 components):**
- `internal-materials-table.tsx` — `key={row.resourceId}`
- `external-materials-table.tsx` — `key={row.url}`
- `event-plan-table.tsx` — `key={`${row.date}-${row.controlType}`}`
- `journal-table.tsx` — `key={`${row.date}-${row.controlType ?? ''}`}`
- `vedomoststud/table.tsx` — `key={discipline.name}`
- `disciplines-table.tsx` — `key={lecturer.fullName}` (nested)
- `attestationresults/page.tsx` — `key={result.id ?? result.name}`
- `request-certificate-form.tsx` — `key={type.toString()}`
- `info-list.tsx` — `key={item.label}`
- `lecturer-info.tsx` — `key={position.name}`
- `kurator/page.tsx` — `key={contact.name}`
- `colleague-card.tsx` — `key={`${position.name}-${position.subdivision.name}`}`
- `all-docs-table.tsx` — `key={row.documentNumber}`

**Problem:** Using array index as `key` causes rendering bugs when items are reordered, inserted, or deleted. React may reuse the wrong DOM nodes, causing stale state.

**Impact:** All list renders now use stable, unique identifiers from the data. React can correctly track items across re-renders, sorts, and filters.

**Note:** `linkifyText` in `utils.tsx` and `announcements-carousel.tsx` carousel dots intentionally keep `key={index}` — these have no stable identity (text fragments and dot indices respectively).

---

## 5. Root layout: conditional GA + env-based config

**File:** `src/app/layout.tsx`

**Problem:** `GoogleAnalytics` was always rendered with `process.env.NEXT_PUBLIC_GA_ID!` — if the env var was missing, `gaId="undefined"` would be sent to Google.

**Before:**
```tsx
<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
```

**After:**
```tsx
import { env } from '@/lib/env';
// ...
{env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />}
```

**Impact:** GA only loads when the ID is actually configured. No more `gaId="undefined"` requests.
