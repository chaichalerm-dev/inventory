// Prisma 7 no longer auto-loads .env — dotenv must be imported here so the
// CLI (migrate, studio) sees DATABASE_URL / DIRECT_URL.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need the direct (non-pooled) Supabase connection.
    url: process.env.DIRECT_URL,
  },
});
