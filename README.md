# Inventory

Multi-tenant inventory management SaaS. Next.js App Router · strict TypeScript · Prisma 7 · Supabase PostgreSQL · Auth.js · shadcn/ui.

## Setup

1. Copy the env template and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   npx auth secret   # fills AUTH_SECRET
   ```

   `DATABASE_URL` is the **pooled** connection string (port 6543, `?pgbouncer=true`),
   `DIRECT_URL` is the **direct** one (port 5432). Both are on the Supabase
   dashboard under *Connect → ORMs → Prisma*.

2. Install and migrate:

   ```bash
   npm install
   npm run db:migrate   # creates the initial migration against Supabase
   ```

3. Run:

   ```bash
   npm run dev
   ```

   Sign up at `/sign-up` — this creates your organization and makes you its owner.

## Architecture

- `src/app` — routes only; thin pages that compose feature modules.
- `src/features/<name>` — one folder per domain feature: `schemas.ts` (Zod, shared client/server), `queries.ts` (server-only reads, return serializable rows), `actions.ts` (server actions, tenant-scoped writes), `components/`.
- `src/components/shared` — reusable app-level pieces (DataTable, EmptyState, PageHeader, ConfirmDialog…).
- `src/components/ui` — generated shadcn/ui primitives.
- `src/lib` — cross-cutting infrastructure (Prisma client, auth, session, action result types).

### Invariants

- **Tenant isolation**: every query/mutation filters by `organizationId` from the session (`requireSession()`). Writes use `updateMany`/`deleteMany` so the org filter is part of the WHERE clause.
- **Stock is a ledger**: `Product.quantity` is a cached balance of immutable `StockMovement` rows, updated in the same transaction. Never mutate it directly.
- **Serialization boundary**: `queries.ts` maps Prisma entities (Decimal, relations) to plain row types before they reach client components.

## Roadmap

- [x] M0 — scaffold, schema, auth, app shell
- [x] M1 — categories & products CRUD
- [ ] M2 — stock movements (in/out/adjust)
- [ ] M3 — dashboard charts (Recharts) & Excel export (ExcelJS)
- [ ] M4 — suppliers & purchase orders
