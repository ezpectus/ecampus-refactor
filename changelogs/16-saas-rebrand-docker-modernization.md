# Changelog 16 — SaaS Rebranding & Docker Modernization

**Date:** 18.07.2026
**Scope:** 5 files modified, 2 files created
**Audit References:** SaaS transformation roadmap (Phase 1)

---

## 1. Rewrite README as SaaS product (1 file)

**File:** `README.md`

**Problem:** The README was framed as "eCampus KPI — Legacy Refactoring" — a university-specific refactoring project. This doesn't present well as a portfolio piece for clients on Upwork.

**Fix:** Complete rewrite as "Student Portal — Modern Student Management Platform":
- Product description with features grouped by role (Student, Faculty, Admin, Platform)
- Tech stack table (Next.js 15, React 19, TypeScript, TailwindCSS, Docker)
- Architecture diagram (Client → Next.js → REST API → PostgreSQL)
- Quick start guide (development + Docker)
- Project structure tree
- Key design decisions (SSR, ISR, icons, error handling, env validation)
- Security features list
- Scripts reference table
- Docker configuration description
- Removed all KPI references, changelog listing, audit doc references

---

## 2. Rename package (1 file)

**File:** `package.json`

**Fix:** Renamed from `ecampus.kpi.ua.next` → `student-portal`.

---

## 3. Modernize Docker setup (2 files)

**Files:** `Dockerfile`, `docker-compose.yml`

**Dockerfile:**
- Removed `NEXT_PUBLIC_KPI_ID_APP_ID` build arg and env (KPI-specific OAuth)

**docker-compose.yml:**
- Renamed service from `ecampus` → `student-portal`
- Renamed container from `ecampus-kpi-ua-local` → `student-portal`
- Changed port mapping from `80:3000` → `3000:3000` (standard)
- Replaced KPI-specific env vars with generic ones (`API_BASE_URL`)
- Removed `OLD_CAMPUS_URL` (no external campus redirect)
- Added PostgreSQL 17 service with healthcheck
- Added named volume `pgdata` for database persistence
- Added `depends_on` with health condition

---

## 4. Add .env.example (1 file created)

**File:** `.env.example`

**Purpose:** Template for environment configuration with generic variable names. New developers can `cp .env.example .env.development` to get started. Includes comments for each section.

---

## 5. Add SaaS transformation roadmap (1 file created, gitignored)

**File:** `docs/saas-transformation-roadmap.md`

**Purpose:** Internal planning document with 10 phases covering the full transformation from KPI-specific portal to generic SaaS product. Gitignored — not committed to repo.

**Phases:**
1. Portfolio-Ready Packaging (current)
2. De-KPI-fy the Codebase
3. Registration & User Management
4. Core SaaS Modules
5. Multi-Tenant Architecture
6. Backend API (ASP.NET Core)
7. DevOps & Deployment
8. Polish & Portfolio Presentation
9. Advanced Features
10. Quality Assurance

---

## Commit message

```
feat: rebrand as Student Portal SaaS, modernize Docker setup

- Rewrite README as "Student Portal — Modern Student Management
  Platform" with architecture diagram, features by role, quick start
- Rename package from ecampus.kpi.ua.next to student-portal
- Modernize docker-compose: rename service, add PostgreSQL 17 with
  healthcheck, use generic env vars, add volume for data persistence
- Remove KPI ID build arg from Dockerfile
- Add .env.example with generic variable names
- Add SaaS transformation roadmap (gitignored, 10 phases)
```
