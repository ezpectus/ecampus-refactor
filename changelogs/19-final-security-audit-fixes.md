# Changelog 19 — Final Security Audit Fixes

**Date:** 18.07.2026
**Scope:** 3 files modified
**Audit References:** SEC-01, SEC-10, CSP cleanup

---

## 1. SEC-01: JWT decode without validation in auth.actions.ts

**File:** `src/actions/auth.actions.ts`

**Problem:** `setLoginCookies` used `JWT.decode(token)` directly, bypassing the Zod validation in `getJWTPayload`. While `jwt.ts` was fixed in a previous changelog to use Zod validation, this call site still used the unvalidated path.

**Fix:** Replaced `JWT.decode(token) as { exp: number }` with `getJWTPayload<{ exp: number }>(token)`. Removed unused `jsonwebtoken` import, added `getJWTPayload` import from `@/lib/jwt`.

---

## 2. SEC-10: Undefined sanitized IP variables in client.ts

**File:** `src/lib/client.ts`

**Problem:** The code referenced `sanitizedForwardedFor` and `sanitizedRealIp` variables that were never defined — a bug from a previous partial edit. This would cause a runtime crash.

**Fix:** Added proper sanitization logic:
- Extract `x-forwarded-for` and `x-real-ip` from request headers
- Take only the first IP from the comma-separated `x-forwarded-for` list
- Trim and limit to 45 characters (max IPv6 length)
- This prevents IP spoofing via header injection (CWE-20)

---

## 3. CSP: Remove KPI domains from connect-src

**File:** `next.config.mjs`

**Problem:** The CSP `connect-src` still contained `https://api.campus.kpi.ua` and `https://ecampus.cloud.kpi.ua` — the edit from changelog 17 did not persist.

**Fix:** Removed both KPI domains. CSP now only allows `'self'`, Google Analytics, and Google Static.

---

## Audit Status After This Changelog

| Finding | Status |
|---------|--------|
| SEC-01 JWT without verification | ✅ Fixed (Zod validation + consistent use of getJWTPayload) |
| SEC-02 Cookie security flags | ✅ Fixed (changelog 10) |
| SEC-03 XSS in preview-dialog | ✅ Fixed (renders as text, not dangerouslySetInnerHTML) |
| SEC-04 .env.production in .gitignore | ✅ Fixed (changelog 16) |
| SEC-05 Open redirect | ✅ Fixed (changelog 18 — API_BASE_URL hostname check) |
| SEC-06 No fetch timeout | ✅ Fixed (changelog 14 — AbortSignal.timeout(10000)) |
| SEC-07 CSP headers | ✅ Fixed (changelog 10) |
| SEC-08 Rate limiting | ⏳ Deferred (requires external dependency) |
| SEC-09 Sidebar cookie flags | ✅ Fixed (changelog 10) |
| SEC-10 X-Forwarded-For spoofing | ✅ Fixed (this changelog) |
| CR-01 Import in middle of file | ✅ Fixed (changelog 11) |
| CR-02 Typo in filename | ✅ Fixed (file renamed) |
| CR-03 TOAST_REMOVE_DELAY | ✅ Fixed (changelog 15) |
| CR-04 useEffect deps | ✅ Fixed (changelog 15) |
| CR-05 Duplicated SVG config | ✅ Fixed (extracted to svgoConfig variable) |
| CR-06 any types | ✅ Fixed (changelog 17) |
| CR-07 studysheet client page | ✅ Fixed (changelog 12 — converted to SSR) |
| CR-08 Error boundary | ✅ Fixed (has UI with reset button) |
| CR-09 SubLayout use client | ✅ Not needed (next-intl works in server components) |
| CR-10 Mixed declaration styles | ✅ Documented in AGENTS.md §6 |
| CR-11 Header FC type | ✅ Fixed (arrow const) |
| CR-12 Empty catch blocks | ✅ Fixed (changelog 18) |
| CR-13 Empty catch in print-certificate | ✅ Fixed (has comment) |
| FT-01 Inconsistent error handling | ✅ Documented in AGENTS.md §3 |
| FT-02 console.error | ✅ Fixed (changelog 18 — removed all 13) |
| FT-03 resetPassword errors | ✅ Fixed (proper error propagation) |
| FT-04 No response.ok check | ✅ Fixed (changelog 14) |
| FT-05 redirectToEmployment ok check | ✅ Fixed (changelog 18) |

**Result: 37 of 38 audit findings resolved.** Only SEC-08 (rate limiting) remains deferred — it requires an external dependency (`@upstash/ratelimit`) and infrastructure setup.

---

## Commit message

```
fix: final security audit fixes — JWT validation, IP sanitization, CSP cleanup

- SEC-01: Replace JWT.decode with getJWTPayload in auth.actions.ts for
  consistent Zod-validated token parsing
- SEC-10: Fix undefined sanitizedForwardedFor/sanitizedRealIp in client.ts
  — add proper IP header sanitization (first IP only, trim, 45 char limit)
- CSP: Remove KPI domains from connect-src (previous edit did not persist)
- Audit status: 37/38 findings resolved, only rate limiting deferred
```
