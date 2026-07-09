import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@/generated/prisma/client";

// Next.js hot-reload creates fresh module scopes; cache the client on
// globalThis in dev so we don't exhaust the connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg(
    {
      connectionString: process.env.DATABASE_URL,
      // Without this, a stalled handshake to the pooler waits indefinitely —
      // every page (not just transactions) can hang for 20s+ instead of
      // failing fast into the "ลองใหม่อีกครั้ง" error boundary.
      connectionTimeoutMillis: 10_000,
      // TCP keepalive so an AWS load balancer / PgBouncer sitting between us
      // and Supabase doesn't silently drop an idle connection out from
      // under a pending query.
      keepAlive: true,
    },
    {
      // node-postgres's Pool is an EventEmitter: an 'error' from an idle
      // client with no listener throws and can crash the whole process.
      // The pooled Supabase connection drops idle clients occasionally —
      // log it instead of taking the server down.
      onPoolError: (error) => {
        console.warn("[db] pool connection error (idle client dropped):", error.message);
      },
      onConnectionError: (error) => {
        console.warn("[db] connection error:", error.message);
      },
    },
  );
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

// Error codes that mean "the pooled Supabase connection is unavailable right
// now", not "the request/data is invalid". Callers on the request path
// (server actions especially — a page's own error boundary won't catch
// something thrown before render) should catch this and return a retryable
// message instead of letting it surface as a raw 500.
const CONNECTIVITY_ERROR_CODES = new Set([
  "P1001", // can't reach database server
  "P1002", // database server was reached but timed out
  "P1008", // operation timed out
  "P1017", // server closed the connection
  "P2024", // timed out fetching a connection from the pool
  "P2028", // transaction API error (see src/lib/prisma.ts transactionOptions)
]);

export function isDbUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return CONNECTIVITY_ERROR_CODES.has(error.code);
  }
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientUnknownRequestError
  );
}
