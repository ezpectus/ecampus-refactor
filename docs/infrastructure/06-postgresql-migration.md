# PostgreSQL Migration Guide

This project supports both SQLite (development) and PostgreSQL (production) via Prisma.

## Current Setup

- **Development**: SQLite at `file:./dev.db` (zero config, fast startup)
- **Production**: PostgreSQL schema ready at `prisma/schema-postgres.prisma`

## Migration Steps

### 1. Provision a PostgreSQL database

Options:

- **Neon** (recommended, serverless): https://neon.tech
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Self-hosted**: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:16`

### 2. Set `DATABASE_URL`

```bash
# .env.production
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

### 3. Generate Prisma Client with PostgreSQL schema

```bash
# Use the PostgreSQL config
npx prisma generate --schema=prisma/schema-postgres.prisma

# Push schema to database
npx prisma db push --schema=prisma/schema-postgres.prisma

# Or create and run migrations
npx prisma migrate dev --schema=prisma/schema-postgres.prisma --name init
```

### 4. Seed the database

```bash
npx tsx prisma/seed.ts
```

### 5. Verify

```bash
# Check health endpoint
curl https://your-app.com/api/ready
```

## Schema Differences

The PostgreSQL schema (`prisma/schema-postgres.prisma`) is identical to the SQLite schema
(`prisma/schema.prisma`) except for the datasource provider. All models, relations, and
indexes are the same.

## Rollback

To revert to SQLite:

```bash
# Set DATABASE_URL back to SQLite
DATABASE_URL="file:./dev.db"

# Regenerate client
npx prisma generate
```

## Notes

- The Prisma client output is the same directory (`src/generated/prisma/`) for both schemas.
- Only one schema can be active at a time (determined by `DATABASE_URL`).
- The `prisma.config.ts` and `prisma-postgres.config.ts` files control which schema is used.
