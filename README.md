# Student Portal — Modern Student Management Platform

A production-grade SaaS web application for educational institutions. Built with Next.js 15, React 19, and TypeScript. Features grades management, messaging, announcements, certificates, profiles, user registration, and a marketing landing page. Dockerized, multi-tenant ready, and fully typed.

---

## Features

### Student
- **Grades & Academic Performance** — view grades by semester, GPA, credit modules, attestation results
- **Schedule** — weekly timetable with course, room, and teacher info
- **Messages** — send and receive messages with faculty, groups, and individual students
- **Certificates** — request official documents, track status, download PDF
- **Profile** — manage contacts, bio, avatar, and account settings
- **Announcements** — institution-wide and course-level notices
- **Directory** — search faculty and staff by name, department, or contact type

### Faculty / Staff
- **Certificate Management** — approve, reject, sign, and process student certificate requests
- **Announcement Editor** — create, edit, and publish announcements with audience targeting
- **Student Directory** — search and view student contact information

### Admin
- **User Management** — create, edit, deactivate users; assign roles
- **Course Management** — create courses, assign teachers, manage enrollments
- **System Settings** — configure app name, logo, locales, feature flags

### Platform
- **Authentication** — JWT-based with httpOnly cookies, middleware route protection, user registration
- **Multi-locale** — Ukrainian (default) and English, extensible to any locale
- **Server-Side Rendering** — all pages SSR with ISR caching (5-min revalidate)
- **Security** — CSP headers, HSTS, cookie security flags, env validation (Zod), URL allow-listing
- **Responsive** — mobile-first design with TailwindCSS, works on all breakpoints
- **Accessible** — ARIA labels, keyboard navigation, semantic HTML

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack, Server Components) |
| UI | React 19, TailwindCSS 4, Radix UI primitives |
| Language | TypeScript 5.9 (strict mode) |
| Forms | React Hook Form 7 + Zod 4 validation |
| i18n | next-intl (Ukrainian / English) |
| Auth | JWT in httpOnly cookies, middleware-based |
| Icons | Centralized SVG index (@svgr/webpack) |
| Deploy | Docker multi-stage (node:22-alpine), standalone output |
| Testing | Vitest (planned), Playwright (planned) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  React 19 Server Components + Client Components          │
│  TailwindCSS + Radix UI                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Next.js 15 (App Router)                     │
│                                                         │
│  Middleware          │  Server Components (SSR/ISR)     │
│  - Auth check        │  - Data fetching via Server      │
│  - i18n routing      │    Actions (apiFetch)            │
│  - Route protection  │  - ISR cache (revalidate: 300s)  │
│                      │  - Metadata generation           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              REST API (Backend)                          │
│  ASP.NET Core / External API                            │
│  - JWT authentication                                   │
│  - User, Course, Grade, Message endpoints               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              PostgreSQL                                  │
│  Users, Organizations, Courses, Grades, Messages,       │
│  Notifications, Files                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- Docker (optional, for containerized deployment)

### Development

```bash
# Clone the repo
git clone https://github.com/yourusername/student-portal.git
cd student-portal

# Copy environment file
cp .env.example .env.development

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t student-portal .
docker run -p 3000:3000 student-portal
```

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-prefixed routes
│   │   ├── (private)/         # Authenticated pages
│   │   │   ├── module/        # Core modules (grades, messages, etc.)
│   │   │   ├── profile/       # User profile
│   │   │   ├── settings/      # Account settings
│   │   │   └── contacts/      # Contact directory
│   │   └── (public)/          # Unauthenticated pages
│   │       ├── (auth)/        # Login, registration, password reset
│   │       └── landing/       # Marketing landing page
│   ├── images/                # Centralized SVG icon index
│   └── layout.tsx             # Root layout
├── actions/                   # Server Actions (API calls)
├── components/                # Reusable UI components
│   ├── ui/                    # Base components (button, table, dialog, etc.)
│   ├── typography/            # Heading, Paragraph, Description
│   └── utils/                 # Show (conditional render), etc.
├── hooks/                     # Custom React hooks
├── lib/                       # Core libraries
│   ├── client.ts              # API fetch wrapper
│   ├── env.ts                 # Zod-validated environment variables
│   └── constants/             # Shared constants (cookies, cache tags, page sizes)
├── types/                     # TypeScript types and domain models
├── middleware/                # Auth and i18n middleware
└── i18n/                      # Locale routing configuration
```

---

## Key Design Decisions

### Server-Side Rendering
All pages are server components that fetch data via Server Actions. No client-side loading spinners — data is ready on first render. Interactive parts (filters, tabs) are isolated into small client components.

### ISR Caching
GET requests cache for 5 minutes (`revalidate: 300`). Mutations invalidate cache via `revalidateTag` / `revalidatePath`. This eliminates unnecessary API calls while keeping data fresh.

### Centralized Icon System
All SVG icons are imported from a single index (`@/app/images`). This prevents duplicate imports, simplifies icon management, and ensures consistent SVGO optimization.

### Error Handling
Two patterns, used consistently:
- **Throw** on non-OK — for mutations and critical reads (caller shows error toast)
- **Return safe default** — for list/search reads where the page can render an empty state

### Environment Validation
All environment variables are validated through a Zod schema at startup. No `process.env.X!` assertions — if a variable is missing, the app fails fast with a clear error.

---

## Security

- **JWT** stored in httpOnly cookies (not accessible via JavaScript)
- **JWT validation** — Zod-validated token payload extraction (no unverified decode)
- **Cookie flags** — `secure` and `sameSite: 'lax'` in production
- **CSP** — Content-Security-Policy header on all routes
- **HSTS** — Strict-Transport-Security with preload
- **Environment validation** — Zod schema, no unvalidated env access
- **URL allow-listing** — external redirects validated against trusted domains
- **IP header sanitization** — X-Forwarded-For and X-Real-IP headers sanitized against spoofing
- **Rate limiting** — planned (Redis-backed) for auth endpoints

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build (Turbopack) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run tsc` | Type-check without emitting |

---

## Docker Configuration

The Dockerfile uses a multi-stage build:

1. **deps** — install npm dependencies
2. **builder** — build the Next.js standalone output
3. **runner** — minimal production image (node:22-alpine, non-root user)

`docker-compose.yml` includes the app service with configurable environment variables. PostgreSQL service can be added for self-hosted backend.

---

## License

This project is for portfolio demonstration purposes.

---

## Author

**Denys Stepanenko** — Software Engineer (.NET | Full-Stack)

Software Engineering student. Background in .NET backend, full-stack React, and algorithms (3000+ problems solved across LeetCode, HackerRank, Codeforces). Cybersecurity internship experience at JCB (threat modeling, secure software development).
