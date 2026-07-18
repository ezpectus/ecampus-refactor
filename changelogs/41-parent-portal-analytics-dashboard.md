# Changelog: Parent Portal + Analytics Dashboard

## Overview
Added two new major features: **Parent Portal** (parents view their children's grades and attendance) and **Analytics Dashboard** (admin-only analytics with charts for user activity, role distribution, registrations, faculty breakdown, and grade distribution).

## Changes

### Prisma Schema
- Added `PARENT` to `Role` enum
- Added `ParentStudent` model (many-to-many between parent and student users)
- Added `children` and `parents` relations to `User` model

### Parent Portal (`module/parent/`)
- **Server Actions** (`src/actions/parent.actions.ts`):
  - `getChildren()` — cached, returns all children linked to current parent
  - `getChildCourses(studentId)` — cached, returns courses + grades + teacher names
  - `getChildAttendance(studentId)` — cached, returns attendance records with rate
- **UI Components**:
  - `page.tsx` — server component, fetches children, renders in SubLayout
  - `parent-view.tsx` — child selector cards with avatar, GPA, study year
  - `child-detail.tsx` — grades table + attendance bar chart (recharts)
- **Cache tags**: `PARENT_CACHE_TAG` with 60s revalidate

### Analytics Dashboard (`module/analytics/`)
- **Server Actions** (`src/actions/analytics.actions.ts`):
  - `getAnalytics()` — cached, returns comprehensive analytics data:
    - Overview metrics (total users, students, teachers, parents, active students, new this month, avg GPA)
    - Role distribution (pie chart data)
    - Monthly registrations (line chart data)
    - Faculty distribution (horizontal bar chart, top 10)
    - User activity (area chart, last 30 days)
    - Grade distribution (colored bar chart)
- **UI Components**:
  - `page.tsx` — server component, admin-only, fetches analytics
  - `analytics-view.tsx` — 6 metric cards + 5 charts using recharts
- **Cache tags**: `ANALYTICS_CACHE_TAG` with 120s revalidate

### Feature Toggles
- Added `parentPortal` and `analytics` to `FeatureName` type and `DEFAULT_TOGGLES`

### Navigation
- Sidebar: Parent menu item (role=PARENT), Analytics menu item (role=ADMIN)
- Command Palette: Added "Parent Portal" and "Analytics" commands

### Translations
- Added `private.parent.*` and `private.analytics.*` namespaces to `en.json` and `uk.json`
- Added `global.menu.parent` and `global.menu.analytics` to both locale files

## New Files
- `src/actions/parent.actions.ts`
- `src/actions/analytics.actions.ts`
- `src/app/[locale]/(private)/module/parent/page.tsx`
- `src/app/[locale]/(private)/module/parent/components/parent-view.tsx`
- `src/app/[locale]/(private)/module/parent/components/child-detail.tsx`
- `src/app/[locale]/(private)/module/analytics/page.tsx`
- `src/app/[locale]/(private)/module/analytics/components/analytics-view.tsx`

## Modified Files
- `prisma/schema.prisma` — PARENT role, ParentStudent model
- `src/lib/constants/cache-tags.ts` — PARENT_CACHE_TAG, ANALYTICS_CACHE_TAG
- `src/lib/features.ts` — parentPortal, analytics toggles
- `src/components/app-sidebar/app-sidebar.tsx` — parent + analytics menu items
- `src/components/command-palette/command-palette.tsx` — parent + analytics commands
- `src/messages/en.json` — parent + analytics translations
- `src/messages/uk.json` — parent + analytics translations
