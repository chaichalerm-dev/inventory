import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js hot-reload creates fresh module scopes; cache the client on
// globalThis in dev so we don't exhaust the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // Without this, a stalled handshake to the pooler waits indefinitely —
    // every page (not just transactions) can hang for 20s+ instead of
    // failing fast into the "ลองใหม่อีกครั้ง" error boundary.
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({
    adapter,
    // The pooled Supabase connection can take several seconds to acquire
    // under load; Prisma's 2s/5s defaults trip P2028 well before that.
    transactionOptions: { maxWait: 10_000, timeout: 15_000 },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
