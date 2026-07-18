# eCampus KPI — Legacy Refactoring

> Production university portal refactored from prototype to maintainable product.
> 200+ files, 48 modules, ~50k users. Security audit (CWE-mapped), architecture redesign, code quality overhaul.

---

## Why This Repo Exists

I'm a Software Engineering student at Igor Sikorsky Kyiv Polytechnic Institute (KPI) — the same university that runs this portal. I've solved 3000+ algorithm problems across LeetCode, HackerRank, and Codeforces, and built full-stack projects in .NET and React. But algorithm problems are clean — they have a single correct answer. **Real codebases don't.**

That's why I picked the hardest thing I had access to: my own university's production portal. eCampus KPI serves ~50,000 students and staff. It works. People use it daily. And like most legacy systems, it accumulated technical debt — security gaps, inconsistent patterns, architectural shortcuts that made sense at the time but don't hold up.

I didn't fork a tutorial repo or generate a starter project. I took a system that real people depend on and treated it the way a senior engineer would treat a client engagement:

1. **Audit first** — read every file, trace every data flow, map every vulnerability to its CWE ID
2. **Document before touching code** — 5 audit documents, 66 issues with exact `file:line` references
3. **Fix in priority order** — P0 security first (things that could get users hurt), then P1, then quality
4. **Prove every change** — before/after code, root cause, rationale, and changelog for every single fix

**This is the work I want to do professionally.** Not write new features from scratch — take systems that already exist, understand them deeply, and make them robust. That's harder than greenfield development, and it's what most engineering jobs actually involve.

---

## What I Did

### Phase 1: Audit

Conducted a systematic code audit covering security, architecture, code quality, and accessibility:

- **66 code-level issues** identified with exact `file:line` references
- **38 architectural issues** documented with diagrams
- Vulnerabilities mapped to **CWE IDs** (CWE-79 XSS, CWE-614 cookie security, CWE-601 open redirect, CWE-20 input validation, etc.)
- Architecture diagrams (before/after) for authentication flow, data flow, and module system

### Phase 2: Fixes

Applied prioritized fixes — P0 critical security first, then P1, then quality and architecture:

| Priority | Fixes | Examples |
|----------|-------|---------|
| **P0 Critical** | 4 | Cookie `secure`+`sameSite` flags, XSS via `dangerouslySetInnerHTML`, JWT payload validation, `.gitignore` hardening |
| **P1 High** | 4 | CSP/HSTS security headers, fetch timeout (10s), open redirect validation, `rel="noopener noreferrer"` on 7 files |
| **Quality** | 3 | Toast memory leak (1M ms → 5s), misplaced import, `notFound()` → `redirect()` |
| **Architecture** | 2 | `<div onClick>` → `<button>` + `aria-label` (a11y), removed `setTimeout` leak |
| **Dead Code** | 3 | `contants.ts` → `constants.ts` rename (4 imports), `useEffect` deps fix, unused `types.ts` deleted |
| **Error Handling** | 7 | `any` → generics, `FC` → direct props, error boundary UI, `response.ok` checks, error preservation (`cause`), `resetPassword` re-throw, Suspense fallbacks (3 files) |
| **Code Quality** | 3 | `sleep(5000)` → `setTimeout` with cleanup, `aria-label` on logout button, SVG config dedup |
| **Env Validation** | 3 | `env.ts` with Zod schema, `process.env.X!` → `env.X` in 4 files, file upload 30s timeout |
| **Dependency Cleanup** | 3 | Removed `date-fns`, `react-day-picker`, `@tanstack/react-table` (zero imports) |

### Phase 3: Documentation

Every fix is documented with before/after code, problem description, impact, and solution:

- [`docs/`](./docs/) — 5 audit documents (architecture, refactoring plan, code-level audit)
- [`changelogs/`](./changelogs/) — 7 changelogs with CWE mapping and code diffs

---

## Project Overview

**eCampus KPI** is the frontend of the educational portal of Kyiv Polytechnic Institute. Students use it for grades, certificates, messages, announcements, study sheets, ratings, and more. The backend is a separate REST API (not part of this repo).

- **48 modules** — 11 internal (rendered in Next.js), 37 external (redirect to legacy campus)
- **2 locales** — Ukrainian (default), English
- **Auth** — JWT in httpOnly cookies, middleware-based auth/authorization
- **Users** — students, lecturers, curators, admins

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.4.8 (App Router, Turbopack) |
| UI | React 19.2.0 (Server Components) |
| Language | TypeScript 5.9 (strict mode) |
| Styling | Tailwind CSS 4.1 + shadcn/ui (42 components) |
| i18n | next-intl (Ukrainian / English) |
| Forms | React Hook Form 7 + Zod 4 |
| Auth | JWT (httpOnly cookies, middleware) |
| HTTP | `campusFetch` (custom wrapper over `fetch`) |
| Deploy | Docker multi-stage (node:22-alpine), GitHub Actions CI/CD |

---

## Documentation

### Audit & Architecture

| File | Description |
|------|-------------|
| [`docs/01-audit-findings.md`](./docs/01-audit-findings.md) | Full codebase audit: 38 issues across security, code quality, error handling, performance, a11y, testing, architecture |
| [`docs/Architecture_Old.md`](./docs/Architecture_Old.md) | Architecture **before** refactoring — diagrams, auth flow, data flow, weak points |
| [`docs/03-refactoring-plan.md`](./docs/03-refactoring-plan.md) | Refactoring pipeline — 6 phases, sequence, definition of done |
| [`docs/04-architecture-after.md`](./docs/04-architecture-after.md) | Target architecture **after** refactoring |
| [`docs/05-code-level-audit.md`](./docs/05-code-level-audit.md) | Line-by-line code audit: 66 issues with exact `file:line` refs, code snippets, root cause, fix |

### Changelogs

| File | Description |
|------|-------------|
| [`changelogs/01-security-p0.md`](./changelogs/01-security-p0.md) | P0 critical: `.gitignore`, cookie flags, XSS, JWT validation |
| [`changelogs/02-security-p1.md`](./changelogs/02-security-p1.md) | P1 high: fetch timeout, open redirect, CSP headers, `rel=noopener` (7 files) |
| [`changelogs/03-code-quality.md`](./changelogs/03-code-quality.md) | Quality: toast delay, import placement, `notFound` → `redirect` |
| [`changelogs/04-architecture.md`](./changelogs/04-architecture.md) | Architecture: `div onClick` → `button`, `setTimeout` removal |
| [`changelogs/05-dead-code-cleanup.md`](./changelogs/05-dead-code-cleanup.md) | Dead code: `contants.ts` rename, `useEffect` deps fix, unused `types.ts` deletion |
| [`changelogs/06-code-quality-and-error-handling.md`](./changelogs/06-code-quality-and-error-handling.md) | Phase 3: `any` types, `FC` → direct props, error boundary UI, `response.ok` checks, error preservation, Suspense fallbacks, SVG config dedup |
| [`changelogs/07-env-validation-and-deps.md`](./changelogs/07-env-validation-and-deps.md) | `env.ts` with Zod validation, file upload timeout, removed 3 unused npm deps (`date-fns`, `react-day-picker`, `@tanstack/react-table`) |

---

## Key Findings (Highlights)

### Critical Security

- **XSS** — Email content rendered via `dangerouslySetInnerHTML` without sanitization (`preview-dialog.tsx:47`)
- **Cookie security** — Auth cookies missing `secure` and `sameSite` flags (`auth.actions.ts:24-25`)
- **JWT** — Decoded without payload validation; `exp` and `modules` not schema-validated (`jwt.ts:6`)
- **Secrets in git** — `.gitignore` only ignored `.env`, not `.env.production` or `.env.local`

### Architecture

- JWT decoded (not verified) in middleware — payload fully client-controlled
- `campusFetch` defaults to `cache: 'no-cache'` — no API-level caching
- 3 different error handling patterns across server actions (throw / return `[]` / return `null`)
- Error boundary renders `<></>` — user sees blank white screen on errors

### Code Quality

- Toast removal delay set to 1,000,000ms (~16 minutes) — memory leak
- Import statement placed in the middle of a file (between function definitions)
- Interactive `<div onClick>` instead of `<button>` — not keyboard-accessible

---

## Author

**Denys Stepanenko** — Software Engineer (.NET | Full-Stack)

Software Engineering student at KPI. Background in .NET backend, full-stack React, and algorithms (3000+ problems solved across LeetCode, HackerRank, Codeforces). Cybersecurity internship experience at JCB (threat modeling, secure software development).

I take legacy systems and make them production-grade. This project demonstrates my approach: audit first, document everything, fix in priority order, and never break existing functionality.

---

## License

This project is for portfolio demonstration purposes. The original application belongs to Igor Sikorsky Kyiv Polytechnic Institute.
