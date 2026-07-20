import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema-postgres.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/student-portal',
  },
});
